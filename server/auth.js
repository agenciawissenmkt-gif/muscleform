// Login com Google: só identifica a pessoa (nome, e-mail, foto). Não usa
// nenhuma API paga do Google Cloud — apenas confere o token do botão
// "Entrar com Google" e cria uma sessão própria do app (cookie seguro).
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE = 'bs_session';
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 dias

let secret = process.env.SESSION_SECRET;
if (!secret) {
  secret = randomBytes(32).toString('hex');
  console.warn(
    '[auth] SESSION_SECRET não definido: usando um temporário (todos saem do login quando o servidor reinicia).',
  );
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => createHmac('sha256', secret).update(data).digest('base64url');

function encodeSession(user) {
  const payload = b64(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + MAX_AGE_S }));
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, mac] = token.split('.');
  const expected = sign(payload);
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now() / 1000) return null;
    return { email: data.email, name: data.name, picture: data.picture };
  } catch {
    return null;
  }
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function setSession(req, res, user) {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(encodeSession(user))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S}${secure}`,
  );
}

export function clearSession(req, res) {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export function currentUser(req) {
  return decodeSession(readCookie(req, COOKIE));
}

export function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Sua sessão expirou. Entre de novo.' });
    return;
  }
  if (!isAllowed(user.email)) {
    clearSession(req, res);
    res.status(403).json({ error: 'Esta conta não tem acesso ao aplicativo.' });
    return;
  }
  req.user = user;
  next();
}

/** ALLOWED_EMAILS="ana@gmail.com,@meusalao.com.br" — vazio = qualquer conta Google. */
export function isAllowed(email) {
  const list = (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) return true;
  const e = String(email || '').toLowerCase();
  return list.some((rule) => (rule.startsWith('@') ? e.endsWith(rule) : e === rule));
}

/** Confere o token do botão do Google direto com o Google. */
export async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw Object.assign(new Error('Login com Google não configurado no servidor.'), { status: 503 });
  if (typeof credential !== 'string' || credential.length > 4096) {
    throw Object.assign(new Error('Login inválido.'), { status: 400 });
  }
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!res) throw Object.assign(new Error('Não consegui falar com o Google. Tente de novo.'), { status: 502 });
  const info = await res.json().catch(() => null);
  const validIssuer = info?.iss === 'accounts.google.com' || info?.iss === 'https://accounts.google.com';
  const verified = info?.email_verified === true || info?.email_verified === 'true';
  if (!res.ok || !info || info.aud !== clientId || !validIssuer || !verified || Number(info.exp) < Date.now() / 1000) {
    throw Object.assign(new Error('Não foi possível confirmar sua conta Google. Tente de novo.'), { status: 401 });
  }
  return {
    email: String(info.email).toLowerCase(),
    name: info.name || info.given_name || String(info.email).split('@')[0],
    picture: typeof info.picture === 'string' && info.picture.startsWith('https://') ? info.picture : undefined,
  };
}
