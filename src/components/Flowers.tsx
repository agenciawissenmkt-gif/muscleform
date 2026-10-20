import type { CSSProperties } from 'react';

/** Flor de 5 pétalas (detalhe da marca). */
export function Flower({
  size = 40,
  petal = 'var(--color-orchid-400)',
  center = 'var(--color-pollen)',
  className = '',
  style,
}: {
  size?: number;
  petal?: string;
  center?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse
          key={r}
          cx="20"
          cy="10.5"
          rx="6.2"
          ry="9.5"
          fill={petal}
          transform={`rotate(${r} 20 20)`}
          opacity="0.92"
        />
      ))}
      <circle cx="20" cy="20" r="5" fill={center} />
      <circle cx="18.6" cy="18.6" r="1.4" fill="#fff" opacity="0.7" />
    </svg>
  );
}

/** Ramo com folhas e flores — usado nos cantos das telas. */
export function FloralCorner({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <g className="sway">
        <path
          d="M10 210 C 60 160, 80 110, 150 60"
          stroke="var(--color-plum-400)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M60 165 C 40 150, 30 135, 34 118 C 52 128, 60 145, 60 165Z"
          fill="var(--color-plum-300)"
          opacity="0.8"
        />
        <path
          d="M95 118 C 110 100, 128 96, 140 102 C 128 118, 112 122, 95 118Z"
          fill="var(--color-plum-300)"
          opacity="0.8"
        />
        <path d="M78 140 C 96 136, 108 142, 114 154 C 98 158, 86 152, 78 140Z" fill="var(--color-plum-200)" />
        <g transform="translate(128 34)">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse
              key={r}
              cx="22"
              cy="11"
              rx="8"
              ry="12"
              fill="var(--color-orchid-400)"
              transform={`rotate(${r} 22 22)`}
              opacity="0.9"
            />
          ))}
          <circle cx="22" cy="22" r="6.5" fill="var(--color-pollen)" />
        </g>
        <g transform="translate(30 92) scale(0.7)">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse
              key={r}
              cx="22"
              cy="11"
              rx="8"
              ry="12"
              fill="var(--color-blossom-300)"
              transform={`rotate(${r} 22 22)`}
              opacity="0.95"
            />
          ))}
          <circle cx="22" cy="22" r="6.5" fill="var(--color-pollen)" />
        </g>
        <circle cx="160" cy="112" r="5" fill="var(--color-plum-300)" />
        <circle cx="172" cy="96" r="3.5" fill="var(--color-blossom-200)" />
      </g>
    </svg>
  );
}

/** Pétalas caindo — tela de carregamento. Leve: só CSS. */
export function FallingPetals({ count = 14 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 37) % 100;
        const size = 10 + ((i * 7) % 12);
        const colors = [
          'var(--color-blossom-300)',
          'var(--color-orchid-400)',
          'var(--color-plum-300)',
          'var(--color-blossom-200)',
        ];
        return (
          <svg
            key={i}
            width={size}
            height={size * 1.3}
            viewBox="0 0 10 13"
            className="petal-fall absolute top-0"
            style={
              {
                left: `${left}%`,
                '--dur': `${7 + (i % 5) * 1.6}s`,
                '--delay': `${-(i * 1.3)}s`,
                '--drift': `${((i % 3) - 1) * 60}px`,
                '--spin': `${i % 2 ? 320 : -280}deg`,
              } as CSSProperties
            }
          >
            <path d="M5 0 C 9 3, 10 9, 5 13 C 0 9, 1 3, 5 0Z" fill={colors[i % colors.length]} opacity="0.9" />
          </svg>
        );
      })}
    </div>
  );
}
