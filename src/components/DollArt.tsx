import type { CSSProperties } from 'react';
import type { DollSpec } from '../data/types';

/**
 * Cada boneca é desenhada em SVG, separada em camadas.
 * As camadas são empilhadas com profundidade diferente pelo <Doll3D>,
 * o que cria o efeito de paralaxe / volume 3D quando a boneca gira.
 */
export type CamadaBoneca =
  | 'sombra'
  | 'cabeloTras'
  | 'membros'
  | 'corpo'
  | 'cabeca'
  | 'rosto'
  | 'cabeloFrente'
  | 'acessorio';

export const CAMADAS: { camada: CamadaBoneca; z: number }[] = [
  { camada: 'sombra', z: -46 },
  { camada: 'cabeloTras', z: -26 },
  { camada: 'membros', z: -12 },
  { camada: 'corpo', z: 0 },
  { camada: 'cabeca', z: 12 },
  { camada: 'rosto', z: 22 },
  { camada: 'cabeloFrente', z: 26 },
  { camada: 'acessorio', z: 34 },
];

interface Props {
  spec: DollSpec;
  camada: CamadaBoneca;
  className?: string;
  style?: CSSProperties;
}

function clarear(hex: string, quanto = 0.25): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) + 255 * quanto));
  const g = Math.min(255, Math.round(((n >> 8) & 255) + 255 * quanto));
  const b = Math.min(255, Math.round((n & 255) + 255 * quanto));
  return `rgb(${r}, ${g}, ${b})`;
}

function escurecer(hex: string, quanto = 0.18): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - quanto)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - quanto)));
  const b = Math.max(0, Math.round((n & 255) * (1 - quanto)));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function DollArt({ spec, camada, className, style }: Props) {
  const ehBicho = spec.tipo === 'urso' || spec.tipo === 'coelha';
  const ehNaninha = spec.tipo === 'naninha';
  const ehBailarina = spec.tipo === 'bailarina';
  const ehBebe = spec.tipo === 'bebe';

  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      style={style}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {camada === 'sombra' && (
        <ellipse cx="100" cy="273" rx="62" ry="12" fill="rgba(194, 86, 116, 0.22)" />
      )}

      {camada === 'cabeloTras' && (
        <CabeloTras spec={spec} ehBicho={ehBicho} ehNaninha={ehNaninha} />
      )}

      {camada === 'membros' && !ehNaninha && <Membros spec={spec} ehBebe={ehBebe} />}

      {camada === 'corpo' &&
        (ehNaninha ? (
          <CorpoNaninha spec={spec} />
        ) : (
          <Corpo spec={spec} ehBailarina={ehBailarina} ehBebe={ehBebe} />
        ))}

      {camada === 'cabeca' && <Cabeca spec={spec} ehBicho={ehBicho} ehNaninha={ehNaninha} />}

      {camada === 'rosto' && <Rosto spec={spec} ehBicho={ehBicho} ehNaninha={ehNaninha} />}

      {camada === 'cabeloFrente' && !ehBicho && !ehNaninha && <Franja spec={spec} />}

      {camada === 'acessorio' && <AcessorioArt spec={spec} ehNaninha={ehNaninha} />}
    </svg>
  );
}

/* ---------------------------------- Cabelo ---------------------------------- */

function CabeloTras({
  spec,
  ehBicho,
  ehNaninha,
}: {
  spec: DollSpec;
  ehBicho: boolean;
  ehNaninha: boolean;
}) {
  if (ehNaninha) return null;

  if (ehBicho) {
    const orelha = spec.cabelo;
    const interna = clarear(spec.cabelo, 0.35);
    if (spec.tipo === 'coelha') {
      return (
        <g>
          <g transform="rotate(-12 68 52)">
            <ellipse cx="68" cy="34" rx="15" ry="40" fill={orelha} />
            <ellipse cx="68" cy="36" rx="7" ry="30" fill={interna} />
          </g>
          <g transform="rotate(12 132 52)">
            <ellipse cx="132" cy="34" rx="15" ry="40" fill={orelha} />
            <ellipse cx="132" cy="36" rx="7" ry="30" fill={interna} />
          </g>
        </g>
      );
    }
    return (
      <g>
        <circle cx="58" cy="52" r="24" fill={orelha} />
        <circle cx="58" cy="52" r="13" fill={interna} />
        <circle cx="142" cy="52" r="24" fill={orelha} />
        <circle cx="142" cy="52" r="13" fill={interna} />
      </g>
    );
  }

  const c = spec.cabelo;
  const s = spec.cabeloSombra;

  return (
    <g>
      {/* volume atrás da cabeça */}
      <ellipse cx="100" cy="86" rx="55" ry="56" fill={c} />
      <ellipse cx="100" cy="92" rx="47" ry="48" fill={s} opacity="0.35" />

      {spec.penteado === 'chiquinhas' && (
        <g>
          <circle cx="34" cy="96" r="24" fill={c} />
          <circle cx="30" cy="90" r="10" fill={clarear(c, 0.16)} />
          <circle cx="166" cy="96" r="24" fill={c} />
          <circle cx="170" cy="90" r="10" fill={clarear(c, 0.16)} />
        </g>
      )}

      {spec.penteado === 'trancas' && (
        <g>
          <path
            d="M44 96 q-14 34 -6 66 q4 14 16 12 q10 -2 8 -16 q-6 -30 4 -58 z"
            fill={c}
          />
          <path d="M156 96 q14 34 6 66 q-4 14 -16 12 q-10 -2 -8 -16 q6 -30 -4 -58 z" fill={c} />
          <g stroke={s} strokeWidth="3" fill="none" opacity="0.55">
            <path d="M40 116 q14 6 22 0" />
            <path d="M40 136 q14 6 22 0" />
            <path d="M40 156 q14 6 20 0" />
            <path d="M138 116 q14 6 22 0" />
            <path d="M138 136 q14 6 22 0" />
            <path d="M140 156 q14 6 20 0" />
          </g>
        </g>
      )}

      {spec.penteado === 'longo' && (
        <path
          d="M46 82 q-12 70 2 116 q26 12 52 12 q26 0 52 -12 q14 -46 2 -116 q-28 -22 -54 -22 q-26 0 -54 22 z"
          fill={c}
        />
      )}

      {spec.penteado === 'cacheado' && (
        <g fill={c}>
          <circle cx="46" cy="60" r="22" />
          <circle cx="154" cy="60" r="22" />
          <circle cx="40" cy="100" r="21" />
          <circle cx="160" cy="100" r="21" />
          <circle cx="54" cy="134" r="19" />
          <circle cx="146" cy="134" r="19" />
          <circle cx="100" cy="36" r="26" />
          <circle cx="66" cy="38" r="22" />
          <circle cx="134" cy="38" r="22" />
        </g>
      )}

      {spec.penteado === 'coque' && (
        <g>
          <circle cx="100" cy="26" r="24" fill={c} />
          <circle cx="93" cy="20" r="9" fill={clarear(c, 0.18)} />
        </g>
      )}
    </g>
  );
}

function Franja({ spec }: { spec: DollSpec }) {
  const c = spec.cabelo;
  const brilho = clarear(c, 0.2);

  return (
    <g>
      {spec.penteado === 'cacheado' ? (
        <g fill={c}>
          <circle cx="72" cy="46" r="19" />
          <circle cx="100" cy="40" r="20" />
          <circle cx="128" cy="46" r="19" />
          <circle cx="86" cy="34" r="14" fill={brilho} opacity="0.5" />
        </g>
      ) : (
        <path
          d="M54 66 q6 -44 46 -44 q40 0 46 44 q-16 -16 -30 -12 q-6 -14 -18 -14 q-12 0 -18 14 q-14 -4 -26 12 z"
          fill={c}
        />
      )}
      <path d="M70 40 q16 -12 34 -8" stroke={brilho} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />
    </g>
  );
}

/* ---------------------------------- Corpo ---------------------------------- */

function Membros({ spec, ehBebe }: { spec: DollSpec; ehBebe: boolean }) {
  const braco = spec.pele;
  const contorno = escurecer(spec.pele, 0.16);
  const pernaY = ehBebe ? 214 : 222;
  const sapato = spec.sapatos ?? spec.acessorioCor;

  return (
    <g>
      {/* braços */}
      <g stroke={contorno} strokeWidth="1.5">
        <g transform="rotate(-18 66 152)">
          <rect x="50" y="146" width="22" height="72" rx="11" fill={braco} />
        </g>
        <g transform="rotate(18 134 152)">
          <rect x="128" y="146" width="22" height="72" rx="11" fill={braco} />
        </g>
      </g>
      {/* pernas */}
      <rect x="76" y={pernaY} width="20" height="44" rx="10" fill={spec.meias} stroke={escurecer(spec.meias, 0.1)} strokeWidth="1.5" />
      <rect x="104" y={pernaY} width="20" height="44" rx="10" fill={spec.meias} stroke={escurecer(spec.meias, 0.1)} strokeWidth="1.5" />
      {/* sapatinhos */}
      <ellipse cx="86" cy={pernaY + 46} rx="15" ry="9" fill={sapato} />
      <ellipse cx="114" cy={pernaY + 46} rx="15" ry="9" fill={sapato} />
      <path d={`M74 ${pernaY + 40} q12 -6 24 0`} stroke={escurecer(sapato, 0.2)} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={`M102 ${pernaY + 40} q12 -6 24 0`} stroke={escurecer(sapato, 0.2)} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* cadarços dos tênis, quando é conjunto de menino */}
      {spec.roupa === 'conjunto' && (
        <g stroke="#fffafb" strokeWidth="2.2" strokeLinecap="round">
          <path d={`M80 ${pernaY + 44} l12 4 M92 ${pernaY + 44} l-12 4`} />
          <path d={`M108 ${pernaY + 44} l12 4 M120 ${pernaY + 44} l-12 4`} />
        </g>
      )}
    </g>
  );
}

/** Camisa de botão + bermuda — os bonecos. */
function CorpoConjunto({ spec }: { spec: DollSpec }) {
  const camisa = spec.vestido;
  const detalhe = spec.vestidoDetalhe;
  const calca = spec.calca ?? '#c9cfd6';
  const costura = escurecer(camisa, 0.16);

  return (
    <g>
      {/* pescoço */}
      <rect x="88" y="118" width="24" height="24" rx="10" fill={escurecer(spec.pele, 0.08)} />

      {/* bermuda */}
      <path d="M72 188 h56 l4 46 h-24 l-8 -28 l-8 28 h-24 z" fill={calca} stroke={escurecer(calca, 0.14)} strokeWidth="1.5" />
      <g stroke={escurecer(calca, 0.12)} strokeWidth="1.4" opacity="0.7">
        <path d="M80 196 v36 M96 190 v44 M112 190 v44 M126 196 v36" />
        <path d="M72 202 h60 M72 216 h60 M74 228 h56" />
      </g>

      {/* mangas curtas */}
      <g fill={camisa} stroke={costura} strokeWidth="1.5">
        <path d="M72 138 q-16 6 -18 26 q10 6 20 2 z" />
        <path d="M128 138 q16 6 18 26 q-10 6 -20 2 z" />
      </g>

      {/* camisa */}
      <path
        d="M70 134 q30 -12 60 0 l6 62 q-36 10 -72 0 z"
        fill={camisa}
        stroke={costura}
        strokeWidth="1.5"
      />
      {/* golinha */}
      <path d="M88 133 l12 11 l12 -11 l7 4 l-19 15 l-19 -15 z" fill={detalhe} />
      {/* botões */}
      <g fill={detalhe} stroke={escurecer(detalhe, 0.15)} strokeWidth="1">
        <circle cx="100" cy="164" r="4.2" />
        <circle cx="100" cy="178" r="4.2" />
        <circle cx="100" cy="191" r="4.2" />
      </g>
      {/* estampa floral / bolso listrado */}
      {spec.calca === spec.vestido ? (
        <g>
          <rect x="82" y="170" width="36" height="20" rx="4" fill={detalhe} opacity="0.9" />
          <g stroke={escurecer(detalhe, 0.35)} strokeWidth="2">
            <path d="M89 170 v20 M97 170 v20 M105 170 v20 M113 170 v20" />
          </g>
        </g>
      ) : (
        <g opacity="0.85">
          {[
            [80, 154],
            [122, 152],
            [78, 180],
            [124, 178],
            [86, 192],
            [116, 192],
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <circle cx="0" cy="-5" r="3.4" fill={detalhe} />
              <circle cx="4.8" cy="-1.5" r="3.4" fill={detalhe} />
              <circle cx="3" cy="4" r="3.4" fill={detalhe} />
              <circle cx="-3" cy="4" r="3.4" fill={detalhe} />
              <circle cx="-4.8" cy="-1.5" r="3.4" fill={detalhe} />
              <circle cx="0" cy="0" r="2.4" fill="#f2c94c" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function Corpo({
  spec,
  ehBailarina,
  ehBebe,
}: {
  spec: DollSpec;
  ehBailarina: boolean;
  ehBebe: boolean;
}) {
  if (spec.roupa === 'conjunto') return <CorpoConjunto spec={spec} />;

  const v = spec.vestido;
  const d = spec.vestidoDetalhe;
  const sombra = escurecer(v, 0.14);
  const barra = ehBebe ? 206 : 220;

  return (
    <g>
      {/* pescoço */}
      <rect x="88" y="118" width="24" height="24" rx="10" fill={escurecer(spec.pele, 0.08)} />

      {/* vestido */}
      <path
        d={`M72 134 q28 -12 56 0 l22 ${barra - 134} q-50 16 -100 0 z`}
        fill={v}
        stroke={sombra}
        strokeWidth="1.5"
      />
      <path d={`M78 150 q22 -8 44 0 l4 18 q-26 -8 -52 0 z`} fill={d} opacity="0.85" />

      {/* golinha de renda */}
      <path d="M74 134 q26 16 52 0 q-4 14 -26 14 q-22 0 -26 -14 z" fill={d} />
      <g fill={d}>
        <circle cx="78" cy="140" r="4" />
        <circle cx="90" cy="146" r="4" />
        <circle cx="100" cy="148" r="4" />
        <circle cx="110" cy="146" r="4" />
        <circle cx="122" cy="140" r="4" />
      </g>

      {/* bolinhas do tecido */}
      {!ehBailarina && (
        <g fill={d} opacity="0.7">
          <circle cx="86" cy="182" r="3" />
          <circle cx="104" cy="174" r="3" />
          <circle cx="120" cy="188" r="3" />
          <circle cx="94" cy="200" r="3" />
          <circle cx="112" cy="206" r="3" />
          <circle cx="78" cy="202" r="3" />
        </g>
      )}

      {/* barra de renda */}
      {!ehBailarina && (
        <g fill={d}>
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx={54 + i * 11.5} cy={barra - 2} r="5.5" />
          ))}
        </g>
      )}

      {/* tutu de tule em três camadas */}
      {ehBailarina && (
        <g>
          <ellipse cx="100" cy={barra - 22} rx="78" ry="24" fill={d} opacity="0.5" />
          <ellipse cx="100" cy={barra - 30} rx="66" ry="21" fill={v} opacity="0.85" />
          <ellipse cx="100" cy={barra - 38} rx="52" ry="17" fill={d} opacity="0.9" />
          {/* faixa da cintura + lacinho */}
          <path
            d={`M64 ${barra - 54} q36 10 72 0 l0 8 q-36 10 -72 0 z`}
            fill={escurecer(v, 0.14)}
          />
          <g transform={`translate(100 ${barra - 48})`}>
            <path d="M0 0 q-16 -9 -18 2 q12 8 18 -2 z" fill={d} />
            <path d="M0 0 q16 -9 18 2 q-12 8 -18 -2 z" fill={d} />
            <circle cx="0" cy="1" r="4" fill={escurecer(d, 0.2)} />
          </g>
        </g>
      )}

      {spec.coracao && !ehBailarina && (
        <g>
          <path
            d="M100 196 c-9 -12 -22 -6 -22 4 c0 9 12 15 22 23 c10 -8 22 -14 22 -23 c0 -10 -13 -16 -22 -4 z"
            fill={spec.coracao}
            opacity="0.9"
          />
          <path
            d="M100 196 c-9 -12 -22 -6 -22 4 c0 9 12 15 22 23 c10 -8 22 -14 22 -23 c0 -10 -13 -16 -22 -4 z"
            fill="none"
            stroke="#fffafb"
            strokeWidth="1.6"
            strokeDasharray="4 4"
          />
        </g>
      )}
    </g>
  );
}

function CorpoNaninha({ spec }: { spec: DollSpec }) {
  const v = spec.vestido;
  const d = spec.vestidoDetalhe;
  return (
    <g>
      <path
        d="M46 140 q54 -14 108 0 q14 60 4 108 q-58 16 -116 0 q-10 -48 4 -108 z"
        fill={v}
        stroke={escurecer(v, 0.12)}
        strokeWidth="1.5"
      />
      <path
        d="M60 160 q40 -10 80 0 q8 40 2 72 q-42 10 -84 0 q-6 -32 2 -72 z"
        fill={d}
        opacity="0.55"
      />
      <g fill={d}>
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={48 + i * 11.6} cy="246" r="6" />
        ))}
      </g>
      {spec.coracao && (
        <path
          d="M100 186 c-8 -11 -20 -5 -20 4 c0 8 11 14 20 21 c9 -7 20 -13 20 -21 c0 -9 -12 -15 -20 -4 z"
          fill={spec.coracao}
          opacity="0.85"
        />
      )}
    </g>
  );
}

/* ---------------------------------- Cabeça ---------------------------------- */

function Cabeca({
  spec,
  ehBicho,
  ehNaninha,
}: {
  spec: DollSpec;
  ehBicho: boolean;
  ehNaninha: boolean;
}) {
  const cy = ehNaninha ? 92 : 80;
  const rx = ehBicho ? 48 : 46;
  const ry = ehBicho ? 44 : 48;

  return (
    <g>
      <ellipse
        cx="100"
        cy={cy}
        rx={rx}
        ry={ry}
        fill={spec.pele}
        stroke={escurecer(spec.pele, 0.14)}
        strokeWidth="1.5"
      />
      <ellipse cx="84" cy={cy - 16} rx="14" ry="10" fill={clarear(spec.pele, 0.18)} opacity="0.32" />
    </g>
  );
}

function Rosto({
  spec,
  ehBicho,
  ehNaninha,
}: {
  spec: DollSpec;
  ehBicho: boolean;
  ehNaninha: boolean;
}) {
  const cy = ehNaninha ? 92 : 80;
  const linha = '#4a3229';

  return (
    <g>
      {ehBicho && (
        <g>
          <ellipse cx="100" cy={cy + 16} rx="26" ry="20" fill={clarear(spec.pele, 0.3)} />
          <ellipse cx="100" cy={cy + 6} rx="8" ry="6" fill={linha} />
          <path
            d={`M100 ${cy + 12} v6 M100 ${cy + 18} q-8 8 -14 0 M100 ${cy + 18} q8 8 14 0`}
            stroke={linha}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {spec.olhos === 'abertos' ? (
        /* olhinhos redondos, com brilho — como nas bonecas do ateliê */
        <g>
          {[78, 122].map((ox) => (
            <g key={ox}>
              <ellipse cx={ox} cy={cy - 2} rx="9" ry="10.5" fill={linha} />
              <circle cx={ox - 2.6} cy={cy - 6} r="3.4" fill="#fffafb" />
              <circle cx={ox + 3} cy={cy + 2} r="1.6" fill="#fffafb" opacity="0.85" />
            </g>
          ))}
          {/* sobrancelhas bordadas */}
          <g stroke={linha} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75">
            <path d={`M70 ${cy - 16} q8 -5 16 -1`} />
            <path d={`M114 ${cy - 17} q8 -4 16 1`} />
          </g>
        </g>
      ) : (
        <>
          {/* olhinhos bordados (fechados, felizes) */}
          <g stroke={linha} strokeWidth="4" strokeLinecap="round" fill="none">
            <path d={`M68 ${cy + 2} q10 -13 20 0`} />
            <path d={`M112 ${cy + 2} q10 -13 20 0`} />
          </g>
          {/* cílios */}
          <g stroke={linha} strokeWidth="2.4" strokeLinecap="round">
            <path d={`M65 ${cy - 2} l-6 -5`} />
            <path d={`M135 ${cy - 2} l6 -5`} />
          </g>
        </>
      )}

      {/* bochechas */}
      <ellipse cx="64" cy={cy + 16} rx="13" ry="9" fill="#f191ab" opacity="0.45" />
      <ellipse cx="136" cy={cy + 16} rx="13" ry="9" fill="#f191ab" opacity="0.45" />

      {!ehBicho && (
        <g>
          {/* narizinho e boquinha */}
          <circle cx="100" cy={cy + 10} r="2.6" fill={escurecer(spec.pele, 0.3)} />
          <path
            d={`M92 ${cy + 22} q8 9 16 0`}
            stroke={linha}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {spec.sardas && (
        <g fill={escurecer(spec.pele, 0.28)} opacity="0.75">
          <circle cx="76" cy={cy + 20} r="1.9" />
          <circle cx="84" cy={cy + 25} r="1.9" />
          <circle cx="116" cy={cy + 20} r="1.9" />
          <circle cx="124" cy={cy + 25} r="1.9" />
        </g>
      )}
    </g>
  );
}

/* -------------------------------- Acessórios -------------------------------- */

function AcessorioArt({ spec, ehNaninha }: { spec: DollSpec; ehNaninha: boolean }) {
  const cor = spec.acessorioCor;
  const escuro = escurecer(cor, 0.18);
  const topo = ehNaninha ? 46 : 32;

  switch (spec.acessorio) {
    case 'laco':
      return (
        <g transform={`translate(0 ${topo - 32})`}>
          <path d="M138 44 q-22 -18 -26 2 q18 12 26 -2 z" fill={cor} />
          <path d="M138 44 q22 -18 26 2 q-18 12 -26 -2 z" fill={cor} />
          <circle cx="138" cy="45" r="7" fill={escuro} />
          <path d="M132 52 q-6 14 -2 22" stroke={cor} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M144 52 q6 14 2 22" stroke={cor} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'flor':
      return (
        <g transform={`translate(0 ${topo - 32})`}>
          <g fill={cor}>
            <circle cx="52" cy="42" r="9" />
            <circle cx="68" cy="36" r="9" />
            <circle cx="82" cy="44" r="9" />
            <circle cx="66" cy="52" r="9" />
          </g>
          <circle cx="67" cy="44" r="7" fill="#fdf6ec" />
          <circle cx="67" cy="44" r="3.4" fill={escuro} />
        </g>
      );
    case 'coroa':
      return (
        <g transform={`translate(0 ${topo - 32})`}>
          <path
            d="M66 40 l10 -22 l12 16 l12 -22 l12 22 l12 -16 l10 22 z"
            fill={cor}
            stroke={escuro}
            strokeWidth="1.6"
          />
          <rect x="66" y="38" width="68" height="9" rx="4.5" fill={escuro} />
          <circle cx="112" cy="20" r="4" fill="#fffafb" />
        </g>
      );
    case 'chapeu':
      return (
        <g transform={`translate(0 ${topo - 32})`}>
          <ellipse cx="100" cy="42" rx="66" ry="16" fill={cor} />
          <ellipse cx="100" cy="30" rx="38" ry="24" fill={clarear(cor, 0.1)} />
          <rect x="62" y="30" width="76" height="10" rx="5" fill={spec.vestido} />
          <ellipse cx="100" cy="42" rx="66" ry="16" fill="none" stroke={escuro} strokeWidth="1.6" />
        </g>
      );
    case 'boina':
      return (
        <g transform={`translate(0 ${topo - 32})`}>
          {/* aba, copa e pompom da boina */}
          <ellipse cx="100" cy="40" rx="54" ry="20" fill={escuro} />
          <ellipse cx="100" cy="30" rx="48" ry="22" fill={cor} />
          <ellipse cx="86" cy="22" rx="20" ry="10" fill={clarear(cor, 0.16)} opacity="0.7" />
          <ellipse cx="100" cy="46" rx="44" ry="8" fill={escuro} opacity="0.4" />
          <circle cx="112" cy="6" r="12" fill={clarear(cor, 0.1)} />
          <circle cx="108" cy="2" r="4" fill={clarear(cor, 0.28)} opacity="0.8" />
        </g>
      );
    case 'tiara':
      return (
        <g transform={`translate(0 ${topo - 32})`}>
          <path d="M52 52 q48 -42 96 0" stroke={cor} strokeWidth="8" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="46" r="5" fill={escuro} />
          <circle cx="140" cy="46" r="5" fill={escuro} />
          <path
            d="M100 16 c-6 -8 -15 -4 -15 3 c0 6 8 10 15 16 c7 -6 15 -10 15 -16 c0 -7 -9 -11 -15 -3 z"
            fill={cor}
          />
        </g>
      );
    default:
      return null;
  }
}
