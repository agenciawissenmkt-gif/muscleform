import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Cabecalho from './components/Cabecalho';
import Rodape from './components/Rodape';
import GavetaCarrinho from './components/GavetaCarrinho';
import WhatsAppFlutuante from './components/WhatsAppFlutuante';
import TransicaoPagina from './components/TransicaoPagina';
import { ProvedorCarrinho } from './store/carrinho';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import Produto from './pages/Produto';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';
import Carrinho from './pages/Carrinho';
import NaoEncontrada from './pages/NaoEncontrada';

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

function RotasAnimadas() {
  const local = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={local} key={local.pathname}>
        {rotas.map((r) => (
          <Route key={r.caminho} path={r.caminho} element={<TransicaoPagina>{r.elemento}</TransicaoPagina>} />
        ))}
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProvedorCarrinho>
        <Cabecalho />
        <RotasAnimadas />
        <Rodape />
        <GavetaCarrinho />
        <WhatsAppFlutuante />
      </ProvedorCarrinho>
    </BrowserRouter>
  );
}
