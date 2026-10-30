// O aplicativo Express (rotas da API). Usado tanto pelo servidor normal
// (server/index.js — EasyPanel/VPS) quanto pela Vercel (api/index.js).
import './env.js';
import express from 'express';
import { AiError, aiReady, editImage, modelName } from './ai.js';
import { clearSession, currentSession, newDemoId, setSession } from './auth.js';
import { DbError, dbReady, ipHash, rpc, supabaseUrl, verifySupabaseToken } from './db.js';
import { buildPrompt, colorPrompts, cutPrompts } from './prompts.js';
import adminRoutes from './admin.js';

// Na Vercel são dois sites separados com o mesmo código:
// APP_ROLE=app (aplicativo dos salões) e APP_ROLE=panel (painel empresarial).
const role = process.env.APP_ROLE || 'both';
const panelOnly = role === 'panel';
const appOnly = role === 'app';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // atrás do proxy do EasyPanel / Vercel (HTTPS)

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  next();
});

// Pedidos que mudam algo só valem vindos do próprio app (proteção contra outros sites)
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try {
      host = new URL(origin).host;
    } catch {
      host = '';
    }
    if (host !== req.headers.host) {
      res.status(403).json({ error: 'Origem não permitida.' });
      return;
    }
  }
  if (!req.is('application/json')) {
    res.status(415).json({ error: 'Formato inválido.' });
    return;
  }
  next();
});

app.use('/api', express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: aiReady(), db: dbReady(), model: modelName(), cuts: cutPrompts.size, colors: colorPrompts.size });
});

app.get('/api/config', (_req, res) => {
  res.json({
    supabaseUrl: supabaseUrl(),
    googleLogin: dbReady(),
    demo: !panelOnly,
    aiReady: aiReady(),
  });
});

// ---------- Contas ----------

const MESSAGES = {
  not_allowed: (email) =>
    `A conta ${email} não está liberada no Beauty and self. Fale com a nossa equipe para liberar o seu acesso.`,
  blocked: 'O acesso deste salão está bloqueado. Fale com a nossa equipe.',
  overdue: 'O acesso deste salão está suspenso por pagamento pendente. Fale com a nossa equipe.',
};

// Demonstração sem banco (ex.: rodando no computador sem Supabase): conta na memória
const demoMemory = new Map();
const DEMO_LIMIT_FALLBACK = 2;

async function demoStatus(req, demoId) {
  if (!dbReady()) return { limit: DEMO_LIMIT_FALLBACK, used: Math.min(demoMemory.get(demoId) || 0, DEMO_LIMIT_FALLBACK) };
  return rpc('bs_demo_status', { p_demo_id: demoId, p_ip_hash: ipHash(req) });
}

/** Quem está usando o app agora e o que pode fazer. */
async function accountOf(req, session) {
  if (session.kind === 'demo') {
    const s = await demoStatus(req, session.demoId);
    return { user: { name: 'Demonstração', email: '' }, account: { kind: 'demo', limit: s.limit, used: s.used } };
  }
  const who = await rpc('bs_whoami', { p_email: session.email });
  const user = { email: session.email, name: session.name, picture: session.picture };
  if (who.tenant) {
    return {
      user,
      account: {
        kind: 'salon',
        salon: who.tenant.name,
        status: who.tenant.status,
        limit: who.tenant.monthly_limit,
        used: who.tenant.used_month,
        isAdmin: who.is_admin,
      },
    };
  }
  if (who.is_admin) return { user, account: { kind: 'admin', isAdmin: true } };
  return null;
}

app.get('/api/auth/me', async (req, res) => {
  const session = currentSession(req);
  if (!session) {
    res.json({ user: null });
    return;
  }
  try {
    const me = await accountOf(req, session);
    if (!me) {
      clearSession(req, res);
      res.json({ user: null, notice: MESSAGES.not_allowed(session.email) });
      return;
    }
    res.json(me);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Erro ao carregar sua conta.' });
  }
});

// Login com Google (feito pelo Supabase no navegador): o servidor confere o
// token direto com o Supabase e só libera e-mails cadastrados no painel.
const loginAttempts = new Map();
app.post('/api/auth/google', async (req, res) => {
  const ip = ipHash(req);
  const now = Date.now();
  const recent = (loginAttempts.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 20) {
    res.status(429).json({ error: 'Muitas tentativas de login. Espere alguns minutos.' });
    return;
  }
  loginAttempts.set(ip, [...recent, now]);
  try {
    const google = await verifySupabaseToken(req.body?.accessToken);
    const who = await rpc('bs_whoami', { p_email: google.email, p_login: true, p_ip_hash: ip });
    if (panelOnly && !who.is_admin) {
      res.status(403).json({ error: `A conta ${google.email} não é administradora do painel.` });
      return;
    }
    if (!who.tenant && !who.is_admin) {
      res.status(403).json({ error: MESSAGES.not_allowed(google.email) });
      return;
    }
    if (who.tenant && !who.is_admin && who.tenant.status !== 'active') {
      res.status(403).json({ error: MESSAGES[who.tenant.status] || MESSAGES.blocked });
      return;
    }
    setSession(req, res, { kind: 'google', ...google });
    console.log(`[auth] login ${google.email}${who.is_admin ? ' (admin)' : ''}`);
    res.json(await accountOf(req, { kind: 'google', ...google }));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Falha no login.' });
  }
});

// O painel não gera imagens nem tem demonstração
if (panelOnly) {
  app.use(['/api/auth/demo', '/api/generate'], (_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
}

// "Veja a demonstração": entra sem conta e pode gerar poucas imagens
app.post('/api/auth/demo', async (req, res) => {
  const current = currentSession(req);
  const session = current?.kind === 'demo' ? current : { kind: 'demo', demoId: newDemoId() };
  setSession(req, res, session);
  try {
    res.json(await accountOf(req, session));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Erro ao abrir a demonstração.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(req, res);
  res.json({ ok: true });
});

// ---------- Geração de imagem ----------

const IMAGE_PREFIX = /^data:image\/(jpeg|png|webp);base64,/;

/** Reserva uma imagem no plano (ou na demonstração). Devolve { id } ou { error, status }. */
async function reserve(req, session, mode, cutId, colorId) {
  if (session.kind === 'demo') {
    if (!dbReady()) {
      const used = demoMemory.get(session.demoId) || 0;
      if (used >= DEMO_LIMIT_FALLBACK) return { status: 402, error: demoUsedMessage(DEMO_LIMIT_FALLBACK), code: 'demo_used' };
      demoMemory.set(session.demoId, used + 1);
      return { id: null };
    }
    const r = await rpc('bs_demo_begin', {
      p_demo_id: session.demoId,
      p_ip_hash: ipHash(req),
      p_mode: mode,
      p_cut: cutId || '',
      p_color: colorId || '',
    });
    if (r.ok) return { id: r.id };
    if (RATE_MESSAGES[r.code]) return { status: 429, code: r.code, error: RATE_MESSAGES[r.code](r.limit) };
    return { status: 402, error: demoUsedMessage(r.limit), code: r.code };
  }
  const r = await rpc('bs_gen_begin', { p_email: session.email, p_mode: mode, p_cut: cutId || '', p_color: colorId || '' });
  if (r.ok) return { id: r.id };
  if (RATE_MESSAGES[r.code]) return { status: 429, code: r.code, error: RATE_MESSAGES[r.code](r.limit) };
  if (r.code === 'quota') {
    return {
      status: 402,
      code: 'quota',
      error: `Não foi possível gerar: o limite do plano (${r.limit} imagens por mês) foi atingido. Fale com a nossa equipe para ampliar o plano.`,
    };
  }
  if (r.code === 'not_allowed') return { status: 403, code: r.code, error: MESSAGES.not_allowed(session.email) };
  return { status: 403, code: r.code, error: MESSAGES[r.code] || MESSAGES.blocked };
}

// Limites contra abuso: conferidos no banco junto com a reserva, então valem
// para todas as cópias do servidor ao mesmo tempo (na Vercel podem ser várias).
const RATE_MESSAGES = {
  busy: () => 'Aguarde a imagem anterior terminar.',
  rate_hour: (n) => `Limite de ${n} imagens por hora atingido. Tente de novo mais tarde.`,
  rate_day: (n) => `Limite de ${n} imagens por dia atingido. Tente de novo amanhã.`,
  demo_ip: () => 'Muitas demonstrações feitas nesta internet hoje. Tente de novo amanhã ou fale com a nossa equipe.',
  demo_busy: () => 'A demonstração está com muita procura hoje. Tente de novo amanhã ou fale com a nossa equipe.',
};

const demoUsedMessage = (limit) =>
  `Você já usou as ${limit} imagens da demonstração. Para continuar, fale com a nossa equipe e tenha o Beauty and self no seu salão.`;

async function finish(id, status, error, ms) {
  if (!id || !dbReady()) return;
  try {
    await rpc('bs_gen_finish', { p_id: id, p_status: status, p_error: error || null, p_duration_ms: ms });
  } catch (err) {
    console.error('[generate] não consegui registrar o resultado', id, err.message);
  }
}

app.post('/api/generate', async (req, res) => {
  const session = currentSession(req);
  if (!session) {
    res.status(401).json({ error: 'Sua sessão expirou. Entre de novo.' });
    return;
  }
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
  const cut = typeof cutId === 'string' && cutId ? cutId : undefined;
  const color = typeof colorId === 'string' && colorId ? colorId : undefined;
  const prompt = buildPrompt({ cutId: cut, colorId: color });
  if (!prompt) {
    res.status(400).json({ error: 'Escolha um corte e/ou uma cor do catálogo.' });
    return;
  }
  const mode = cut && color ? 'both' : cut ? 'cut' : 'color';

  let reservation;
  try {
    reservation = await reserve(req, session, mode, cut, color);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Erro ao conferir o seu plano.' });
    return;
  }
  if (reservation.error) {
    res.status(reservation.status).json({ error: reservation.error, code: reservation.code });
    return;
  }

  // Se a pessoa cancelar / fechar a tela, paramos de esperar a IA.
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) abort.abort();
  });

  const started = Date.now();
  let ok = false;
  let failure = null;
  try {
    const result = await editImage({ prompt, image, aspectRatio, signal: abort.signal });
    ok = true;
    res.json({ image: result });
  } catch (err) {
    failure = err instanceof AiError ? err.message : `Erro interno: ${err?.message || err}`;
    if (abort.signal.aborted) return;
    const status = err instanceof AiError ? err.status : 500;
    if (!(err instanceof AiError)) console.error('[generate] erro inesperado', err);
    res.status(status).json({ error: err instanceof AiError ? err.message : 'Erro interno ao gerar a imagem.' });
  } finally {
    const ms = Date.now() - started;
    // Cancelado no meio também conta: o pedido já chegou à IA e pode ser cobrado.
    const status = ok ? 'ok' : abort.signal.aborted ? 'canceled' : 'error';
    await finish(reservation.id, status, ok ? null : failure, ms);
    console.log(JSON.stringify({ evt: 'generate', who: session.kind, cutId: cut || null, colorId: color || null, status, ms }));
  }
});

// ---------- Painel empresarial (não existe no site do app) ----------
if (!appOnly) app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Erros inesperados nunca mostram detalhes técnicos
app.use((err, _req, res, _next) => {
  if (err instanceof DbError || (err?.status >= 400 && err.status < 500 && err.message)) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'A foto é grande demais. Tente outra.' });
    return;
  }
  console.error('[api] erro', err);
  res.status(500).json({ error: 'Erro interno.' });
});

export default app;
