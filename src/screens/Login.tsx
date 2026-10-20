import { useEffect, useRef, useState } from 'react';
import { FloralCorner, Flower } from '../components/Flowers';
import Logo from '../components/Logo';
import { Button, Icon, Spinner } from '../components/ui';
import { api, type AppConfig, type User } from '../lib/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

let gsiPromise: Promise<void> | null = null;

/** Carrega só o botão "Entrar com Google" (Google Identity Services). */
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  gsiPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gsiPromise = null;
      reject(new Error('Não consegui carregar o login do Google. Verifique a internet.'));
    };
    document.head.appendChild(s);
  });
  return gsiPromise;
}

export default function Login({
  config,
  onLogin,
  notice,
}: {
  config: AppConfig;
  onLogin: (u: User) => void;
  notice?: string | null;
}) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(() => {
    // Erro vindo do login por redirecionamento (?login_error=...)
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('login_error');
    if (msg) window.history.replaceState(window.history.state, '', window.location.pathname);
    return msg;
  });
  const [busy, setBusy] = useState(false);
  const onLoginRef = useRef(onLogin);
  onLoginRef.current = onLogin;

  useEffect(() => {
    if (!config.googleClientId) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !btnRef.current || !window.google) return;
        // App instalado na tela inicial: o pop-up do Google não funciona bem,
        // então usamos o login por redirecionamento.
        const standalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone === true;
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          ux_mode: standalone ? 'redirect' : 'popup',
          login_uri: `${window.location.origin}/api/auth/google/redirect`,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async (resp: { credential?: string }) => {
            if (!resp.credential) return;
            setBusy(true);
            setError(null);
            try {
              const { user } = await api.loginGoogle(resp.credential);
              onLoginRef.current(user);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          },
        });
        const width = Math.min(360, btnRef.current.clientWidth || 320);
        window.google.accounts.id.renderButton(btnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          locale: 'pt-BR',
          width,
        });
      })
      .catch((err: Error) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [config.googleClientId]);

  async function demo() {
    setBusy(true);
    setError(null);
    try {
      const { user } = await api.loginDemo();
      onLogin(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-bg relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-12">
      <FloralCorner className="pointer-events-none absolute -left-10 -top-8 w-52 opacity-90 sm:w-72" />
      <FloralCorner
        flip
        className="pointer-events-none absolute -bottom-10 -right-8 w-56 rotate-180 opacity-90 sm:w-80"
      />

      <div className="screen-in relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <Logo size="lg" />
        <p className="mt-5 text-xl font-bold text-plum-900">Seu novo visual, antes da tesoura.</p>
        <p className="mt-2 text-base text-ink-soft">
          Tire uma foto, escolha o corte ou a cor e veja o resultado na hora — com o seu rosto preservado.
        </p>

        <ul className="mt-8 grid w-full gap-3 text-left">
          {[
            { icon: 'camera' as const, text: 'Foto pela câmera ou da galeria' },
            { icon: 'scissors' as const, text: 'Centenas de cortes e cores' },
            { icon: 'download' as const, text: 'Salve e envie o resultado' },
          ].map((b) => (
            <li
              key={b.text}
              className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[var(--shadow-soft)] ring-1 ring-plum-100"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-plum-100 text-plum-700">
                <Icon name={b.icon} size={22} />
              </span>
              <span className="font-bold text-plum-900">{b.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex w-full flex-col items-center gap-3">
          {notice && (
            <p
              role="status"
              className="w-full max-w-[360px] rounded-2xl bg-plum-100 px-4 py-3 text-sm font-bold text-plum-900"
            >
              {notice}
            </p>
          )}
          {config.googleClientId ? (
            <>
              <p className="text-sm font-bold uppercase tracking-wider text-plum-700">Entre com sua conta Google</p>
              <div ref={btnRef} className="flex min-h-12 w-full max-w-[360px] justify-center" />
            </>
          ) : (
            !config.demoLogin && (
              <p className="rounded-2xl bg-white px-4 py-3 text-sm text-ink-soft ring-1 ring-plum-200">
                O login com Google ainda não foi configurado no servidor (falta <b>GOOGLE_CLIENT_ID</b>).
              </p>
            )
          )}
          {config.demoLogin && (
            <Button
              variant={config.googleClientId ? 'ghost' : 'primary'}
              icon="sparkles"
              onClick={demo}
              disabled={busy}
              className="w-full max-w-[360px]"
            >
              Entrar em modo de teste
            </Button>
          )}
          {busy && <Spinner className="mt-1" />}
          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
            >
              <Icon name="alert" size={18} /> {error}
            </p>
          )}
        </div>

        <p className="mt-10 flex items-center gap-2 text-xs text-ink-soft">
          <Flower size={16} /> Use fotos somente com autorização da cliente.
        </p>
      </div>
    </main>
  );
}
