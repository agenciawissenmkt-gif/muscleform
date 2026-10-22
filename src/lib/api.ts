export interface User {
  email: string;
  name: string;
  picture?: string;
}

export interface AppConfig {
  googleClientId: string | null;
  demoLogin: boolean;
  aiReady: boolean;
}

export type Mode = 'cut' | 'color' | 'both';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
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
    );
  }
  return data as T;
}

export const api = {
  config: () => request<AppConfig>('/api/config'),
  me: () => request<{ user: User | null }>('/api/auth/me'),
  loginGoogle: (credential: string) =>
    request<{ user: User }>('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  loginDemo: () => request<{ user: User }>('/api/auth/demo', { method: 'POST', body: '{}' }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST', body: '{}' }),
  generate: (body: { image: string; aspectRatio: string; cutId?: string; colorId?: string }, signal?: AbortSignal) =>
    request<{ image: string }>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(body),
      // Navegador antigo usa um "AbortController" simplificado (lib/compat.ts): não vai para o fetch
      signal: typeof AbortSignal !== 'undefined' && signal instanceof AbortSignal ? signal : undefined,
    }),
};
