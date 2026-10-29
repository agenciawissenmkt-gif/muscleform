export interface User {
  email: string;
  name: string;
  picture?: string;
}

export interface AppConfig {
  /** endereço do Supabase (login com Google) — null quando não configurado */
  supabaseUrl: string | null;
  googleLogin: boolean;
  demo: boolean;
  aiReady: boolean;
}

/** O que a pessoa conectada pode usar */
export type Account =
  | { kind: 'salon'; salon: string; status: string; limit: number; used: number; isAdmin: boolean }
  | { kind: 'demo'; limit: number; used: number }
  | { kind: 'admin'; isAdmin: true };

export interface Me {
  user: User | null;
  account?: Account;
  /** aviso para mostrar na tela de entrada (ex.: conta não liberada) */
  notice?: string;
}

export type Mode = 'cut' | 'color' | 'both';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') throw err;
    throw new ApiError('Sem conexão com o servidor. Verifique a internet e tente de novo.', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      (data && typeof data.error === 'string' && data.error) || `O servidor respondeu com erro (${res.status}).`,
      res.status,
      data && typeof data.code === 'string' ? data.code : undefined,
    );
  }
  return data as T;
}

export const getJson = <T>(path: string) => request<T>(path);
export const postJson = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const api = {
  config: () => request<AppConfig>('/api/config'),
  me: () => request<Me>('/api/auth/me'),
  loginGoogle: (accessToken: string) =>
    request<Me>('/api/auth/google', { method: 'POST', body: JSON.stringify({ accessToken }) }),
  loginDemo: () => request<Me>('/api/auth/demo', { method: 'POST', body: '{}' }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST', body: '{}' }),
  generate: (body: { image: string; aspectRatio: string; cutId?: string; colorId?: string }, signal?: AbortSignal) =>
    request<{ image: string }>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(body),
      // Navegador antigo usa um "AbortController" simplificado (lib/compat.ts): não vai para o fetch
      signal: typeof AbortSignal !== 'undefined' && signal instanceof AbortSignal ? signal : undefined,
    }),
};
