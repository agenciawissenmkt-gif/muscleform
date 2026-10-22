// Tailwind CSS 3.4 (e não o 4): o v4 só funciona em navegadores muito novos
// (Safari 16.4+, Chrome 111+). O v3 funciona também em iPhones e Androids antigos.
import plugin from 'tailwindcss/plugin';

// Cores da marca — viram classes (bg-plum-800…) e variáveis CSS (--color-plum-800)
const colors = {
  // Roxo intenso — a cor da marca
  plum: {
    50: '#f6f2ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#7c3aed',
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#2e1065',
    950: '#1a0933',
  },
  // Orquídea e pétalas — detalhes florais
  orchid: { 400: '#e879f9', 500: '#c026d3', 600: '#a21caf' },
  blossom: { 200: '#fbcfe8', 300: '#f9a8d4' },
  pollen: '#f6c86b',
  ink: { DEFAULT: '#24123f', soft: '#5b4a78' },
  paper: '#fcfaff',
  // Vermelho das mensagens de erro, no mesmo tom do Tailwind 4
  red: { 50: '#fef2f2', 200: '#ffc9c9', 700: '#c10007' },
};

const fonts = {
  display: ["'Playfair Display'", 'Georgia', 'serif'],
  sans: ["'Nunito'", "'Segoe UI'", 'system-ui', '-apple-system', 'sans-serif'],
};

const shadows = {
  soft: '0 10px 30px -12px rgb(76 29 149 / 0.35)',
  lift: '0 18px 40px -16px rgb(76 29 149 / 0.55)',
};

function cssVars() {
  const vars = {};
  for (const [name, value] of Object.entries(colors)) {
    if (typeof value === 'string') vars[`--color-${name}`] = value;
    else
      for (const [shade, hex] of Object.entries(value))
        vars[shade === 'DEFAULT' ? `--color-${name}` : `--color-${name}-${shade}`] = hex;
  }
  for (const [name, stack] of Object.entries(fonts)) vars[`--font-${name}`] = stack.join(', ');
  for (const [name, value] of Object.entries(shadows)) vars[`--shadow-${name}`] = value;
  return vars;
}

// Mesma escala livre do Tailwind 4 (p-13, size-18, /12…), para o visual não mudar
const range = (to, step = 1) => Array.from({ length: Math.floor(to / step) + 1 }, (_, i) => i * step);
const spacing = Object.fromEntries(range(100, 0.5).map((n) => [String(n), n === 0 ? '0px' : `${n * 0.25}rem`]));
const opacity = Object.fromEntries(range(100).map((n) => [String(n), String(n / 100)]));
// Tamanhos de letra com a altura de linha proporcional, igual ao Tailwind 4
const fontSize = Object.fromEntries(
  [
    ['xs', 0.75, 1],
    ['sm', 0.875, 1.25],
    ['base', 1, 1.5],
    ['lg', 1.125, 1.75],
    ['xl', 1.25, 1.75],
    ['2xl', 1.5, 2],
    ['3xl', 1.875, 2.25],
    ['4xl', 2.25, 2.5],
    ['5xl', 3, 3],
    ['6xl', 3.75, 3.75],
    ['7xl', 4.5, 4.5],
  ].map(([name, size, leading]) => [name, [`${size}rem`, { lineHeight: String(+(leading / size).toFixed(4)) }]]),
);

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  future: {
    // Como no Tailwind 4: efeitos de "hover" só onde existe mouse (no celular não ficam presos)
    hoverOnlyWhenSupported: true,
  },
  theme: {
    fontSize,
    extend: {
      colors,
      fontFamily: fonts,
      boxShadow: shadows,
      spacing,
      opacity,
      zIndex: Object.fromEntries(range(100).map((n) => [String(n), String(n)])),
      // Como no Tailwind 4: borda e anel sem cor definida usam a cor do texto
      borderColor: { DEFAULT: 'currentColor' },
      ringColor: { DEFAULT: 'currentColor' },
      ringWidth: { DEFAULT: '1px' },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({ ':root': cssVars() });
    }),
  ],
};
