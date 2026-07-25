// One-time asset pipeline: generates a studio reference photo per haircut via
// OpenAI, then extracts a clean transparent hair-only PNG using our own
// on-device MediaPipe hair segmenter (served locally to sidestep this
// sandbox's flaky CDN-through-proxy path — the production app itself still
// loads MediaPipe from the CDN normally, since real users don't have this
// issue). Run once; commit the resulting PNGs to public/hair-assets/.
import 'dotenv/config';
import { chromium } from 'playwright';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REF_DIR = path.join(__dirname, 'harness', 'images');
const OUT_DIR = path.join(ROOT, 'public', 'hair-assets');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'hairAssetManifest.json');
mkdirSync(REF_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY não encontrada (rode com --env-file=server/.env ou exporte a variável).');
  process.exit(1);
}

const PILOT_CUTS = [
  {
    id: 'chanel-longo',
    prompt:
      'Professional studio portrait photo of a young woman with a chin-length bob haircut (chanel bob), medium brown natural hair color, facing camera directly, neutral plain light gray background, soft even studio lighting, salon photography, high detail, realistic, shoulders visible, no hat, no glasses',
  },
  {
    id: 'pixie-cut',
    prompt:
      'Professional studio portrait photo of a young woman with a short pixie haircut, textured and tousled on top, medium brown natural hair color, facing camera directly, neutral plain light gray background, soft even studio lighting, salon photography, high detail, realistic, shoulders visible, no hat, no glasses',
  },
  {
    id: 'long-layers',
    prompt:
      'Professional studio portrait photo of a young woman with long straight hair past the shoulders with soft layers, medium brown natural hair color, facing camera directly, neutral plain light gray background, soft even studio lighting, salon photography, high detail, realistic, shoulders and upper chest visible, no hat, no glasses',
  },
  {
    id: 'ondulado-longo',
    prompt:
      'Professional studio portrait photo of a young woman with long loose beach waves past the shoulders, medium brown natural hair color, facing camera directly, neutral plain light gray background, soft even studio lighting, salon photography, high detail, realistic, shoulders and upper chest visible, no hat, no glasses',
  },
  {
    id: 'crespo-natural',
    prompt:
      'Professional studio portrait photo of a young Black woman with a natural voluminous coily afro hairstyle, dark brown natural hair color, facing camera directly, neutral plain light gray background, soft even studio lighting, salon photography, high detail, realistic, shoulders visible, no hat, no glasses',
  },
  {
    id: 'wolf-cut',
    prompt:
      'Professional studio portrait photo of a young woman with a shoulder-length wolf cut haircut, lots of layers and volume on top with wavy texture, medium brown natural hair color, facing camera directly, neutral plain light gray background, soft even studio lighting, salon photography, high detail, realistic, shoulders visible, no hat, no glasses',
  },
];

async function generateReference(id, prompt) {
  const outPath = path.join(REF_DIR, `${id}.png`);
  if (existsSync(outPath)) {
    console.log(`[gen] ${id}: já existe, pulando geração`);
    return outPath;
  }
  console.log(`[gen] ${id}: gerando referência...`);
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', quality: 'medium', n: 1 }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[gen] ${id}: OpenAI error: ${data.error?.message}`);
  }
  const buffer = Buffer.from(data.data[0].b64_json, 'base64');
  writeFileSync(outPath, buffer);
  console.log(`[gen] ${id}: salvo (${buffer.length} bytes)`);
  return outPath;
}

async function extractCutout(page, id) {
  const outPath = path.join(OUT_DIR, `${id}.png`);
  let ok = false;
  for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
    await page.goto(`http://localhost:8899/index.html?src=images/${id}.png`, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForFunction(() => window.__done === true, { timeout: 20000 });
      ok = true;
    } catch {
      console.log(`[extract] ${id}: tentativa ${attempt} falhou, tentando de novo...`);
    }
  }
  if (!ok) throw new Error(`[extract] ${id}: não completou depois de 5 tentativas`);
  const error = await page.evaluate(() => window.__error || null);
  if (error) throw new Error(`[extract] ${id}: ${error}`);
  const bbox = await page.evaluate(() => window.__bbox);
  if (!bbox || bbox.hairPixels < 500) {
    throw new Error(`[extract] ${id}: poucos pixels de cabelo detectados (${bbox?.hairPixels ?? 0}) — a referência pode não ter ficado boa.`);
  }
  const anchor = await page.evaluate(() => window.__anchor);
  if (!anchor) {
    throw new Error(`[extract] ${id}: não detectou rosto na referência — não dá pra calibrar a posição.`);
  }
  const dataUrl = await page.evaluate(() => window.__resultDataUrl);
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  writeFileSync(outPath, Buffer.from(base64, 'base64'));
  console.log(`[extract] ${id}: cutout salvo em public/hair-assets/${id}.png`);
  return anchor;
}

async function main() {
  const only = process.argv[2] ? process.argv.slice(2) : null;
  const cuts = only ? PILOT_CUTS.filter((c) => only.includes(c.id)) : PILOT_CUTS;

  for (const cut of cuts) {
    await generateReference(cut.id, cut.prompt);
  }

  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: [
      '--no-sandbox',
      ...(proxy ? [`--proxy-server=${proxy}`, '--proxy-bypass-list=localhost;127.0.0.1', '--ignore-certificate-errors'] : []),
    ],
  });
  const page = await browser.newPage();
  const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
  for (const cut of cuts) {
    manifest[cut.id] = await extractCutout(page, cut.id);
  }
  await browser.close();
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifesto salvo em src/data/hairAssetManifest.json (${Object.keys(manifest).length} cortes).`);
  console.log('Concluído.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
