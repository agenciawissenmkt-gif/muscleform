import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PETAL_COLORS = ['var(--color-rose-400)', 'var(--color-gold-400)', 'var(--color-rose-500)', '#f4d9c6'];

function Petal({ x, delay, duration, scale, color }: { x: number; delay: number; duration: number; scale: number; color: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={22 * scale}
      height={22 * scale}
      className="absolute bottom-0"
      style={{ left: `${x}%` }}
      initial={{ y: 40, opacity: 0, rotate: 0 }}
      animate={{ y: '-120vh', opacity: [0, 1, 1, 0], rotate: 220 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      <path
        d="M12 2c2 2 2 5 0 7-2-2-2-5 0-7Zm0 20c-2-2-2-5 0-7 2 2 2 5 0 7ZM2 12c2-2 5-2 7 0-2 2-5 2-7 0Zm20 0c-2 2-5 2-7 0 2-2 5-2 7 0Z"
        fill={color}
        opacity={0.9}
      />
      <circle cx="12" cy="12" r="2.4" fill="var(--color-gold-500)" />
    </motion.svg>
  );
}

export default function CaptureReveal({ visible }: { visible: boolean }) {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        key: i,
        x: 4 + Math.random() * 92,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 0.9,
        scale: 0.7 + Math.random() * 0.8,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
      })),
    // Re-randomize petal positions each time the overlay is shown again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-ink-900/55 backdrop-blur-sm"
        >
          {petals.map((p) => (
            <Petal key={p.key} x={p.x} delay={p.delay} duration={p.duration} scale={p.scale} color={p.color} />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative flex flex-col items-center gap-3 px-8 text-center"
          >
            <motion.span
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="text-3xl"
            >
              ✨
            </motion.span>
            <p className="font-display text-xl font-semibold leading-snug text-cream-50">
              Sua nova versão
              <br />
              mais radiante
            </p>
            <p className="text-xs tracking-[0.3em] text-cream-50/70">YOUR BEAUTY</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
