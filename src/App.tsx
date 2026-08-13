import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import Cabecalho from './components/Cabecalho';
import Rodape from './components/Rodape';
import GavetaCarrinho from './components/GavetaCarrinho';
import WhatsAppFlutuante from './components/WhatsAppFlutuante';
import TransicaoPagina from './components/TransicaoPagina';
import { ProvedorCarrinho } from './store/carrinho';
import Inicio from './pages/Inicio';

/*
 * Só a home vem no primeiro carregamento. As outras páginas chegam quando o
 * visitante entra nelas — o site abre bem mais rápido assim.
 */
const Catalogo = lazy(() => import('./pages/Catalogo'));
const Produto = lazy(() => import('./pages/Produto'));
const Sobre = lazy(() => import('./pages/Sobre'));
const Contato = lazy(() => import('./pages/Contato'));
const Carrinho = lazy(() => import('./pages/Carrinho'));
const NaoEncontrada = lazy(() => import('./pages/NaoEncontrada'));

const rotas = [
  { caminho: '/', elemento: <Inicio /> },
  { caminho: '/bonecas', elemento: <Catalogo /> },
  { caminho: '/categoria/:slug', elemento: <Catalogo /> },
  { caminho: '/boneca/:slug', elemento: <Produto /> },
  { caminho: '/sobre', elemento: <Sobre /> },
  { caminho: '/contato', elemento: <Contato /> },
  { caminho: '/carrinho', elemento: <Carrinho /> },
  { caminho: '*', elemento: <NaoEncontrada /> },
];

/** Enquanto a página chega, um coraçãozinho batendo no lugar do vazio. */
function Carregando() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="animate-coracao text-4xl text-rosa-500" aria-label="Carregando">
        ♥
      </span>
    </div>
  );
}

function RotasAnimadas() {
  const local = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={local} key={local.pathname}>
        {rotas.map((r) => (
          <Route
            key={r.caminho}
            path={r.caminho}
            element={
              <TransicaoPagina>
                <Suspense fallback={<Carregando />}>{r.elemento}</Suspense>
              </TransicaoPagina>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
}

/**
 * Em produção o site usa endereços normais (/bonecas).
 * Para o preview em arquivo único (VITE_ROUTER=hash) usamos endereços com #,
 * que funcionam abrindo o HTML direto, sem servidor.
 */
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <Router>
      <ProvedorCarrinho>
        <Cabecalho />
        <RotasAnimadas />
        <Rodape />
        <GavetaCarrinho />
        <WhatsAppFlutuante />
      </ProvedorCarrinho>
    </Router>
  );
}
