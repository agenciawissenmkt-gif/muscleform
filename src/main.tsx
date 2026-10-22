import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fontes dentro do próprio app (não dependem do Google): mesma letra em todo aparelho
import '@fontsource/nunito/latin-500.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/playfair-display/latin-600-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import './index.css';
import App from './App.tsx';
import { applyCompat } from './lib/compat';

applyCompat();
// Avisa o index.html que o app abriu (senão ele mostra uma mensagem de ajuda)
(window as { __bsStarted?: boolean }).__bsStarted = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
