/**
 * Gera um preview do site em UM arquivo HTML só (CSS, JS e fontes embutidos),
 * que abre direto no navegador, sem servidor.
 *
 *   VITE_ROUTER=hash npm run build && node scripts/gerar-preview.mjs
 *
 * A saída fica em preview/sonhos-de-brincar.html
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(raiz, 'dist');

const FONTES =
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700' +
  '&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500' +
  '&family=Quicksand:wght@400;500;600;700&display=swap';

const NAVEGADOR =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** Baixa o CSS das fontes e troca as URLs dos arquivos por data: URI (só latim). */
async function fontesEmbutidas() {
  const css = await (await fetch(FONTES, { headers: { 'User-Agent': NAVEGADOR } })).text();

  const blocos = css
    .split('@font-face')
    .slice(1)
    .map((b) => '@font-face' + b)
    // mantém apenas os subconjuntos latinos — o resto é peso à toa
    .filter((b) => /U\+0000-00FF|U\+0100-02(4F|BA)/.test(b));

  const urls = [...new Set(blocos.join('').match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) ?? [])];

  const mapa = new Map();
  for (const url of urls) {
    const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
    mapa.set(url, `data:font/woff2;base64,${bin.toString('base64')}`);
    process.stdout.write(`  fonte embutida (${Math.round(bin.length / 1024)} kB)\n`);
  }

  return blocos.join('\n').replace(/https:\/\/fonts\.gstatic\.com\/[^)]+/g, (u) => mapa.get(u) ?? u);
}

const TIPOS = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

/** Lista as imagens de public/ com o caminho que elas têm no site. */
function imagensPublicas(pasta = resolve(raiz, 'public'), prefixo = '') {
  const achadas = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) {
      achadas.push(...imagensPublicas(caminho, `${prefixo}/${nome}`));
      continue;
    }
    const tipo = TIPOS[extname(nome).toLowerCase()];
    if (tipo) achadas.push({ web: `${prefixo}/${nome}`, caminho, tipo });
  }
  return achadas;
}

/** Troca os caminhos das imagens por data: URI, para o arquivo funcionar sozinho. */
function embutirImagens(js) {
  let resultado = js;
  for (const img of imagensPublicas()) {
    if (!resultado.includes(img.web)) continue;
    const dados = readFileSync(img.caminho).toString('base64');
    resultado = resultado.split(img.web).join(`data:${img.tipo};base64,${dados}`);
    console.log(`  imagem embutida: ${img.web}`);
  }
  return resultado;
}

const indice = readFileSync(resolve(dist, 'index.html'), 'utf8');
const arquivoCss = indice.match(/href="\/(assets\/[^"]+\.css)"/)?.[1];
const arquivoJs = indice.match(/src="\/(assets\/[^"]+\.js)"/)?.[1];
if (!arquivoCss || !arquivoJs) throw new Error('Rode "npm run build" antes de gerar o preview.');

const css = readFileSync(resolve(dist, arquivoCss), 'utf8');
const js = readFileSync(resolve(dist, arquivoJs), 'utf8');
const favicon = readFileSync(resolve(raiz, 'public/favicon.svg'), 'utf8');

console.log('Baixando fontes…');
const fontes = await fontesEmbutidas();

console.log('Embutindo imagens…');
// evita que "</script>" dentro do bundle feche a tag antes da hora
const jsSeguro = embutirImagens(js).replace(/<\/script>/gi, '<\\/script>');

// o charset precisa vir nos primeiros bytes, senão os acentos quebram ao abrir o arquivo direto
const html = `<meta charset="utf-8" />
<title>Sonhos de Brincar</title>
<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}" />
<style>
${fontes}
${css}
</style>
<div id="root"></div>
<script type="module">
${jsSeguro}
</script>
`;

mkdirSync(resolve(raiz, 'preview'), { recursive: true });
const saida = resolve(raiz, 'preview/sonhos-de-brincar.html');
writeFileSync(saida, html);
console.log(`\nPreview pronto: ${saida} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
