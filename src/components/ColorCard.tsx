import { motion } from 'framer-motion';
import type { HairColor } from '../data/haircolors';

interface ColorCardProps {
  color: HairColor;
  onClick?: () => void;
  index?: number;
}

export default function ColorCard({ color, onClick, index = 0 }: ColorCardProps) {
  const gradient = `linear-gradient(135deg, ${color.swatch.join(', ')})`;

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
        <span
          className="h-[64%] aspect-square rounded-full shadow-inner ring-4 ring-white transition-transform duration-300 group-hover:scale-105"
          style={{ background: gradient }}
        />
      </div>
      <div className="flex flex-col gap-1 px-4 py-3.5">
        <span className="font-display text-[15px] leading-tight text-ink-900">{color.name}</span>
        {color.aka && <span className="text-xs text-ink-600/70">{color.aka}</span>}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-600">
            {color.family === 'tecnica' ? 'Técnica' : color.family.charAt(0).toUpperCase() + color.family.slice(1)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
