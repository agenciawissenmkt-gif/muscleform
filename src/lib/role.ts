// Este build é o app dos salões, o painel empresarial, ou os dois (no computador).
// Na Vercel são dois sites separados: VITE_APP_ROLE=app e VITE_APP_ROLE=panel.
const role = (import.meta.env.VITE_APP_ROLE as string | undefined) || 'both';

export const isPanelBuild = role === 'panel';
export const isAppBuild = role === 'app';

/** Endereço do painel (site separado, ou /painel quando é tudo junto). */
export const PANEL_URL = isPanelBuild ? '/' : isAppBuild ? (import.meta.env.VITE_PANEL_URL as string) || '' : '/painel';

/** Caminho do painel dentro do próprio site (para voltar do login do Google). */
export const PANEL_PATH = isPanelBuild ? '/' : '/painel';

/** Endereço do app dos salões (para o botão "Abrir app" do painel). */
export const APP_URL = isPanelBuild ? (import.meta.env.VITE_APP_URL as string) || '' : '/';
