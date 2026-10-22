import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// Navegadores atendidos, inclusive antigos (iPhone/iPad com iOS 11.3+, Android
// com Chrome 64+, Samsung Internet 9+…). Um só pacote de código, já convertido
// para eles, com "polyfills" (peças que faltam nos antigos) só onde precisa.
const BROWSERS = [
  'chrome >= 64',
  'safari >= 11.1',
  'ios >= 11.3',
  'firefox >= 67',
  'edge >= 79',
  'samsung >= 9',
  'opera >= 51',
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      renderLegacyChunks: false,
      modernTargets: BROWSERS,
      // Só o que falta de verdade nesses navegadores (o resto o código já trata)
      modernPolyfills: [
        'es.array.flat-map',
        'es.array.unscopables.flat-map',
        'es.symbol.description',
        'web.queue-microtask',
      ],
    }),
  ],
  build: {
    // O CSS também sai pronto para os mesmos navegadores
    cssTarget: ['chrome64', 'safari11.1', 'ios11.3', 'firefox67', 'edge79', 'opera51'],
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
