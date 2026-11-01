// Renderiza um vídeo (página HTML) quadro a quadro (Playwright + ffmpeg).
//
//   node marketing/video-anuncio/render.mjs --format v                 -> out/beauty-and-self-9x16.mp4
//   node marketing/video-anuncio/render.mjs --format h                 -> out/beauty-and-self-16x9.mp4
//   node marketing/video-anuncio/render.mjs --page video-expectativa.html --name beauty-and-self-expectativa --format v
//   node marketing/video-anuncio/render.mjs --format v --stills 1,4.5  -> PNGs para revisão
//
// Opções: --page video.html  --name beauty-and-self  --fps 30  --crf 18  --audio out/trilha-indecisao.wav
//         --out <arquivo>  --from 0 --to 22
//         --frames png  (captura sem perdas; padrão jpeg q96, ~4x mais rápido)
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
const format = (args.format || 'v').startsWith('h') ? 'h' : 'v';
const fps = Number(args.fps || 30);
const W = format === 'v' ? 1080 : 1920;
const H = format === 'v' ? 1920 : 1080;
const FRAME_TYPE = args.frames === 'png' ? 'png' : 'jpeg';
const PAGE = args.page || 'video.html';
const NAME = args.name || 'beauty-and-self';
const CRF = String(args.crf || 18);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.wav': 'audio/wav' };
function serve(root) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
        const file = path.join(root, rel || 'video.html');
        if (!file.startsWith(root)) throw new Error('forbidden');
        const body = await readFile(file);
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404); res.end();
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const server = await serve(HERE);
const port = server.address().port;
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[page error]', e.message));
await page.goto(`http://127.0.0.1:${port}/${PAGE}?format=${format}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
const stageBox = { x: 0, y: 0, width: W, height: H };

if (args.stills) {
  const outDir = path.resolve(args.out || path.join(HERE, 'out', 'stills'));
  await mkdir(outDir, { recursive: true });
  for (const s of String(args.stills).split(',')) {
    const t = Number(s);
    await page.evaluate((tt) => window.seek(tt), t);
    const file = path.join(outDir, `${PAGE === 'video.html' ? '' : PAGE.replace(/\.html$/, '') + '-'}${format}-${t.toFixed(2)}.png`);
    await page.screenshot({ path: file, clip: stageBox });
    console.log('still', file);
  }
} else {
  const duration = await page.evaluate(() => window.DURATION);
  const from = Number(args.from || 0);
  const to = Math.min(Number(args.to || duration), duration);
  const out = path.resolve(args.out || path.join(HERE, 'out', `${NAME}-${format === 'v' ? '9x16' : '16x9'}.mp4`));
  await mkdir(path.dirname(out), { recursive: true });
  const audio = args.audio ? path.resolve(args.audio) : null;
  const ff = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', FRAME_TYPE === 'jpeg' ? 'mjpeg' : 'png', '-i', '-',
    ...(audio && existsSync(audio) ? ['-ss', String(from), '-t', String(to - from), '-i', audio] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-r', String(fps), '-movflags', '+faststart',
    ...(audio && existsSync(audio) ? ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest'] : []),
    out,
  ];
  const proc = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round((to - from) * fps);
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = from + i / fps;
    await page.evaluate((tt) => window.seek(tt), t);
    const buf = await page.screenshot({ clip: stageBox, type: FRAME_TYPE, ...(FRAME_TYPE === 'jpeg' ? { quality: 96 } : {}) });
    if (!proc.stdin.write(buf)) await new Promise((r) => proc.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`\r[${format}] frame ${i}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  proc.stdin.end();
  await new Promise((r) => proc.on('close', r));
  console.log(`\n[${format}] pronto: ${out}`);
}

await browser.close();
server.close();
