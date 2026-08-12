import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/** Cada página entra suavinho e o scroll volta ao topo. */
export default function TransicaoPagina({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pt-20 sm:pt-24"
    >
      {children}
    </motion.main>
  );
}
