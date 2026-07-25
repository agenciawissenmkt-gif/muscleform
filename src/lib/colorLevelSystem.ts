import type { ColorFamily, HairColor } from '../data/haircolors';

function hslToHex(h: number, s: number, l: number): string {
  const S = s / 100;
  const L = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

interface Level {
  n: number;
  name: string;
  lightness: number;
}

/** The International Colour Chart depth scale (1 = black … 10 = lightest
 * blonde) used by professional colorists worldwide (Wella, L'Oréal
 * Professionnel, Schwarzkopf, Alfaparf...). */
const LEVELS: Level[] = [
  { n: 1, name: 'Preto', lightness: 8 },
  { n: 2, name: 'Castanho Muito Escuro', lightness: 15 },
  { n: 3, name: 'Castanho Escuro', lightness: 23 },
  { n: 4, name: 'Castanho Médio', lightness: 31 },
  { n: 5, name: 'Castanho Claro', lightness: 39 },
  { n: 6, name: 'Loiro Escuro', lightness: 48 },
  { n: 7, name: 'Loiro Médio', lightness: 58 },
  { n: 8, name: 'Loiro Claro', lightness: 68 },
  { n: 9, name: 'Loiro Muito Claro', lightness: 78 },
  { n: 10, name: 'Loiro Claríssimo', lightness: 87 },
];

interface Reflect {
  code: string;
  digit: string;
  name: string;
  hue: number;
  sat: number;
  minLevel: number;
  maxLevel: number;
  family?: ColorFamily;
}

/** The reflect/tone scale (.0-.9) that pairs with a depth level to form the
 * shade codes colorists actually use, e.g. "7.3" = level 7, golden reflect. */
const REFLECTS: Reflect[] = [
  { code: '.1', digit: '1', name: 'Acinzentado', hue: 200, sat: 14, minLevel: 4, maxLevel: 10 },
  { code: '.2', digit: '2', name: 'Irisado', hue: 265, sat: 16, minLevel: 5, maxLevel: 10 },
  { code: '.3', digit: '3', name: 'Dourado', hue: 42, sat: 46, minLevel: 3, maxLevel: 10 },
  { code: '.4', digit: '4', name: 'Cobre', hue: 24, sat: 55, minLevel: 4, maxLevel: 9, family: 'ruivo' },
  { code: '.5', digit: '5', name: 'Mogno', hue: 340, sat: 38, minLevel: 3, maxLevel: 8 },
  { code: '.6', digit: '6', name: 'Vermelho', hue: 6, sat: 60, minLevel: 3, maxLevel: 9, family: 'ruivo' },
  { code: '.7', digit: '7', name: 'Marrom Natural', hue: 32, sat: 34, minLevel: 3, maxLevel: 9 },
  { code: '.8', digit: '8', name: 'Perolado', hue: 255, sat: 12, minLevel: 7, maxLevel: 10 },
  { code: '.9', digit: '9', name: 'Acinzentado Intenso', hue: 210, sat: 20, minLevel: 6, maxLevel: 10 },
];

/** Popular double-reflect shades ("beige", "champagne"...) that real
 * professional charts also carry alongside the single-reflect scale. */
const DOUBLE_REFLECTS: { level: number; digits: string; name: string; hue: number; sat: number; family?: ColorFamily }[] = [
  { level: 6, digits: '.34', name: 'Dourado Acobreado', hue: 32, sat: 50 },
  { level: 7, digits: '.13', name: 'Acinzentado Dourado (Beige)', hue: 46, sat: 22 },
  { level: 7, digits: '.31', name: 'Dourado Acinzentado', hue: 40, sat: 28 },
  { level: 7, digits: '.44', name: 'Cobre Intenso', hue: 20, sat: 62 },
  { level: 8, digits: '.13', name: 'Acinzentado Dourado (Beige Claro)', hue: 44, sat: 20 },
  { level: 8, digits: '.34', name: 'Dourado Acobreado Claro', hue: 30, sat: 48 },
  { level: 9, digits: '.13', name: 'Beige Claríssimo', hue: 45, sat: 16 },
  { level: 9, digits: '.31', name: 'Champagne', hue: 42, sat: 20 },
  { level: 5, digits: '.65', name: 'Avermelhado Mogno', hue: 350, sat: 42 },
  { level: 6, digits: '.46', name: 'Acobreado Avermelhado', hue: 14, sat: 58, family: 'ruivo' },
  { level: 4, digits: '.57', name: 'Mogno Acastanhado', hue: 355, sat: 30 },
  { level: 8, digits: '.81', name: 'Perolado Acinzentado', hue: 258, sat: 14 },
];

const digitOf = (code: string) => code.replace('.', '');

function familyFor(level: Level, reflect?: { family?: ColorFamily }): ColorFamily {
  if (reflect?.family) return reflect.family;
  if (level.n <= 1) return 'preto';
  if (level.n <= 5) return 'castanho';
  return 'loiro';
}

function swatchFor(lightness: number, hue: number, sat: number): [string, string] {
  return [hslToHex(hue, sat, lightness), hslToHex(hue, Math.min(sat + 6, 70), Math.min(lightness + 9, 92))];
}

/** Generates the professional depth/reflect color range (levels 1-10 ×
 * reflects .0-.9, plus notable double-reflect shades) — the real numbering
 * system colorists use, rather than a hand-picked handful of named colors. */
export function generateTechnicalColors(): HairColor[] {
  const out: HairColor[] = [];

  for (const level of LEVELS) {
    const [a, b] = swatchFor(level.lightness, 34, level.n <= 2 ? 6 : 24);
    out.push({
      id: `nivel-${level.n}-natural`,
      name: level.name,
      aka: `${level.n}.0`,
      family: familyFor(level),
      origin: 'Internacional',
      description: `Nível ${level.n} da escala internacional de coloração — ${level.name.toLowerCase()} natural, sem reflexo.`,
      swatch: [a, b],
      tags: ['natural', 'tecnico', 'profissional', String(level.n)],
    });
  }

  for (const reflect of REFLECTS) {
    for (let n = reflect.minLevel; n <= reflect.maxLevel; n++) {
      const level = LEVELS[n - 1];
      const [a, b] = swatchFor(level.lightness, reflect.hue, reflect.sat);
      out.push({
        id: `nivel-${level.n}-${reflect.name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
        name: `${level.name} ${reflect.name}`,
        aka: `${level.n}${reflect.code}`,
        family: familyFor(level, reflect),
        origin: 'Internacional',
        description: `Fórmula profissional ${level.n}${reflect.code}: nível ${level.n} (${level.name.toLowerCase()}) com reflexo ${reflect.name.toLowerCase()}.`,
        swatch: [a, b],
        tags: ['tecnico', 'profissional', reflect.name.toLowerCase(), String(level.n)],
      });
    }
  }

  for (const d of DOUBLE_REFLECTS) {
    const level = LEVELS[d.level - 1];
    const [a, b] = swatchFor(level.lightness, d.hue, d.sat);
    out.push({
      id: `nivel-${level.n}-duplo-${digitOf(d.digits)}`,
      name: `${level.name} ${d.name}`,
      aka: `${level.n}${d.digits}`,
      family: familyFor(level, d),
      origin: 'Internacional',
      description: `Fórmula profissional de duplo reflexo ${level.n}${d.digits}: nível ${level.n} (${level.name.toLowerCase()}) ${d.name.toLowerCase()}.`,
      swatch: [a, b],
      tags: ['tecnico', 'profissional', 'duplo-reflexo', String(level.n)],
    });
  }

  return out;
}
