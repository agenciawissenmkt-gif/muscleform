import { site } from '../config/site';

interface Props {
  className?: string;
  /** 'emblema' = só o selo redondo | 'completa' = selo + nome ao lado */
  variante?: 'emblema' | 'completa' | 'grande';
}

/** Selo do ateliê: círculo rosa, ursinho + boneca e o nome em letra manuscrita. */
export default function Logo({ className = '', variante = 'completa' }: Props) {
  if (variante === 'emblema') {
    return <Emblema className={className} />;
  }

  if (variante === 'grande') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <Emblema className="h-32 w-32 sm:h-40 sm:w-40" />
        <div className="text-center">
          <p className="font-script text-4xl leading-none text-rosa-700 sm:text-5xl">{site.nome}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.28em] text-sepia-500">{site.slogan}</p>
        </div>
      </div>
    );
  }

  return (
    <span className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <Emblema className="h-9 w-9 shrink-0 sm:h-12 sm:w-12" />
      <span className="flex flex-col leading-none">
        <span className="font-script text-lg text-rosa-700 sm:text-[1.7rem]">{site.nome}</span>
        <span className="mt-0.5 text-[0.45rem] uppercase tracking-[0.18em] text-sepia-500 sm:text-[0.55rem] sm:tracking-[0.22em]">
          ateliê artesanal
        </span>
      </span>
    </span>
  );
}

function Emblema({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`Logo ${site.nome}`}>
      <defs>
        <radialGradient id="logoFundo" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#fffdf9" />
          <stop offset="100%" stopColor="#ffe3ea" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="98" fill="url(#logoFundo)" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#f9b4c6" strokeWidth="5" />
      <circle
        cx="100"
        cy="100"
        r="84"
        fill="none"
        stroke="#e0708f"
        strokeWidth="2"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />

      {/* corações do contorno */}
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        const x = 100 + Math.cos(r) * 92;
        const y = 100 + Math.sin(r) * 92;
        return (
          <path
            key={a}
            transform={`translate(${x} ${y}) scale(0.5) rotate(${a + 90})`}
            d="M0 -4 c-6 -8 -16 -3 -16 5 c0 8 9 13 16 20 c7 -7 16 -12 16 -20 c0 -8 -10 -13 -16 -5 z"
            fill="#e0708f"
          />
        );
      })}

      {/* ursinho */}
      <g transform="translate(58 84)">
        <circle cx="-13" cy="-16" r="7.5" fill="#c99a6b" />
        <circle cx="13" cy="-16" r="7.5" fill="#c99a6b" />
        <ellipse cx="0" cy="16" rx="17" ry="19" fill="#c99a6b" />
        <circle cx="0" cy="-2" r="16" fill="#d9ad7f" />
        <ellipse cx="0" cy="4" rx="8" ry="6" fill="#f0dcc2" />
        <circle cx="0" cy="1" r="2.4" fill="#4a3229" />
        <path d="M-7 -5 q2 -3 4 0 M3 -5 q2 -3 4 0" stroke="#4a3229" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* boneca */}
      <g transform="translate(132 84)">
        <ellipse cx="0" cy="20" rx="20" ry="22" fill="#f9b4c6" />
        <path d="M-20 34 q20 8 40 0 l0 6 q-20 8 -40 0 z" fill="#fff1f5" />
        <circle cx="-16" cy="-2" r="8" fill="#c8703f" />
        <circle cx="16" cy="-2" r="8" fill="#c8703f" />
        <circle cx="0" cy="-4" r="16" fill="#f7ddc9" />
        <path d="M-16 -10 q6 -13 16 -13 q10 0 16 13 q-8 -5 -16 -4 q-8 -1 -16 4 z" fill="#c8703f" />
        <path d="M-8 -3 q3 -4 6 0 M2 -3 q3 -4 6 0" stroke="#4a3229" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="-9" cy="3" r="3.4" fill="#f191ab" opacity="0.6" />
        <circle cx="9" cy="3" r="3.4" fill="#f191ab" opacity="0.6" />
      </g>

      {/* nome */}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill="#c25674"
        fontFamily='"Dancing Script", cursive'
        fontSize="30"
        fontWeight="700"
      >
        Sonhos
      </text>
      <text
        x="100"
        y="172"
        textAnchor="middle"
        fill="#c25674"
        fontFamily='"Dancing Script", cursive'
        fontSize="24"
        fontWeight="600"
      >
        de Brincar
      </text>
    </svg>
  );
}
