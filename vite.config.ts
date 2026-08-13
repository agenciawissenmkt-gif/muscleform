import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
  build: {
    // no preview em arquivo único tudo precisa caber num JS só;
    // no site de verdade, as páginas viajam em pedaços separados
    rollupOptions:
      mode === 'preview' ? { output: { inlineDynamicImports: true } } : undefined,
  },
}))
