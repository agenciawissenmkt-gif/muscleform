import { useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useSpring } from 'framer-motion';
import DollArt, { CAMADAS } from './DollArt';
import type { DollSpec } from '../data/types';

interface Props {
  spec: DollSpec;
  /** Deixa a boneca girar sozinha, de leve. */
  flutuar?: boolean;
  /** Permite girar a boneca com o mouse (desktop) ou arrastando (celular). */
  interativa?: boolean;
  /** Multiplica a separação entre as camadas — quanto maior, mais volume. */
  profundidade?: number;
  className?: string;
  sombra?: boolean;
}

export default function Doll3D({
  spec,
  flutuar = true,
  interativa = true,
  profundidade = 1,
  className = '',
  sombra = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(false);
  const arrastando = useRef(false);
  const ultimoX = useRef(0);
  const giroAcumulado = useRef(0);
  const tempo = useRef(0);

  const giroY = useMotionValue(0);
  const giroX = useMotionValue(0);
  const flutuarY = useMotionValue(0);

  const rotY = useSpring(giroY, { stiffness: 90, damping: 16, mass: 0.6 });
  const rotX = useSpring(giroX, { stiffness: 90, damping: 16, mass: 0.6 });
  const y = useSpring(flutuarY, { stiffness: 60, damping: 20 });

  // Balanço suave contínuo — a boneca "respira" mesmo parada.
  useAnimationFrame((t) => {
    tempo.current = t;
    if (!flutuar) return;
    const idle = Math.sin(t / 1600) * 6;
    const sobe = Math.sin(t / 1400) * 6;
    if (!ativo && !arrastando.current) {
      giroY.set(giroAcumulado.current + idle);
      giroX.set(Math.sin(t / 2100) * 3);
    }
    flutuarY.set(sobe);
  });

  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    if (!interativa) return;

    if (e.pointerType === 'mouse') {
      const caixa = ref.current?.getBoundingClientRect();
      if (!caixa) return;
      const px = (e.clientX - caixa.left) / caixa.width - 0.5;
      const py = (e.clientY - caixa.top) / caixa.height - 0.5;
      setAtivo(true);
      giroY.set(giroAcumulado.current + px * 52);
      giroX.set(-py * 24);
      return;
    }

    if (arrastando.current) {
      const delta = e.clientX - ultimoX.current;
      ultimoX.current = e.clientX;
      giroAcumulado.current = Math.max(-160, Math.min(160, giroAcumulado.current + delta * 0.6));
      giroY.set(giroAcumulado.current);
    }
  }

  function aoPressionar(e: React.PointerEvent<HTMLDivElement>) {
    if (!interativa || e.pointerType === 'mouse') return;
    arrastando.current = true;
    ultimoX.current = e.clientX;
    setAtivo(true);
  }

  function aoSoltar() {
    arrastando.current = false;
    setAtivo(false);
  }

  function aoSair() {
    arrastando.current = false;
    setAtivo(false);
    giroX.set(0);
    giroY.set(giroAcumulado.current);
  }

  return (
    <div
      ref={ref}
      className={`cena-3d relative select-none ${interativa ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      onPointerMove={aoMover}
      onPointerDown={aoPressionar}
      onPointerUp={aoSoltar}
      onPointerLeave={aoSair}
      style={{ touchAction: 'pan-y' }}
    >
      <motion.div
        className="preserve-3d relative h-full w-full"
        style={{ rotateY: rotY, rotateX: rotX, y }}
      >
        {CAMADAS.map(({ camada, z }) => (
          <DollArt
            key={camada}
            spec={spec}
            camada={camada}
            className="absolute inset-0 h-full w-full"
            style={{
              transform: `translateZ(${z * profundidade}px)`,
              filter:
                camada === 'sombra'
                  ? 'blur(6px)'
                  : camada === 'cabeca' || camada === 'corpo'
                    ? 'drop-shadow(0 6px 10px rgba(194, 86, 116, 0.18))'
                    : undefined,
            }}
          />
        ))}
      </motion.div>

      {sombra && <Faisca />}
    </div>
  );
}

/** Brilhinhos que sobem ao redor da boneca. */
function Faisca() {
  const pontos = [
    { left: '6%', top: '22%', delay: 0, tamanho: 10 },
    { left: '88%', top: '30%', delay: 1.4, tamanho: 8 },
    { left: '16%', top: '70%', delay: 2.6, tamanho: 7 },
    { left: '82%', top: '66%', delay: 3.4, tamanho: 11 },
  ];
  return (
    <>
      {pontos.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-rosa-500"
          style={{ left: p.left, top: p.top, fontSize: p.tamanho }}
          animate={{ y: [0, -18, 0], opacity: [0, 1, 0], scale: [0.7, 1.1, 0.7] }}
          transition={{ duration: 4.2, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          ✦
        </motion.span>
      ))}
    </>
  );
}

/** Versão estática e leve, para listas grandes. */
export function DollPlana({ spec, className = '' }: { spec: DollSpec; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {CAMADAS.map(({ camada }) => (
        <DollArt key={camada} spec={spec} camada={camada} className="absolute inset-0 h-full w-full" />
      ))}
    </div>
  );
}
