// Banco de dados (Supabase). O servidor só fala com o banco por funções que
// exigem a senha interna BS_SECRET — o navegador nunca acessa o banco direto.
import { createHash } from 'node:crypto';

const url = () => (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = () => process.env.SUPABASE_ANON_KEY || '';

export const dbReady = () => Boolean(url() && key() && process.env.BS_SECRET);
export const supabaseUrl = () => url() || null;

export class DbError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

/** Chama uma função do banco (sempre com a senha interna). */
export async function rpc(fn, args = {}) {
  if (!dbReady()) throw new DbError('Banco de dados não configurado no servidor.', 503);
  let res;
  try {
    res = await fetch(`${url()}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: key(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: process.env.BS_SECRET, ...args }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new DbError('Não consegui falar com o banco de dados. Tente de novo.', 503);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    if (data?.code === '42501') throw new DbError('Acesso negado.', 403);
    // Mensagens das validações do painel (ex.: "Informe o nome do salão.")
    if (data?.code === 'P0001' && data.message) throw new DbError(data.message, 400);
    console.error(`[db] ${fn} falhou`, res.status, data?.code, data?.message);
    throw new DbError('Erro no banco de dados. Tente de novo.', 500);
  }
  return data;
}

/** Confere o login do Google feito pelo Supabase e devolve a conta. */
export async function verifySupabaseToken(accessToken) {
  if (!dbReady()) throw new DbError('Login com Google ainda não configurado no servidor.', 503);
  if (typeof accessToken !== 'string' || accessToken.length < 20 || accessToken.length > 8192) {
    throw new DbError('Login inválido.', 400);
  }
  let res;
  try {
    res = await fetch(`${url()}/auth/v1/user`, {
      headers: { apikey: key(), Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new DbError('Não consegui confirmar o login. Tente de novo.', 502);
  }
  const user = await res.json().catch(() => null);
  const email = typeof user?.email === 'string' ? user.email.toLowerCase() : '';
  if (!res.ok || !email || !user.email_confirmed_at) {
    throw new DbError('Não foi possível confirmar sua conta Google. Entre de novo.', 401);
  }
  const meta = user.user_metadata || {};
  return {
    email,
    name: meta.full_name || meta.name || email.split('@')[0],
    picture: typeof meta.avatar_url === 'string' && meta.avatar_url.startsWith('https://') ? meta.avatar_url : undefined,
  };
}

/** Identifica a internet (IP) sem guardar o IP em si. */
export function ipHash(req) {
  const ip = req.ip || req.socket?.remoteAddress || '';
  return createHash('sha256')
    .update(`${process.env.BS_SECRET || ''}|${ip}`)
    .digest('hex')
    .slice(0, 32);
}
