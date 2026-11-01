import type { CatalogItem, Category } from '../catalog';
import { lengthClass } from './hairFilters';

/** "Chanel de Bico" -> "chanel de bico"; "Loiro Pérola" -> "loiro perola". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();
}

/** Feminino e plural viram a mesma forma: loira/loiras/loiros -> loiro,
 * cacheadas -> cacheado, luzes -> luz, naturais -> natural. Vale para a
 * pesquisa e para o catálogo, então "franja" -> "franjo" dos dois lados. */
export function stem(word: string): string {
  if (word.length <= 3 || /\d/.test(word)) return word;
  let w = word;
  if (/(oes|aes)$/.test(w)) w = `${w.slice(0, -3)}ao`;
  else if (w.endsWith('ais')) w = `${w.slice(0, -3)}al`;
  else if (w.endsWith('eis')) w = `${w.slice(0, -3)}el`;
  else if (w.endsWith('ois')) w = `${w.slice(0, -3)}ol`;
  else if (/(zes|res)$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith('ns')) w = `${w.slice(0, -2)}m`;
  else if (w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('a')) w = `${w.slice(0, -1)}o`;
  return w;
}

// Outras palavras que as pessoas usam para a mesma coisa (já no formato de stem)
const SYNONYMS: Record<string, string> = {
  louro: 'loiro',
  enrolado: 'cacheado',
  channel: 'chanel',
  alisado: 'liso',
  cinzo: 'acinzentado',
  megahair: 'mego', // "mega" vira "mego" no stem
};

// Palavras que não mudam o "tipo" do item: "Loiro Médio" é o loiro básico,
// "Cacheado 3A Definido" é um cacheado natural.
const BASIC = new Set([
  'natural',
  'medio',
  'classico',
  'tradicional',
  'simple',
  'basico',
  'normal',
  'definido',
  'cut',
  'hair',
]);
const isBasic = (w: Word) => BASIC.has(w.stem) || /^[1-4][a-c]$/.test(w.raw); // tipos de cacho: 2A, 3B, 4C…
const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'com', 'e', 'para', 'no', 'na', 'nos', 'nas', 'em', 'o', 'a']);

interface Word {
  raw: string;
  stem: string;
}

interface Indexed<T> {
  item: T;
  order: number;
  /** palavras do nome sem "de", "com"… */
  name: Word[];
  /** cada apelido, no formato de stem (para achar o nome exato) */
  akaPhrases: string[];
  aka: Word[];
  /** tudo junto (nome, apelidos, descrição, categoria e etiquetas), normal e em stem */
  text: string;
  textStem: string;
}

const words = (text: string): Word[] =>
  normalize(text)
    .split(' ')
    .filter(Boolean)
    .map((raw) => ({ raw, stem: stem(raw) }));
const phrase = (ws: Word[]) => ws.map((w) => w.stem).join(' ');

/** Etiquetas tiradas do desenho do corte: "cacheado curto" acha os cacheados curtos. */
function tags(item: CatalogItem): string {
  if (item.kind !== 'cut') return '';
  const { length, texture, fringe, style } = item.look;
  const t: string[] = [lengthClass(length)];
  t.push({ straight: 'liso', wavy: 'ondulado', curly: 'cacheado', coily: 'crespo' }[texture]);
  if (fringe !== 'none') t.push('franja');
  if (style === 'braids') t.push('tranca trancado');
  if (style === 'locs') t.push('locs dread');
  if (style === 'twists') t.push('twist');
  if (style === 'updo') t.push('preso penteado');
  if (style === 'shaved') t.push('raspado');
  return t.join(' ');
}

const cache = new WeakMap<object, Indexed<CatalogItem>[]>();

function indexOf<T extends CatalogItem>(categories: Category<T>[]): Indexed<T>[] {
  const hit = cache.get(categories);
  if (hit) return hit as Indexed<T>[];
  let order = 0;
  const idx = categories.flatMap((cat) =>
    cat.items.map((item) => {
      const all = words(`${item.name} ${item.aka.join(' ')} ${item.description} ${cat.label} ${tags(item)}`);
      return {
        item,
        order: order++,
        name: words(item.name).filter((w) => !STOP.has(w.raw)),
        akaPhrases: item.aka.map((a) => phrase(words(a).filter((w) => !STOP.has(w.raw)))),
        aka: words(item.aka.join(' ')),
        text: ` ${all.map((w) => w.raw).join(' ')}`,
        textStem: ` ${all.map((w) => w.stem).join(' ')}`,
      };
    }),
  );
  cache.set(categories, idx);
  return idx;
}

/** A palavra digitada bate com esta palavra do catálogo? (aceita o começo, para quem ainda está digitando) */
const hits = (q: Word, t: Word) => t.raw.startsWith(q.raw) || t.stem.startsWith(q.stem);

/** Busca tolerante: ignora acentos, maiúsculas, feminino e plural; aceita
 * palavras em qualquer ordem e procura no nome, nos apelidos (inclusive em
 * inglês), na descrição e nas características do corte.
 *
 * Ordem dos resultados: primeiro o nome exato ("loiro" -> o loiro básico),
 * depois os que começam com a palavra (do mais simples ao mais específico:
 * "Loiro Mel" antes de "Loiro Claro Acinzentado"), depois os que têm a
 * palavra no meio do nome ("Balayage Loiro") e por fim os que só citam a
 * palavra nos apelidos ou na descrição. Empates seguem a ordem do catálogo,
 * que já vem dos mais pedidos para os menos. */
export function searchScored<T extends CatalogItem>(
  categories: Category<T>[],
  query: string,
): { item: T; score: number }[] {
  const q = words(query)
    .filter((w, _i, all) => all.length === 1 || !STOP.has(w.raw))
    .map((w) => ({ ...w, stem: SYNONYMS[w.stem] ?? SYNONYMS[w.raw] ?? w.stem }));
  if (!q.length) return [];
  const qPhrase = phrase(q);
  const scored: { item: T; order: number; score: number }[] = [];

  for (const e of indexOf(categories)) {
    // Todas as palavras precisam aparecer em algum lugar
    if (!q.every((w) => e.text.includes(w.raw) || e.textStem.includes(` ${w.stem}`))) continue;

    let score: number;
    const starts = q.length <= e.name.length && q.every((w, i) => hits(w, e.name[i]));
    if (phrase(e.name) === qPhrase || e.akaPhrases.includes(qPhrase)) {
      score = 1000;
    } else if (starts) {
      const extra = e.name.slice(q.length).filter((w) => !isBasic(w)).length;
      score = extra === 0 ? 900 : 700 - 10 * extra;
    } else {
      score = 0;
      for (const w of q) {
        if (e.name.some((t) => hits(w, t))) score += 30;
        else if (e.aka.some((t) => hits(w, t))) score += 12;
        else score += 3;
      }
    }
    scored.push({ item: e.item, order: e.order, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map(({ item, score }) => ({ item, score }));
}

/** Pontuação a partir da qual o nome do item começa com o que foi digitado. */
export const NAME_MATCH = 600;

export function searchCatalog<T extends CatalogItem>(categories: Category<T>[], query: string): T[] {
  return searchScored(categories, query).map((s) => s.item);
}
