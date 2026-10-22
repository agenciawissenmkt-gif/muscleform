// Navegador interno de aplicativos (Instagram, Facebook, TikTok, WhatsApp…).
// Lá dentro o Google bloqueia o login, a câmera ao vivo costuma não abrir e o
// download não funciona — então o app orienta a abrir no navegador.

export interface InApp {
  /** nome do app (null quando não dá para saber qual é) */
  app: string | null;
  os: 'ios' | 'android' | 'other';
}

const APPS: [RegExp, string][] = [
  [/\bInstagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i, 'Facebook'],
  [/musical_ly|Bytedance|TikTok/i, 'TikTok'],
  [/\b(WAiOS|WA4A)\//i, 'WhatsApp'],
  [/LinkedInApp/i, 'LinkedIn'],
  [/Snapchat/i, 'Snapchat'],
  [/\bLine\//i, 'LINE'],
  [/MicroMessenger/i, 'WeChat'],
];

export function detectInApp(): InApp | null {
  const ua = navigator.userAgent || '';
  // App instalado na tela inicial (PWA) também não tem "Safari/" no nome: não é app de terceiros
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches);
  if (standalone) return null;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const hit = APPS.find(([re]) => re.test(ua));
  const webview = (android && /; wv\)/.test(ua)) || (ios && !/Safari\//.test(ua));
  if (!hit && !webview) return null;
  return { app: hit ? hit[1] : null, os: ios ? 'ios' : android ? 'android' : 'other' };
}

/** Android: tenta abrir o site no navegador do aparelho (alguns apps ignoram). */
export function openInBrowser() {
  const { host, pathname, href } = window.location;
  window.location.href = `intent://${host}${pathname}#Intent;scheme=https;S.browser_fallback_url=${encodeURIComponent(href)};end`;
}

/** Copia o endereço do app (para colar no navegador). */
export async function copyLink(): Promise<boolean> {
  const url = window.location.origin;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Navegadores antigos / apps que bloqueiam a área de transferência
    const t = document.createElement('textarea');
    t.value = url;
    t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(t);
    t.select();
    t.setSelectionRange(0, url.length);
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(t);
    return ok;
  }
}
