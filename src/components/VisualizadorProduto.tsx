import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Doll3D, { DollPlana } from './Doll3D';
import type { DollSpec } from '../data/types';

type Modo = 'girar' | 'zoom';

interface Props {
  spec: DollSpec;
  nome: string;
}

/** Palco do produto: gira a boneca em 3D ou dá zoom nos detalhes da costura. */
export default function VisualizadorProduto({ spec, nome }: Props) {
  const [modo, setModo] = useState<Modo>('girar');
  const [zoomAtivo, setZoomAtivo] = useState(false);
  const [origem, setOrigem] = useState({ x: 50, y: 50 });
  const palco = useRef<HTMLDivElement>(null);

  function moverZoom(e: React.PointerEvent<HTMLDivElement>) {
    const caixa = palco.current?.getBoundingClientRect();
    if (!caixa) return;
    const x = ((e.clientX - caixa.left) / caixa.width) * 100;
    const y = ((e.clientY - caixa.top) / caixa.height) * 100;
    setOrigem({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    if (e.pointerType === 'mouse') setZoomAtivo(true);
  }

  return (
    <div className="relative">
      <div
        ref={palco}
        className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-rosa-200 bg-gradient-to-br from-creme-50 via-rosa-100 to-rosa-200 sombra-suave"
        onPointerMove={modo === 'zoom' ? moverZoom : undefined}
        onPointerLeave={() => setZoomAtivo(false)}
        onPointerDown={(e) => {
          if (modo === 'zoom' && e.pointerType !== 'mouse') setZoomAtivo((v) => !v);
        }}
      >
        <FundoAtelier />

        <AnimatePresence mode="wait">
          {modo === 'girar' ? (
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
          ) : (
            <motion.div
              key="zoom"
              className="absolute inset-0 overflow-hidden p-6 sm:p-10"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="h-full w-full"
                animate={{ scale: zoomAtivo ? 2.4 : 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                style={{ transformOrigin: `${origem.x}% ${origem.y}%` }}
              >
                <DollPlana spec={spec} className="h-full w-full" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* lupa acompanhando o cursor */}
        {modo === 'zoom' && zoomAtivo && (
          <motion.span
            className="pointer-events-none absolute z-10 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 sm:block"
            style={{ left: `${origem.x}%`, top: `${origem.y}%` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            aria-hidden="true"
          />
        )}

        <span className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-sepia-700 backdrop-blur sm:px-4 sm:text-[0.68rem] sm:tracking-[0.16em]">
          {modo === 'girar' ? 'Arraste para girar a boneca' : 'Passe o dedo ou o mouse para o zoom'}
        </span>

        <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-rosa-600 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white shadow">
          Feito à mão
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Aba ativo={modo === 'girar'} onClick={() => setModo('girar')} rotulo="Girar em 3D" icone="🔄" />
        <Aba ativo={modo === 'zoom'} onClick={() => setModo('zoom')} rotulo="Zoom nos detalhes" icone="🔍" />
      </div>

      <p className="mt-3 text-center text-xs text-sepia-500">
        Ilustração 3D de <span className="font-semibold text-sepia-700">{nome}</span> — cada peça é costurada à
        mão, então pequenas variações fazem parte do encanto.
      </p>
    </div>
  );
}

function Aba({
  ativo,
  onClick,
  rotulo,
  icone,
}: {
  ativo: boolean;
  onClick: () => void;
  rotulo: string;
  icone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
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
        {rotulo}
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
