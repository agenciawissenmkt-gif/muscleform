import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AiError, aiReady, editImage, modelName } from './ai.js';
import { clearSession, currentUser, isAllowed, requireAuth, setSession, verifyGoogleCredential } from './auth.js';
import { checkLimit, finishJob, startJob } from './limits.js';
import { buildPrompt, colorPrompts, cutPrompts } from './prompts.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });

const PORT = Number(process.env.PORT) || 8787;
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const demoLogin = () => process.env.DEMO_LOGIN === 'true';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // atrás do proxy do EasyPanel (HTTPS)

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  next();
});

app.use('/api', express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: aiReady(), model: modelName(), cuts: cutPrompts.size, colors: colorPrompts.size });
});

app.get('/api/config', (_req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    demoLogin: demoLogin(),
    aiReady: aiReady(),
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: user && isAllowed(user.email) ? user : null });
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const user = await verifyGoogleCredential(req.body?.credential);
    if (!isAllowed(user.email)) {
      res.status(403).json({ error: `A conta ${user.email} não tem acesso a este aplicativo.` });
      return;
    }
    setSession(req, res, user);
    console.log(`[auth] login ${user.email}`);
    res.json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Falha no login.' });
  }
});

// Login por redirecionamento (usado quando o app está instalado na tela
// inicial do celular, onde a janelinha/pop-up do Google não funciona bem).
app.post('/api/auth/google/redirect', express.urlencoded({ extended: false, limit: '16kb' }), async (req, res) => {
  const fail = (msg) => res.redirect(303, `/?login_error=${encodeURIComponent(msg)}`);
  const cookieToken = /(?:^|;\s*)g_csrf_token=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  if (!cookieToken || cookieToken !== req.body?.g_csrf_token) {
    fail('Não foi possível confirmar o login. Tente de novo.');
    return;
  }
  try {
    const user = await verifyGoogleCredential(req.body?.credential);
    if (!isAllowed(user.email)) {
      fail(`A conta ${user.email} não tem acesso a este aplicativo.`);
      return;
    }
    setSession(req, res, user);
    console.log(`[auth] login ${user.email} (redirect)`);
    res.redirect(303, '/');
  } catch (err) {
    fail(err.message || 'Falha no login.');
  }
});

app.post('/api/auth/demo', (req, res) => {
  if (!demoLogin()) {
    res.status(404).json({ error: 'Modo de teste desativado.' });
    return;
  }
  const user = { email: 'teste@beautyandself.app', name: 'Modo teste' };
  setSession(req, res, user);
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(req, res);
  res.json({ ok: true });
});

const IMAGE_PREFIX = /^data:image\/(jpeg|png|webp);base64,/;

app.post('/api/generate', requireAuth, async (req, res) => {
  const { image, aspectRatio, cutId, colorId } = req.body ?? {};

  if (typeof image !== 'string' || !IMAGE_PREFIX.test(image)) {
    res.status(400).json({ error: 'Foto inválida. Tire ou escolha a foto de novo.' });
    return;
  }
  const ratio = typeof aspectRatio === 'string' && /^(\d{1,2}):(\d{1,2})$/.exec(aspectRatio);
  if (!ratio || Number(ratio[1]) < 1 || Number(ratio[2]) < 1) {
    res.status(400).json({ error: 'Proporção da foto inválida.' });
    return;
  }
  const prompt = buildPrompt({
    cutId: typeof cutId === 'string' ? cutId : undefined,
    colorId: typeof colorId === 'string' ? colorId : undefined,
  });
  if (!prompt) {
    res.status(400).json({ error: 'Escolha um corte e/ou uma cor do catálogo.' });
    return;
  }

  const email = req.user.email;
  const limited = checkLimit(email);
  if (limited) {
    res.status(429).json({ error: limited });
    return;
  }

  // Se a pessoa cancelar / fechar a tela, paramos de esperar a IA.
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) abort.abort();
  });

  const started = Date.now();
  startJob(email);
  let ok = false;
  try {
    const result = await editImage({ prompt, image, aspectRatio, signal: abort.signal });
    ok = true;
    res.json({ image: result });
  } catch (err) {
    if (abort.signal.aborted) return;
    const status = err instanceof AiError ? err.status : 500;
    if (!(err instanceof AiError)) console.error('[generate] erro inesperado', err);
    res.status(status).json({ error: err instanceof AiError ? err.message : 'Erro interno ao gerar a imagem.' });
  } finally {
    finishJob(email, ok);
    console.log(
      JSON.stringify({
        evt: 'generate',
        user: email,
        cutId: cutId || null,
        colorId: colorId || null,
        ok,
        ms: Date.now() - started,
      }),
    );
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

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
      `login Google: ${process.env.GOOGLE_CLIENT_ID ? 'sim' : 'não'}${demoLogin() ? ' · modo de teste: LIGADO' : ''}`,
  );
});
