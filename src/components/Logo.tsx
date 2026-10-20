import { Flower } from './Flowers';

export default function Logo({ size = 'md', light = false }: { size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const text = size === 'lg' ? 'text-[2.4rem] sm:text-5xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  const flower = size === 'lg' ? 46 : size === 'md' ? 30 : 24;
  return (
    <div className="flex items-center gap-2 select-none" aria-label="Beauty and self">
      <Flower size={flower} className={size === 'lg' ? 'spin-slow' : ''} />
      <span
        className={`font-display font-bold italic leading-none tracking-tight ${text} ${light ? 'text-white' : 'text-gradient'}`}
      >
        Beauty <span className={`font-semibold ${light ? 'text-white/75' : 'text-plum-400'}`}>and</span> self
      </span>
    </div>
  );
}
