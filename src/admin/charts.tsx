// Gráficos do painel (SVG próprio, leve e animado): barras 3D, anel 3D,
// área, pódio e números que contam até o valor.
import { useEffect, useId, useRef, useState } from 'react';

/** Número que sobe animado até o valor. */
export function useCountUp(target: number, ms = 1100) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !Number.isFinite(target)) {
      setV(target);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function CountUp({ value, format }: { value: number; format: (v: number) => string }) {
  return <>{format(useCountUp(value))}</>;
}

/** Cores (gradiente roxo → orquídea) por posição */
const SHADES = [
  ['#7c3aed', '#a855f7', '#5b21b6'],
  ['#c026d3', '#e879f9', '#86198f'],
  ['#6d28d9', '#8b5cf6', '#4c1d95'],
];

export interface Bar3DItem {
  label: string;
  value: number;
  /** segundo valor empilhado (ex.: falhas), desenhado em cima */
  extra?: number;
  title?: string;
}

/**
 * Barras em 3D (isométricas): frente, lateral e topo com sombreamento,
 * crescendo da base com animação.
 */
export function Bars3D({
  items,
  height = 220,
  shade = 0,
  showValues = true,
  labelEvery = 1,
}: {
  items: Bar3DItem[];
  height?: number;
  shade?: number;
  showValues?: boolean;
  labelEvery?: number;
}) {
  const id = useId();
  const n = Math.max(1, items.length);
  const W = Math.max(320, n * 34);
  const top = 26;
  const bottom = 26;
  const depth = Math.min(12, Math.max(5, (W / n) * 0.22));
  const slot = (W - depth - 8) / n;
  const bw = Math.max(6, slot * 0.58);
  const max = Math.max(1, ...items.map((i) => i.value + (i.extra || 0)));
  const plot = height - top - bottom;
  const [c1, c2, c3] = SHADES[shade % SHADES.length];
  const grid = [0.25, 0.5, 0.75, 1];

  return (
    // No celular, muitas barras: rola para o lado em vez de ficar minúsculo
    <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="h-auto w-full overflow-visible"
        style={{ minWidth: n > 12 ? n * 20 : undefined }}
        role="img"
      >
        <defs>
          <linearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c2} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
          <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c3} />
          </linearGradient>
          <linearGradient id={`e${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fda4af" />
            <stop offset="1" stopColor="#f43f5e" />
          </linearGradient>
          <filter id={`sh${id}`} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#2e1065" floodOpacity="0.25" />
          </filter>
        </defs>
        {/* chão em perspectiva */}
        <path
          d={`M0 ${height - bottom} L${W - depth} ${height - bottom} L${W} ${height - bottom - depth} L${depth} ${height - bottom - depth} Z`}
          fill="#ede9fe"
        />
        {grid.map((g) => (
          <line
            key={g}
            x1={depth}
            x2={W}
            y1={height - bottom - depth - plot * g}
            y2={height - bottom - depth - plot * g}
            stroke="#e9e1fb"
            strokeDasharray="4 6"
          />
        ))}
        {items.map((it, i) => {
          const total = it.value + (it.extra || 0);
          const h = (total / max) * (plot - depth);
          const hv = (it.value / max) * (plot - depth);
          const x = 4 + i * slot + (slot - bw) / 2;
          const yb = height - bottom;
          const y = yb - Math.max(h, total ? 3 : 1.5);
          const yv = yb - Math.max(hv, it.value ? 3 : 1.5);
          return (
            <g key={i} className="adm-grow" style={{ animationDelay: `${i * 35}ms` }} filter={`url(#sh${id})`}>
              <title>{it.title || `${it.label}: ${it.value}`}</title>
              {/* lateral */}
              <path
                d={`M${x + bw} ${y} L${x + bw + depth} ${y - depth} L${x + bw + depth} ${yb - depth} L${x + bw} ${yb} Z`}
                fill={`url(#s${id})`}
              />
              {/* frente (valor) */}
              <rect x={x} y={yv} width={bw} height={yb - yv} fill={`url(#f${id})`} rx="1.5" />
              {/* frente (extra empilhado) */}
              {it.extra ? <rect x={x} y={y} width={bw} height={yv - y} fill={`url(#e${id})`} /> : null}
              {/* topo */}
              <path
                d={`M${x} ${y} L${x + depth} ${y - depth} L${x + bw + depth} ${y - depth} L${x + bw} ${y} Z`}
                fill={it.extra ? '#fecdd3' : c2}
                opacity="0.95"
              />
              <path
                d={`M${x} ${y} L${x + depth} ${y - depth} L${x + bw + depth} ${y - depth} L${x + bw} ${y} Z`}
                fill="#fff"
                opacity="0.35"
              />
              {showValues && total > 0 && (
                <text
                  x={x + bw / 2 + depth / 2}
                  y={y - depth - 5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#4c1d95"
                >
                  {total}
                </text>
              )}
              {i % labelEvery === 0 && (
                <text x={x + bw / 2} y={height - 8} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#7c6a9a">
                  {it.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Anel 3D (inclinado, com espessura) mostrando um percentual. */
export function Ring3D({
  value,
  size = 180,
  label,
  sub,
  danger = false,
}: {
  value: number;
  size?: number;
  label: string;
  sub?: string;
  danger?: boolean;
}) {
  const id = useId();
  const p = Math.max(0, Math.min(1, value));
  const r = 70;
  const c = 2 * Math.PI * r;
  const shown = useCountUp(p * 100);
  return (
    <div className="mx-auto flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full"
          style={{ transform: 'perspective(500px) rotateX(28deg)' }}
        >
          <defs>
            <linearGradient id={`r${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={danger ? '#fb7185' : '#a855f7'} />
              <stop offset="0.55" stopColor={danger ? '#e11d48' : '#7c3aed'} />
              <stop offset="1" stopColor={danger ? '#be123c' : '#c026d3'} />
            </linearGradient>
            <filter id={`g${id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {/* espessura (camadas por baixo dão o efeito 3D) */}
          {[10, 8, 6, 4, 2].map((dy) => (
            <circle
              key={dy}
              cx="100"
              cy={100 + dy}
              r={r}
              fill="none"
              stroke="#3b0764"
              strokeOpacity={0.09}
              strokeWidth="22"
            />
          ))}
          <circle cx="100" cy="100" r={r} fill="none" stroke="#ede9fe" strokeWidth="22" />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={`url(#r${id})`}
            strokeWidth="22"
            strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`}
            transform="rotate(-90 100 100)"
            className="adm-draw"
            style={{ ['--len' as string]: c * p }}
          />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={`url(#r${id})`}
            strokeWidth="10"
            strokeOpacity="0.5"
            strokeDasharray={`${c * p} ${c}`}
            transform="rotate(-90 100 100)"
            filter={`url(#g${id})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold ${danger ? 'text-rose-600' : 'text-plum-900'}`}>
            {Math.round(shown)}%
          </span>
        </div>
      </div>
      <span className="mt-1 text-xs font-extrabold uppercase tracking-wider text-ink-soft">{label}</span>
      {sub && <span className="text-sm font-extrabold text-plum-700">{sub}</span>}
    </div>
  );
}

/** Gráfico de área suave com gradiente (ex.: imagens por dia). */
export function AreaChart({ values, labels, height = 180 }: { values: number[]; labels?: string[]; height?: number }) {
  const id = useId();
  const W = 600;
  const pad = 10;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [
    pad + (i * (W - 2 * pad)) / Math.max(1, values.length - 1),
    height - 24 - (v / max) * (height - 50),
  ]);
  const line = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx} ${py} ${cx} ${y} ${x} ${y}`;
  }, '');
  const area = `${line} L${pts[pts.length - 1]?.[0] ?? W} ${height - 24} L${pad} ${height - 24} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`a${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a855f7" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#a${id})`} className="adm-rise" />
      <path
        d={line}
        fill="none"
        stroke={`url(#l${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="2000"
        className="adm-draw"
        style={{ ['--len' as string]: 2000 }}
      />
      {pts.map(([x, y], i) =>
        values[i] > 0 ? <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#7c3aed" strokeWidth="2.5" /> : null,
      )}
      {labels &&
        labels.map((l, i) =>
          i % Math.ceil(labels.length / 8) === 0 ? (
            <text
              key={i}
              x={pts[i][0]}
              y={height - 6}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#7c6a9a"
            >
              {l}
            </text>
          ) : null,
        )}
    </svg>
  );
}

/** Pódio 3D (1º, 2º e 3º lugar) estilo Grand Prix. */
export function Podium({ items }: { items: { label: string; n: number; photo?: string }[] }) {
  const order = [1, 0, 2];
  const heights = [118, 150, 92];
  const medal = [
    { bg: 'from-slate-200 to-slate-400', ring: 'ring-slate-300', txt: '2º' },
    { bg: 'from-amber-200 to-amber-500', ring: 'ring-amber-300', txt: '1º' },
    { bg: 'from-orange-200 to-orange-500', ring: 'ring-orange-300', txt: '3º' },
  ];
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      {order.map((idx, col) => {
        const it = items[idx];
        if (!it) return <div key={col} className="w-24 sm:w-32" />;
        const m = medal[col];
        return (
          <div
            key={col}
            className="adm-rise flex w-24 flex-col items-center sm:w-32"
            style={{ animationDelay: `${col * 120}ms` }}
          >
            <div className={`relative mb-2 ${col === 1 ? 'adm-float' : ''}`}>
              {it.photo ? (
                <img
                  src={it.photo}
                  alt=""
                  className={`size-16 rounded-2xl object-cover shadow-lift ring-4 sm:size-20 ${m.ring}`}
                />
              ) : (
                <span
                  className={`flex size-16 items-center justify-center rounded-2xl bg-plum-100 text-2xl font-extrabold text-plum-700 ring-4 sm:size-20 ${m.ring}`}
                >
                  {it.label.charAt(0)}
                </span>
              )}
              <span
                className={`absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-extrabold text-white shadow-md ${m.bg}`}
              >
                {m.txt}
              </span>
            </div>
            <p className="mb-4 line-clamp-2 min-h-[2.6em] text-center text-xs font-extrabold leading-tight text-plum-950 sm:text-sm">
              {it.label}
            </p>
            <div className="relative mt-1 w-full" style={{ height: heights[col] }}>
              {/* topo do bloco */}
              <div
                className="absolute inset-x-0 top-0 h-3 -translate-y-full skew-x-[-35deg] rounded-t-md bg-plum-300"
                style={{ left: 6, right: -6 }}
              />
              <div className="adm-grow brand-gradient flex h-full w-full items-start justify-center rounded-b-lg pt-3 shadow-lift">
                <span className="text-xl font-extrabold text-white drop-shadow">{it.n}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Mini linha (sparkline) para os cartões. */
export function Sparkline({ values, color = '#a855f7' }: { values: number[]; color?: string }) {
  const W = 120;
  const H = 36;
  const max = Math.max(1, ...values);
  const pts = values
    .map((v, i) => `${(i * W) / Math.max(1, values.length - 1)},${H - 3 - (v / max) * (H - 8)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-28" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
