// Classificação do corte pelo desenho (look), usada nos filtros rápidos e na busca
// ("cacheado curto"): os dois precisam concordar sobre o que é curto, médio e longo.

export type LengthClass = 'curto' | 'medio' | 'longo';

export function lengthClass(length: number): LengthClass {
  return length < 0.33 ? 'curto' : length >= 0.62 ? 'longo' : 'medio';
}

export const LENGTH_FILTERS: [LengthClass, string][] = [
  ['curto', 'Curto'],
  ['medio', 'Médio'],
  ['longo', 'Longo'],
];

export const TEXTURE_FILTERS: ['straight' | 'wavy' | 'curly' | 'coily', string][] = [
  ['straight', 'Liso'],
  ['wavy', 'Ondulado'],
  ['curly', 'Cacheado'],
  ['coily', 'Crespo'],
];
