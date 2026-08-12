import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CTA_COMPRA } from '../config/site';

interface Props {
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
  tamanho?: 'md' | 'lg';
  className?: string;
  icone?: ReactNode;
}

/**
 * Botão de compra verde fluorescente — "Realize seu sonho".
 * É o único botão do site com essa cor, para não competir com nada.
 */
export default function BotaoSonho({
  href,
  onClick,
  children = CTA_COMPRA,
  tamanho = 'md',
  className = '',
  icone,
}: Props) {
  const classes = [
    'botao-sonho group relative inline-flex items-center justify-center gap-2.5 rounded-full font-bold uppercase tracking-wide',
    'animate-pulsar-neon focus:outline-none focus-visible:ring-4 focus-visible:ring-neon-300/70',
    tamanho === 'lg' ? 'px-8 py-4 text-base sm:text-lg' : 'px-6 py-3 text-sm sm:text-base',
    className,
  ].join(' ');

  const conteudo = (
    <>
      <span className="relative flex h-5 w-5 items-center justify-center">
        {icone ?? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M12 21s-7.5-4.7-9.6-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9z" />
          </svg>
        )}
      </span>
      <span>{children}</span>
      <span
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/45 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={classes}
        whileTap={{ scale: 0.97 }}
      >
        {conteudo}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" onClick={onClick} className={classes} whileTap={{ scale: 0.97 }}>
      {conteudo}
    </motion.button>
  );
}
