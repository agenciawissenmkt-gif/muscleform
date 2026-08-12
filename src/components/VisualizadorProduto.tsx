import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Doll3D, { DollPlana } from './Doll3D';
import type { DollSpec } from '../data/types';

type Modo = 'foto' | 'girar' | 'zoom';

interface Props {
  spec: DollSpec;
  nome: string;
  foto?: string;
  legendaFoto?: string;
}

/** Palco do produto: foto real, giro em 3D e zoom nos detalhes da costura. */
export default function VisualizadorProduto({ spec, nome, foto, legendaFoto }: Props) {
  const [semFoto, setSemFoto] = useState(false);
  const temFoto = Boolean(foto) && !semFoto;

  const [modo, setModo] = useState<Modo>(foto ? 'foto' : 'girar');
  const [zoomAtivo, setZoomAtivo] = useState(false);
  const [origem, setOrigem] = useState({ x: 50, y: 50 });
  const palco = useRef<HTMLDivElement>(null);

  const modoAtual: Modo = modo === 'foto' && !temFoto ? 'girar' : modo;
  const comZoom = modoAtual === 'zoom';

  function moverZoom(e: React.PointerEvent<HTMLDivElement>) {
    const caixa = palco.current?.getBoundingClientRect();
    if (!caixa) return;
    const x = ((e.clientX - caixa.left) / caixa.width) * 100;
    const y = ((e.clientY - caixa.top) / caixa.height) * 100;
    setOrigem({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    if (e.pointerType === 'mouse') setZoomAtivo(true);
  }

  const legenda =
    modoAtual === 'girar'
      ? 'Arraste para girar a boneca'
      : modoAtual === 'zoom'
        ? 'Passe o dedo ou o mouse para o zoom'
        : (legendaFoto ?? 'Foto da peça feita à mão');

  return (
    <div className="relative">
      <div
        ref={palco}
        className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-rosa-200 bg-gradient-to-br from-creme-50 via-rosa-100 to-rosa-200 sombra-suave"
        onPointerMove={comZoom ? moverZoom : undefined}
        onPointerLeave={() => setZoomAtivo(false)}
        onPointerDown={(e) => {
          if (comZoom && e.pointerType !== 'mouse') setZoomAtivo((v) => !v);
        }}
      >
        <FundoAtelier />

        <AnimatePresence mode="wait">
          {modoAtual === 'foto' && (
            <motion.div
              key="foto"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              {/* a foto aparece exatamente como veio do ateliê, sem corte nem efeito */}
              <img
                src={foto}
                alt={`${nome} — boneca de pano feita à mão`}
                className="h-full w-full object-contain"
                onError={() => setSemFoto(true)}
                decoding="async"
              />
            </motion.div>
          )}

          {modoAtual === 'girar' && (
            <motion.div
              key="girar"
              className="absolute inset-0 p-6 sm:p-10"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35 }}
            >
              <Doll3D spec={spec} profundidade={1.35} className="h-full w-full" />
            </motion.div>
          )}

          {modoAtual === 'zoom' && (
            <motion.div
              key="zoom"
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className={`h-full w-full ${temFoto ? '' : 'p-6 sm:p-10'}`}
                animate={{ scale: zoomAtivo ? 2.4 : 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                style={{ transformOrigin: `${origem.x}% ${origem.y}%` }}
              >
                {temFoto ? (
                  <img
                    src={foto}
                    alt={`Detalhe da costura de ${nome}`}
                    className="h-full w-full object-contain"
                    onError={() => setSemFoto(true)}
                    decoding="async"
                  />
                ) : (
                  <DollPlana spec={spec} className="h-full w-full" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {comZoom && zoomAtivo && (
          <motion.span
            className="pointer-events-none absolute z-10 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 sm:block"
            style={{ left: `${origem.x}%`, top: `${origem.y}%` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            aria-hidden="true"
          />
        )}

        <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 max-w-[92%] -translate-x-1/2 truncate rounded-full bg-white/85 px-3 py-1.5 text-center text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-sepia-700 backdrop-blur sm:bottom-4 sm:px-4 sm:text-[0.68rem] sm:tracking-[0.16em]">
          {legenda}
        </span>

        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-rosa-600 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-white shadow sm:left-4 sm:top-4 sm:px-3 sm:text-[0.62rem] sm:tracking-[0.16em]">
          Feito à mão
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {temFoto && (
          <Aba ativo={modoAtual === 'foto'} onClick={() => setModo('foto')} rotulo="Foto real" icone="📷" />
        )}
        <Aba
          ativo={modoAtual === 'girar'}
          onClick={() => setModo('girar')}
          rotulo="Girar em 3D"
          rotuloCurto="3D"
          icone="🔄"
        />
        <Aba
          ativo={modoAtual === 'zoom'}
          onClick={() => setModo('zoom')}
          rotulo="Zoom nos detalhes"
          rotuloCurto="Zoom"
          icone="🔍"
        />
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-sepia-500">
        <span className="font-semibold text-sepia-700">{nome}</span> — cada peça é costurada à mão, então
        pequenas variações fazem parte do encanto.
      </p>
    </div>
  );
}

function Aba({
  ativo,
  onClick,
  rotulo,
  rotuloCurto,
  icone,
}: {
  ativo: boolean;
  onClick: () => void;
  rotulo: string;
  rotuloCurto?: string;
  icone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full px-3 py-2 text-[0.7rem] font-semibold transition-colors sm:px-4 sm:text-sm ${
        ativo ? 'text-white' : 'text-sepia-700 hover:text-rosa-700'
      }`}
    >
      {ativo && (
        <motion.span
          layoutId="aba-visualizador"
          className="absolute inset-0 rounded-full bg-rosa-600"
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        <span aria-hidden="true">{icone}</span>
        <span className={rotuloCurto ? 'hidden sm:inline' : undefined}>{rotulo}</span>
        {rotuloCurto && <span className="sm:hidden">{rotuloCurto}</span>}
      </span>
    </button>
  );
}

function FundoAtelier() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-45" aria-hidden="true">
      <defs>
        <pattern id="bolinhas" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.2" fill="#ffd0dc" />
          <circle cx="17" cy="17" r="1.4" fill="#fffafb" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bolinhas)" />
    </svg>
  );
}
