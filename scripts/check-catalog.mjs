// Confere o catálogo: cada corte/cor do app precisa ter o seu prompt no
// servidor (e vice-versa), com campos válidos. Uso: npm run check
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const errors = [];
const warnings = [];
const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FRINGES = ['none', 'full', 'curtain', 'side', 'micro', 'wispy'];
const TEXTURES = ['straight', 'wavy', 'curly', 'coily'];
const STYLES = ['loose', 'braids', 'locs', 'twists', 'updo', 'shaved'];
const COLOR_WORDS =
  /\b(blonde?|brunette|brown|black|red|copper|auburn|ginger|platinum|highlights?|balayage|ombr[eé]|dyed?|caramel|honey|ash(?:y)?|golden)\b/i;
const NON_HAIR = /\b(face|facial|skin|makeup|background|eyes|clothing|woman|girl|lady)\b/i;

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    errors.push(`${path}: JSON inválido (${err.message})`);
    return null;
  }
}

function checkType(type) {
  const pubDir = `src/catalog/data/${type}`;
  const promptDir = `server/prompts/${type}`;
  if (!existsSync(pubDir)) {
    errors.push(`${pubDir} não existe`);
    return 0;
  }
  const seen = new Map();
  let count = 0;
  for (const file of readdirSync(pubDir).filter((f) => f.endsWith('.json'))) {
    const items = readJson(`${pubDir}/${file}`);
    const prompts = readJson(`${promptDir}/${file}`) ?? {};
    if (!Array.isArray(items)) {
      errors.push(`${pubDir}/${file}: deveria ser uma lista`);
      continue;
    }
    const ids = new Set();
    for (const it of items) {
      const where = `${type}/${file.replace('.json', '')}/${it?.id}`;
      count++;
      if (!it?.id || !ID.test(it.id)) errors.push(`${where}: id inválido`);
      if (seen.has(it.id)) errors.push(`${where}: id repetido (também em ${seen.get(it.id)})`);
      seen.set(it.id, file);
      ids.add(it.id);
      if (!it.name || typeof it.name !== 'string') errors.push(`${where}: sem nome`);
      if (!Array.isArray(it.aka)) errors.push(`${where}: aka deveria ser lista`);
      if (!it.description) errors.push(`${where}: sem descrição`);
      else if (it.description.length > 100) warnings.push(`${where}: descrição longa (${it.description.length})`);
      const prompt = prompts[it.id];
      if (typeof prompt !== 'string' || prompt.trim().length < 40) {
        errors.push(`${where}: sem prompt no servidor`);
      } else {
        const words = prompt.trim().split(/\s+/).length;
        if (words > 140) warnings.push(`${where}: prompt muito longo (${words} palavras)`);
        // "face-framing" / "frame the face" são termos de corte (moldura do rosto), não pedem mudar o rosto.
        const hairOnly = prompt.replace(/face[- ]?fram\w*|fram\w* (?:the )?face|around the face|toward the face|away from the face|off the face/gi, '');
        if (NON_HAIR.test(hairOnly)) {
          warnings.push(`${where}: prompt cita algo que não é cabelo ("${hairOnly.match(NON_HAIR)[0]}")`);
        }
        if (type === 'cuts' && COLOR_WORDS.test(prompt)) {
          warnings.push(`${where}: prompt de corte cita cor ("${prompt.match(COLOR_WORDS)[0]}")`);
        }
      }
      if (type === 'cuts') {
        const l = it.look;
        if (!l) errors.push(`${where}: sem look`);
        else {
          for (const k of ['length', 'volume', 'layers']) {
            if (typeof l[k] !== 'number' || l[k] < 0 || l[k] > 1) errors.push(`${where}: look.${k} fora de 0–1`);
          }
          if (!FRINGES.includes(l.fringe)) errors.push(`${where}: look.fringe inválido (${l.fringe})`);
          if (!TEXTURES.includes(l.texture)) errors.push(`${where}: look.texture inválido (${l.texture})`);
          if (!STYLES.includes(l.style)) errors.push(`${where}: look.style inválido (${l.style})`);
        }
      } else if (!Array.isArray(it.swatch) || it.swatch.length < 1 || !it.swatch.every((c) => HEX.test(c))) {
        errors.push(`${where}: swatch inválido`);
      }
    }
    for (const id of Object.keys(prompts)) {
      if (!ids.has(id)) errors.push(`${promptDir}/${file}: prompt "${id}" sem item no catálogo`);
    }
  }
  return count;
}

const cuts = checkType('cuts');
const colors = checkType('colors');

for (const w of warnings) console.warn(`aviso: ${w}`);
for (const e of errors) console.error(`ERRO: ${e}`);
console.log(`\nCatálogo: ${cuts} cortes, ${colors} cores — ${errors.length} erro(s), ${warnings.length} aviso(s).`);
process.exit(errors.length ? 1 : 0);
