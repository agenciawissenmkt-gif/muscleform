import { useState } from 'react';
import { FloralCorner, Flower } from '../components/Flowers';
import InAppNotice from '../components/InAppNotice';
import Logo from '../components/Logo';
import { Button, Icon, Spinner } from '../components/ui';
import { api, type AppConfig, type Me } from '../lib/api';
import { startGoogleLogin } from '../lib/googleLogin';
import { detectInApp } from '../lib/inapp';

/** Botão "Entrar com Google" no padrão visual do Google. */
export function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-14 w-full max-w-[360px] items-center justify-center gap-3 rounded-2xl bg-white px-6 text-[1.05rem] font-extrabold text-[#1f1f1f] shadow-soft ring-1 ring-[#dadce0] transition hover:bg-[#f8f9fa] active:scale-[0.98] disabled:opacity-60"
    >
      <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      Entrar com Google
    </button>
  );
}

export default function Login({
  config,
  onLogin,
  notice,
}: {
  config: AppConfig;
  onLogin: (me: Me) => void;
  notice?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Dentro do Instagram, WhatsApp etc. o Google bloqueia o login
  const [inApp] = useState(detectInApp);
  const google = config.googleLogin && config.supabaseUrl;

  async function demo() {
    setBusy(true);
    setError(null);
    try {
      onLogin(await api.loginDemo());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function login() {
    if (!config.supabaseUrl) return;
    setBusy(true);
    startGoogleLogin(config.supabaseUrl, '/');
  }

  return (
    <main className="app-bg relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-12">
      <FloralCorner className="pointer-events-none absolute -left-10 -top-8 w-52 opacity-90 sm:w-72" />
      <FloralCorner className="pointer-events-none absolute -bottom-10 -right-8 w-56 -scale-y-100 opacity-90 sm:w-80" />

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
              className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-soft ring-1 ring-plum-100"
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
          {google && inApp ? (
            <InAppNotice inApp={inApp} reason="O login do Google não funciona" />
          ) : google ? (
            <>
              <p className="text-sm font-bold uppercase tracking-wider text-plum-700">Já é cliente? Entre aqui</p>
              <GoogleButton onClick={login} disabled={busy} />
            </>
          ) : null}
          {config.demo && (
            <>
              {google && (
                <p className="mt-3 text-sm font-bold uppercase tracking-wider text-plum-700">Ainda não é cliente?</p>
              )}
              <Button
                variant={google ? 'secondary' : 'primary'}
                icon="sparkles"
                onClick={demo}
                disabled={busy}
                className="w-full max-w-[360px]"
              >
                Veja a demonstração
              </Button>
            </>
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
