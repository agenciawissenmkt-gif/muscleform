import { memo, useId } from 'react';
import type { HairLook } from '../catalog';

// Ilustração gerada a partir das características do corte (comprimento,
// volume, franja, textura...). Assim todos os cortes do catálogo ganham um
// desenho próprio sem precisar de centenas de fotos pesadas.

const CX = 60;
const CROWN = 31;
const BROW = 50;

/** comprimento 0–1 -> altura (y) onde o cabelo termina */
function bottomOf(length: number): number {
  const anchors: [number, number][] = [
    [0, 44],
    [0.12, 60],
    [0.3, 78],
    [0.42, 96],
    [0.55, 110],
    [0.75, 126],
    [1, 139],
  ];
  for (let i = 1; i < anchors.length; i++) {
    const [l0, y0] = anchors[i - 1];
    const [l1, y1] = anchors[i];
    if (length <= l1) return y0 + ((length - l0) / (l1 - l0)) * (y1 - y0);
  }
  return 139;
}

interface Edge {
  pts: [number, number][];
  bottom: number;
}

function leftEdge(look: HairLook): Edge {
  const bottom = bottomOf(look.length);
  const curlBoost = look.texture === 'coily' ? 9 : look.texture === 'curly' ? 5 : 0;
  const W = 20 + look.volume * 12 + curlBoost;
  const top = CROWN - look.volume * 4 - curlBoost * 0.5;
  const taper = look.length > 0.35 ? 0.1 + look.layers * 0.22 : 0.02;
  const pts: [number, number][] = [];
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const y = top + ((bottom - top) * i) / steps;
    let w: number;
    if (y < BROW) {
      const k = (BROW - y) / (BROW - top);
      w = W * Math.sqrt(Math.max(0, 1 - k * k));
    } else {
      const t = (y - BROW) / Math.max(1, bottom - BROW);
      w = W * (1 - taper * t);
      if (look.length <= 0.32) w = W * (1 - 0.25 * t * t);
    }
    let x = CX - w;
    if (look.texture === 'wavy' && y > BROW) x += 2.4 * Math.sin((y - BROW) / 5.5);
    pts.push([x, y]);
  }
  return { pts, bottom };
}

function silhouettePath(look: HairLook): {
  d: string;
  left: [number, number][];
  right: [number, number][];
  bottom: number;
} {
  const { pts, bottom } = leftEdge(look);
  const right = pts.map(([x, y]) => [CX + (CX - x), y] as [number, number]);
  const dip = 2 + look.layers * 7 + (look.length > 0.6 ? 3 : 0);
  let d = `M ${CX} ${pts[0][1].toFixed(1)} `;
  for (const [x, y] of pts) d += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
  const ly = pts[pts.length - 1][1];
  const rx = right[right.length - 1][0];
  d += `Q ${CX} ${(ly + dip).toFixed(1)} ${rx.toFixed(1)} ${ly.toFixed(1)} `;
  for (let i = right.length - 1; i >= 0; i--) d += `L ${right[i][0].toFixed(1)} ${right[i][1].toFixed(1)} `;
  d += 'Z';
  return { d, left: pts, right, bottom };
}

function Fringe({ look }: { look: HairLook }) {
  const fill = 'url(#hairart-front)';
  switch (look.fringe) {
    case 'full':
      return <path d="M42 46 C 43 33, 77 33, 78 46 L 78 52 C 70 54, 50 54, 42 52 Z" fill={fill} />;
    case 'micro':
      return <path d="M43 44 C 44 33, 76 33, 77 44 L 77 46 C 68 47.5, 52 47.5, 43 46 Z" fill={fill} />;
    case 'wispy':
      return (
        <path
          d="M42 46 C 43 33, 77 33, 78 46 L 77 51 L 73 48 L 70 53 L 66 49 L 62 54 L 58 49 L 54 53 L 50 48 L 46 52 L 43 49 Z"
          fill={fill}
        />
      );
    case 'curtain':
      return (
        <>
          <path d="M60 36 C 52 37, 45 43, 43 60 C 41 50, 41 41, 46 37 Z" fill={fill} />
          <path d="M60 36 C 68 37, 75 43, 77 60 C 79 50, 79 41, 74 37 Z" fill={fill} />
        </>
      );
    case 'side':
      return <path d="M42 50 C 44 34, 74 32, 79 45 C 70 44, 56 47, 43 58 Z" fill={fill} />;
    default:
      return null;
  }
}

function Strands({ look, left, bottom }: { look: HairLook; left: [number, number][]; bottom: number }) {
  const n = look.style === 'locs' ? 8 : 10;
  const x0 = left[Math.floor(left.length * 0.45)][0] + 1;
  const x1 = CX + (CX - x0);
  const items = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    const top = 44;
    if (look.style === 'braids') {
      const beads = [];
      for (let y = top; y < bottom - 1; y += 4.2) {
        const r = (y / 4.2) % 2 ? -28 : 28;
        beads.push(<ellipse key={y} cx={x} cy={y} rx="2.6" ry="1.9" transform={`rotate(${r} ${x} ${y})`} />);
      }
      items.push(<g key={i}>{beads}</g>);
    } else if (look.style === 'locs') {
      items.push(
        <path
          key={i}
          d={`M${x} ${top} C ${x - 2} ${(top + bottom) / 2}, ${x + 2} ${(top + bottom) / 2}, ${x} ${bottom}`}
          strokeWidth="4.4"
          strokeLinecap="round"
          fill="none"
          stroke="url(#hairart-back)"
        />,
      );
    } else {
      let d = `M${x} ${top} `;
      for (let y = top + 3; y < bottom; y += 3) d += `L ${x + ((y / 3) % 2 ? 1.6 : -1.6)} ${y} `;
      items.push(
        <path key={i} d={d} strokeWidth="3.4" strokeLinejoin="round" fill="none" stroke="url(#hairart-back)" />,
      );
    }
  }
  return <g fill="url(#hairart-back)">{items}</g>;
}

function HairArtImpl({ look, className = '' }: { look: HairLook; className?: string }) {
  const clip = useId();
  const braided = look.style === 'braids' || look.style === 'locs' || look.style === 'twists';
  const shaved = look.style === 'shaved' || look.length < 0.06;
  const updo = look.style === 'updo';
  const sil = silhouettePath(updo ? { ...look, length: 0.12 } : look);
  const curly = look.texture === 'curly' || look.texture === 'coily';

  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <rect x="0" y="0" width="120" height="140" rx="18" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {/* ombros e pescoço */}
        <path d="M14 141 C 18 110, 38 99, 60 98 C 82 99, 102 110, 106 141 Z" fill="var(--color-plum-200)" />
        <path d="M52.5 68 L 52.5 90 C 55 96, 65 96, 67.5 90 L 67.5 68 Z" fill="#f3dbe8" />

        {/* cabelo de trás */}
        {!shaved && !braided && <path d={sil.d} fill="url(#hairart-back)" />}
        {!shaved &&
          !braided &&
          curly &&
          [...sil.left, ...sil.right]
            .filter((_, i) => i % 2 === 0)
            .map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={look.texture === 'coily' ? 3.6 : 3.1} fill="url(#hairart-back)" />
            ))}
        {braided && (
          <>
            <path d={silhouettePath({ ...look, length: 0.2, volume: 0.3 }).d} fill="url(#hairart-back)" />
            <Strands look={look} left={sil.left} bottom={sil.bottom} />
          </>
        )}
        {updo && <circle cx={CX} cy={CROWN - 8 - look.volume * 3} r={10 + look.volume * 3} fill="url(#hairart-back)" />}

        {/* rosto */}
        <ellipse cx={CX} cy="56" rx="16.5" ry="20.5" fill="#fdeff6" />
        <path
          d="M51.5 59 q 3 2.4 6 0 M62.5 59 q 3 2.4 6 0"
          stroke="var(--color-plum-700)"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="50" cy="65" r="3" fill="var(--color-blossom-300)" opacity="0.45" />
        <circle cx="70" cy="65" r="3" fill="var(--color-blossom-300)" opacity="0.45" />
        <path d="M56.5 69.5 q 3.5 2.6 7 0 q -3.5 1 -7 0 Z" fill="var(--color-orchid-500)" opacity="0.8" />

        {/* frente: topo da cabeça e franja */}
        {shaved ? (
          <path d="M43 50 C 41 30, 79 30, 77 50 C 72 40, 48 40, 43 50 Z" fill="url(#hairart-front)" opacity="0.55" />
        ) : (
          <path
            d={`M41.5 54 C 39 ${CROWN - 2}, 81 ${CROWN - 2}, 78.5 54 C 76 44, 70 39, 60 38.5 C 50 39, 44 44, 41.5 54 Z`}
            fill="url(#hairart-front)"
          />
        )}
        {braided && look.style === 'braids' && (
          <path
            d="M50 37 L 48 50 M 60 34 L 60 46 M 70 37 L 72 50"
            stroke="var(--color-plum-950)"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        )}
        {!shaved && <Fringe look={look} />}

        {/* fios (detalhe) */}
        {!shaved && !braided && !curly && look.length > 0.2 && (
          <g stroke="var(--color-plum-300)" strokeOpacity="0.55" strokeWidth="0.9" fill="none" strokeLinecap="round">
            <path d={`M44 60 C 41 ${(60 + sil.bottom) / 2}, 43 ${sil.bottom - 6}, 40 ${sil.bottom - 3}`} />
            <path d={`M76 60 C 79 ${(60 + sil.bottom) / 2}, 77 ${sil.bottom - 6}, 80 ${sil.bottom - 3}`} />
            {look.layers > 0.4 && (
              <path d={`M38 70 C 36 ${(70 + sil.bottom) / 2}, 38 ${sil.bottom - 10}, 35 ${sil.bottom - 6}`} />
            )}
            {look.layers > 0.4 && (
              <path d={`M82 70 C 84 ${(70 + sil.bottom) / 2}, 82 ${sil.bottom - 10}, 85 ${sil.bottom - 6}`} />
            )}
          </g>
        )}
      </g>
    </svg>
  );
}

export const HairArt = memo(HairArtImpl);

/** Gradientes compartilhados por todas as ilustrações (montado uma vez). */
export function HairArtDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hairart-back" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#5b21b6" />
          <stop offset="1" stopColor="#2e1065" />
        </linearGradient>
        <linearGradient id="hairart-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Mecha de cabelo pintada com a cor (cards de cor). */
export const ColorLock = memo(function ColorLock({ swatch, className = '' }: { swatch: string[]; className?: string }) {
  const id = useId();
  const stops = swatch.length ? swatch : ['#5b3a24', '#8a5a3c'];
  return (
    <svg viewBox="0 0 84 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0.2" y1="0" x2="0.5" y2="1">
          {stops.map((c, i) => (
            <stop key={i} offset={stops.length === 1 ? 0 : i / (stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <path
        d="M34 4 C 58 2, 70 20, 60 44 C 52 64, 66 82, 56 102 C 50 114, 34 120, 24 112 C 38 100, 30 84, 28 66 C 26 46, 14 28, 34 4 Z"
        fill={`url(#g${id})`}
      />
      <path
        d="M24 112 C 18 104, 20 96, 18 90 C 26 98, 30 104, 24 112 Z M60 44 C 66 40, 72 44, 72 52 C 66 50, 62 48, 60 44 Z"
        fill={`url(#g${id})`}
        opacity="0.85"
      />
      <g stroke="#fff" strokeOpacity="0.28" strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d="M38 10 C 52 18, 54 32, 48 46 C 42 62, 52 78, 46 96" />
        <path d="M30 18 C 40 30, 38 46, 38 60 C 38 76, 44 90, 36 106" />
      </g>
      <path
        d="M40 14 C 50 22, 50 34, 46 42"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
});

/**
 * Amostra de cor ocupando o quadro todo (raiz → pontas, de cima para baixo),
 * com fios finos e um brilho suave para parecer cabelo sem mudar o tom.
 */
export const ColorSwatch = memo(function ColorSwatch({
  swatch,
  className = '',
}: {
  swatch: string[];
  className?: string;
}) {
  const id = useId();
  const stops = swatch.length ? swatch : ['#5b3a24', '#8a5a3c'];
  const strands = Array.from({ length: 28 }, (_, i) => {
    const x = 2 + i * 3.6;
    const bend = (i % 5) - 2;
    return `M${x} -2 C ${x + bend * 1.5} 30, ${x - bend} 70, ${x + bend * 0.8} 102`;
  });
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((c, i) => (
            <stop key={i} offset={stops.length === 1 ? 0 : i / (stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#c${id})`} />
      <g fill="none" strokeWidth="0.35" strokeLinecap="round">
        {strands.map((d, i) => (
          <path key={i} d={d} stroke={i % 3 === 0 ? '#000' : '#fff'} strokeOpacity={i % 3 === 0 ? 0.1 : 0.14} />
        ))}
      </g>
      <rect width="100" height="100" fill={`url(#s${id})`} />
    </svg>
  );
});
