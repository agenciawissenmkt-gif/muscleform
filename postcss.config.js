import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// "dvh/svh/lvh" (altura real da tela no celular) não existem em navegadores
// antigos (Safari < 15.4, Chrome < 108). Antes de cada uso, repete a regra com
// a variável --vh (altura visível, calculada em src/lib/compat.ts; sem ela vale
// 1vh): o navegador antigo fica com essa e o novo usa a versão com dvh.
const VIEWPORT_UNIT = /(\d*\.?\d+)[dsl]v(h|w|min|max)\b/g;

// clamp(a, b, c) → max(a, min(b, c)): a versão com min/max funciona desde o
// Safari 11.1 (clamp só no 13.1). Necessário porque a regra com var() não é
// mais convertida automaticamente na hora de compactar o CSS.
function lowerClamp(value) {
  const i = value.indexOf('clamp(');
  if (i < 0) return value;
  let depth = 0;
  const args = [];
  let start = i + 6;
  for (let j = start; j < value.length; j++) {
    const ch = value[j];
    if (ch === '(') depth++;
    else if (ch === ')' && depth > 0) depth--;
    else if ((ch === ',' && depth === 0) || (ch === ')' && depth === 0)) {
      args.push(value.slice(start, j).trim());
      start = j + 1;
      if (ch === ')') {
        if (args.length !== 3) return value;
        const lowered = `max(${args[0]}, min(${args[1]}, ${args[2]}))`;
        return value.slice(0, i) + lowered + lowerClamp(value.slice(j + 1));
      }
    }
  }
  return value;
}

function viewportUnitsFallback() {
  return {
    postcssPlugin: 'viewport-units-fallback',
    Declaration(decl) {
      if (decl.prop.startsWith('--') || !VIEWPORT_UNIT.test(decl.value)) return;
      VIEWPORT_UNIT.lastIndex = 0;
      const fallback = lowerClamp(
        decl.value.replace(VIEWPORT_UNIT, (_, n, unit) =>
          unit === 'h' ? `calc(var(--vh, 1vh) * ${n})` : `${n}v${unit}`,
        ),
      );
      const prev = decl.prev();
      if (prev?.type === 'decl' && prev.prop === decl.prop && prev.value === fallback) return;
      decl.cloneBefore({ value: fallback });
    },
  };
}
viewportUnitsFallback.postcss = true;

export default {
  plugins: [tailwindcss(), viewportUnitsFallback(), autoprefixer()],
};
