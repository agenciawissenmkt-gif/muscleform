// Servidor completo (EasyPanel / VPS / local): API + aplicativo (dist/).
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { aiReady, modelName } from './ai.js';
import { dbReady } from './db.js';
import { colorPrompts, cutPrompts } from './prompts.js';

const PORT = Number(process.env.PORT) || 8787;
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

// Em produção, o mesmo servidor entrega o aplicativo (pasta dist/).
if (existsSync(DIST)) {
  app.use(
    express.static(DIST, {
      index: false,
      setHeaders(res, path) {
        if (path.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        else res.setHeader('Cache-Control', 'no-cache');
      },
    }),
  );
  app.get('/{*path}', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile('index.html', { root: DIST });
  });
}

app.listen(PORT, () => {
  console.log(`Beauty and self rodando em http://localhost:${PORT}`);
  console.log(
    `  IA: ${aiReady() ? `conectada (${modelName()})` : 'NÃO conectada (defina FAL_KEY)'} · ` +
      `catálogo: ${cutPrompts.size} cortes, ${colorPrompts.size} cores · ` +
      `banco/login Google: ${dbReady() ? 'sim' : 'NÃO (defina SUPABASE_URL, SUPABASE_ANON_KEY e BS_SECRET)'}`,
  );
});
