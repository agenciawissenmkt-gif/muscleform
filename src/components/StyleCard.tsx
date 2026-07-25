import { motion } from 'framer-motion';
import type { Haircut } from '../data/haircuts';
import { hairSilhouettePath } from '../lib/silhouette';

interface StyleCardProps {
  haircut: Haircut;
  onClick?: () => void;
  index?: number;
}

export default function StyleCard({ haircut, onClick, index = 0 }: StyleCardProps) {
  const d = hairSilhouettePath(haircut.silhouette, 160, 190);
  const gradId = `sc-${haircut.id}`;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="group flex w-full flex-col overflow-hidden rounded-3xl border border-blush-200/70 bg-white text-left shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="flex aspect-[4/3.6] items-center justify-center bg-gradient-to-b from-blush-50 to-blush-100">
        <svg viewBox="0 0 160 190" className="h-[78%] drop-shadow-sm transition-transform duration-300 group-hover:scale-105">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-rose-400)" />
              <stop offset="1" stopColor="var(--color-gold-400)" />
            </linearGradient>
          </defs>
          <path d={d} fill={`url(#${gradId})`} opacity={0.9} />
        </svg>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3.5">
        <span className="font-display text-[15px] leading-tight text-ink-900">{haircut.name}</span>
        {haircut.aka && <span className="text-xs text-ink-600/70">{haircut.aka}</span>}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-600">
            {haircut.length === 'curto' ? 'Curto' : haircut.length === 'medio' ? 'Médio' : 'Longo'}
          </span>
          <span className="rounded-full bg-cream-50 px-2.5 py-0.5 text-[11px] font-medium text-ink-600 ring-1 ring-blush-200">
            {haircut.origin}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
