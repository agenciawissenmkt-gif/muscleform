import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { IconeWhats } from './Rodape';
import { linkWhatsApp, site } from '../config/site';

/** Botãozinho verde flutuante — sempre à mão para chamar o ateliê. */
export default function WhatsAppFlutuante() {
  const [balaoVisivel, setBalaoVisivel] = useState(false);
  const { pathname } = useLocation();
  // na página do produto o celular já mostra a barra de compra fixa — evita dois botões verdes
  const escondeNoCelular = pathname.startsWith('/boneca/');

  useEffect(() => {
    const abre = setTimeout(() => setBalaoVisivel(true), 6000);
    const fecha = setTimeout(() => setBalaoVisivel(false), 16000);
    return () => {
      clearTimeout(abre);
      clearTimeout(fecha);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-4 z-[75] flex-col items-end gap-2 sm:bottom-7 sm:right-6 ${
        escondeNoCelular ? 'hidden lg:flex' : 'flex'
      }`}
    >
      <AnimatePresence>
        {balaoVisivel && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="max-w-[15rem] rounded-2xl rounded-br-sm border border-rosa-200 bg-white px-4 py-3 text-sm text-sepia-800 shadow-lg"
          >
            <p className="font-semibold text-rosa-700">Oi! 💕</p>
            <p className="mt-0.5 text-xs leading-relaxed">
              Posso te ajudar a escolher a boneca certinha? Chama no WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => setBalaoVisivel(false)}
              className="absolute right-2 top-2 text-xs text-sepia-300 hover:text-sepia-700"
              aria-label="Fechar aviso"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={linkWhatsApp(`Olá, ${site.nome}! Vim pelo site 💕`)}
        target="_blank"
        rel="noopener noreferrer"
        className="botao-sonho animate-pulsar-neon flex h-14 w-14 items-center justify-center rounded-full"
        whileHover={{ scale: 1.08, rotate: 4 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Falar no WhatsApp"
      >
        <IconeWhats className="h-7 w-7" />
      </motion.a>
    </div>
  );
}
