import type { CatalogItem, Category } from '../catalog';

/** "Chanel de Bico" -> "chanel de bico"; "Loiro Pérola" -> "loiro perola". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();
}

interface Indexed<T> {
  item: T;
  name: string;
  aka: string;
  rest: string;
}

const cache = new WeakMap<object, Indexed<CatalogItem>[]>();

function indexOf<T extends CatalogItem>(categories: Category<T>[]): Indexed<T>[] {
  const hit = cache.get(categories);
  if (hit) return hit as Indexed<T>[];
  const idx = categories.flatMap((cat) =>
    cat.items.map((item) => ({
      item,
      name: normalize(item.name),
      aka: normalize(item.aka.join(' ')),
      rest: normalize(`${item.description} ${cat.label}`),
    })),
  );
  cache.set(categories, idx);
  return idx;
}

/** Busca tolerante: ignora acentos e maiúsculas, aceita palavras em qualquer
 * ordem e procura no nome, nos apelidos (inclusive em inglês) e na descrição. */
export function searchCatalog<T extends CatalogItem>(categories: Category<T>[], query: string): T[] {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const scored: { item: T; score: number }[] = [];
  for (const entry of indexOf(categories)) {
    const all = `${entry.name} ${entry.aka} ${entry.rest}`;
    if (!words.every((w) => all.includes(w))) continue;
    let score = 0;
    for (const w of words) {
      if (entry.name.startsWith(w)) score += 6;
      else if (entry.name.includes(` ${w}`)) score += 5;
      else if (entry.name.includes(w)) score += 4;
      else if (entry.aka.includes(w)) score += 3;
      else score += 1;
    }
    scored.push({ item: entry.item, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).map((s) => s.item);
}
