// Catálogo público (nomes e descrições em português). Os prompts em inglês
// usados pela IA ficam SOMENTE no servidor (server/prompts/) e nunca chegam
// ao navegador.

export type Fringe = 'none' | 'full' | 'curtain' | 'side' | 'micro' | 'wispy';
export type Texture = 'straight' | 'wavy' | 'curly' | 'coily';
export type HairStyle = 'loose' | 'braids' | 'locs' | 'twists' | 'updo' | 'shaved';

export interface HairLook {
  length: number;
  volume: number;
  layers: number;
  fringe: Fringe;
  texture: Texture;
  style: HairStyle;
}

export interface Haircut {
  kind: 'cut';
  id: string;
  name: string;
  aka: string[];
  description: string;
  look: HairLook;
  category: string;
  /** foto da modelo com este corte (src/assets/model/cuts/<id>.jpg), se existir */
  photo?: string;
}

export interface HairColor {
  kind: 'color';
  id: string;
  name: string;
  aka: string[];
  description: string;
  swatch: string[];
  category: string;
}

export type CatalogItem = Haircut | HairColor;

export interface Category<T> {
  key: string;
  label: string;
  items: T[];
}

const CUT_CATEGORIES: [key: string, label: string][] = [
  ['chanel-bob', 'Chanel e Bob'],
  ['curtos', 'Curtos'],
  ['medios', 'Médios'],
  ['longos', 'Longos'],
  ['franjas', 'Com franja'],
  ['cacheados-crespos', 'Cacheados e crespos'],
  ['trancas-locs', 'Tranças, locs e twists'],
  ['retro-tendencias', 'Retrô, ícones e tendências'],
];

const COLOR_CATEGORIES: [key: string, label: string][] = [
  ['loiros', 'Loiros'],
  ['castanhos-pretos', 'Castanhos e pretos'],
  ['ruivos-acobreados', 'Ruivos e acobreados'],
  ['mechas-tecnicas', 'Mechas e técnicas'],
  ['fantasia', 'Cores fantasia'],
  ['grisalhos-naturais', 'Grisalhos e prateados'],
];

type RawCut = Omit<Haircut, 'kind' | 'category'>;
type RawColor = Omit<HairColor, 'kind' | 'category'>;

const cutFiles = import.meta.glob<RawCut[]>('./data/cuts/*.json', { eager: true, import: 'default' });
const colorFiles = import.meta.glob<RawColor[]>('./data/colors/*.json', { eager: true, import: 'default' });
// Fotos da modelo: basta colocar <id-do-corte>.jpg na pasta que o cartão passa a usar a foto
const cutPhotos = import.meta.glob<string>('../assets/model/cuts/*.jpg', { eager: true, import: 'default' });
const photoById = new Map(Object.entries(cutPhotos).map(([path, url]) => [path.split('/').pop()!.replace(/\.jpg$/, ''), url]));

function keyOf(path: string) {
  return path
    .split('/')
    .pop()!
    .replace(/\.json$/, '');
}

function build<Raw, T>(
  files: Record<string, Raw[]>,
  order: [string, string][],
  toItem: (raw: Raw, category: string) => T,
): Category<T>[] {
  const byKey = new Map(Object.entries(files).map(([path, items]) => [keyOf(path), items]));
  const known = order.filter(([key]) => byKey.has(key));
  // Arquivos novos que ainda não estão na lista de ordem aparecem no final.
  const extra: [string, string][] = [...byKey.keys()]
    .filter((key) => !order.some(([k]) => k === key))
    .map((key) => [key, key.replace(/-/g, ' ')]);
  return [...known, ...extra].map(([key, label]) => ({
    key,
    label,
    items: (byKey.get(key) ?? []).map((raw) => toItem(raw, key)),
  }));
}

export const cutCategories: Category<Haircut>[] = build(cutFiles, CUT_CATEGORIES, (raw, category) => ({
  ...raw,
  aka: raw.aka ?? [],
  kind: 'cut',
  category,
  photo: photoById.get((raw as RawCut).id),
}));

export const colorCategories: Category<HairColor>[] = build(colorFiles, COLOR_CATEGORIES, (raw, category) => ({
  ...raw,
  aka: raw.aka ?? [],
  kind: 'color',
  category,
}));

export const allCuts = cutCategories.flatMap((c) => c.items);
export const allColors = colorCategories.flatMap((c) => c.items);
