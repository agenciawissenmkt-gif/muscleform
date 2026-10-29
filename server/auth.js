// Sessão do app: depois do login (Google pelo Supabase, ou a demonstração), o
// servidor guarda quem é a pessoa num cookie assinado (não dá para falsificar).
// O que ela pode fazer é conferido no banco a cada pedido (bloqueio vale na hora).
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

/**
 * kind "google": conta Google confirmada (salão e/ou administrador)
 * kind "demo": demonstração (demoId identifica o aparelho)
 */
function encodeSession(session) {
  const payload = b64(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + MAX_AGE_S }));
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
    if (data.kind === 'demo' && typeof data.demoId === 'string') return { kind: 'demo', demoId: data.demoId };
    if (data.kind === 'google' && typeof data.email === 'string') {
      return { kind: 'google', email: data.email, name: data.name, picture: data.picture };
    }
    return null;
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

export function setSession(req, res, session) {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(encodeSession(session))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S}${secure}`,
  );
}

export function clearSession(req, res) {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export function currentSession(req) {
  return decodeSession(readCookie(req, COOKIE));
}

export const newDemoId = () => randomBytes(24).toString('base64url');
