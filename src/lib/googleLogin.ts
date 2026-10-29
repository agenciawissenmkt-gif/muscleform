// Login com Google pelo Supabase (o mesmo esquema do painel Wissen Cars): a
// pessoa vai para a tela do Google e volta para o app com um token, que o
// servidor confere. Só e-mails liberados no painel empresarial entram.

/** Vai para a tela do Google; depois volta para `path` (o app ou o painel). */
export function startGoogleLogin(supabaseUrl: string, path = '/') {
  const redirect = `${window.location.origin}${path}`;
  window.location.href =
    `${supabaseUrl}/auth/v1/authorize?provider=google` +
    `&redirect_to=${encodeURIComponent(redirect)}&prompt=select_account`;
}

/** Ao voltar do Google: pega o token (ou o erro) do endereço e limpa o endereço. */
export function takeGoogleResult(): { accessToken?: string; error?: string } | null {
  const hash = window.location.hash.replace(/^#/, '');
  const query = window.location.search.replace(/^\?/, '');
  const params = new URLSearchParams(hash.includes('access_token') || hash.includes('error') ? hash : query);
  const accessToken = params.get('access_token') || undefined;
  const error = params.get('error_description') || params.get('error') || undefined;
  if (!accessToken && !error) return null;
  window.history.replaceState(window.history.state, '', window.location.pathname);
  return accessToken
    ? { accessToken }
    : { error: error && /access_denied/i.test(error) ? 'Login cancelado.' : 'Não foi possível entrar com o Google.' };
}
