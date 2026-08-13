import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import Logo from './Logo';
import { useCatalogo } from '../store/catalogo';
import { useCarrinho } from '../store/carrinho';
import { site } from '../config/site';

const links = [
  { para: '/', rotulo: 'Início' },
  { para: '/bonecas', rotulo: 'Bonecas' },
  { para: '/sobre', rotulo: 'O Ateliê' },
  { para: '/contato', rotulo: 'Contato' },
];

export default function Cabecalho() {
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [categoriasAbertas, setCategoriasAbertas] = useState(false);
  const { quantidadeTotal, abrirGaveta } = useCarrinho();
  const { categorias } = useCatalogo();
  const local = useLocation();

  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 16);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  useEffect(() => {
    setMenuAberto(false);
    setCategoriasAbertas(false);
  }, [local.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuAberto]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          rolou ? 'bg-rosa-50/95 shadow-[0_10px_30px_-24px_rgba(194,86,116,0.9)]' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.para}
                to={l.para}
                end={l.para === '/'}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-rosa-700' : 'text-sepia-700 hover:text-rosa-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.rotulo}
                    {isActive && (
                      <motion.span
                        layoutId="nav-ativo"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-rosa-500"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setCategoriasAbertas(true)}
              onMouseLeave={() => setCategoriasAbertas(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-sepia-700 transition-colors hover:text-rosa-600"
                onClick={() => setCategoriasAbertas((v) => !v)}
              >
                Categorias
                <motion.span animate={{ rotate: categoriasAbertas ? 180 : 0 }} className="text-xs">
                  ▾
                </motion.span>
              </button>

              <AnimatePresence>
                {categoriasAbertas && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full w-72 overflow-hidden rounded-2xl border border-rosa-200 bg-white/95 p-2 shadow-xl backdrop-blur"
                  >
                    {categorias.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/categoria/${c.slug}`}
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-rosa-100"
                      >
                        <span className="text-xl" aria-hidden="true">
                          {c.emoji}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-sepia-900">{c.nome}</span>
                          <span className="block text-xs text-sepia-500">{c.subtitulo}</span>
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-rosa-300 text-rosa-700 transition-colors hover:bg-rosa-200 sm:flex"
              aria-label="Instagram do ateliê"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.4.6.23 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.9-11.1a1.55 1.55 0 1 1-1.55-1.55A1.55 1.55 0 0 1 18.9 5.2z" />
              </svg>
            </a>

            <button
              type="button"
              onClick={abrirGaveta}
              className="relative flex h-10 items-center gap-2 rounded-full border border-rosa-300 bg-white/70 px-3 text-rosa-700 transition-colors hover:bg-rosa-200"
              aria-label="Abrir sacolinha"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
              </svg>
              <AnimatePresence>
                {quantidadeTotal > 0 && (
                  <motion.span
                    key={quantidadeTotal}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rosa-600 px-1 text-[0.65rem] font-bold text-white"
                  >
                    {quantidadeTotal}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-rosa-300 text-rosa-700 transition-colors hover:bg-rosa-200 lg:hidden"
              aria-label="Abrir menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <motion.div className="h-0.5 origin-left bg-rosa-500" style={{ scaleX: progresso }} />
      </header>

      <MenuMobile aberto={menuAberto} fechar={() => setMenuAberto(false)} />
    </>
  );
}

function MenuMobile({ aberto, fechar }: { aberto: boolean; fechar: () => void }) {
  const { categorias } = useCatalogo();

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-sepia-900/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fechar}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[70] flex w-[86%] max-w-sm flex-col overflow-y-auto bg-rosa-50 p-6 shadow-2xl lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="flex items-center justify-between">
              <Logo variante="emblema" className="h-12 w-12" />
              <button
                type="button"
                onClick={fechar}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-rosa-300 text-rosa-700"
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.div
                  key={l.para}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                >
                  <NavLink
                    to={l.para}
                    end={l.para === '/'}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-3 font-display text-xl ${
                        isActive ? 'bg-rosa-200 text-rosa-700' : 'text-sepia-800'
                      }`
                    }
                  >
                    {l.rotulo}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <p className="mt-8 px-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-sepia-500">
              Categorias
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {categorias.map((c, i) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.24 + 0.05 * i }}
                >
                  <Link
                    to={`/categoria/${c.slug}`}
                    className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sepia-800 transition-colors hover:bg-rosa-100"
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    <span className="text-sm font-semibold">{c.nome}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <p className="font-script text-2xl text-rosa-700">{site.slogan}</p>
              <p className="mt-1 text-xs text-sepia-500">{site.whatsappExibicao}</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
