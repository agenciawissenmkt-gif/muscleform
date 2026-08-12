import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** 'zoom' entra crescendo, 'lado' entra deslizando da esquerda */
  efeito?: 'sobe' | 'zoom' | 'lado';
}

/** Aparece com transição suave quando entra na tela. */
export default function Reveal({ children, delay = 0, y = 28, className = '', efeito = 'sobe' }: Props) {
  const inicial =
    efeito === 'zoom'
      ? { opacity: 0, scale: 0.9 }
      : efeito === 'lado'
        ? { opacity: 0, x: -36 }
        : { opacity: 0, y };

  const fim = efeito === 'zoom' ? { opacity: 1, scale: 1 } : efeito === 'lado' ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={inicial}
      whileInView={fim}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
