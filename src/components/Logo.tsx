import { Flower } from './Flowers';

export default function Logo({ size = 'md', light = false }: { size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const text = size === 'lg' ? 'text-[2.4rem] sm:text-5xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  const flower = size === 'lg' ? 46 : size === 'md' ? 30 : 24;
  // As letras inclinadas passam da caixa do texto (o "g" e o "y" descem, o fim do "y" sai para a direita).
  // A folga deixa o degradê pintar as letras inteiras; a margem negativa mantém o alinhamento.
  return (
    <div className="flex items-center gap-2 select-none" aria-label="Mega Beauty">
      <Flower size={flower} className={size === 'lg' ? 'spin-slow' : ''} />
      <span
        className={`-mb-[0.2em] -mr-[0.15em] pb-[0.2em] pr-[0.15em] font-display font-bold italic leading-none tracking-tight ${text} ${light ? 'text-white' : 'text-gradient'}`}
      >
        Mega Beauty
      </span>
    </div>
  );
}
