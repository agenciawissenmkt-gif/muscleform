import { useCallback, useEffect, useRef, useState } from 'react';
import { Flower } from './components/Flowers';
import { HairArtDefs } from './components/HairArt';
import Header from './components/Header';
import { Button } from './components/ui';
import { api, ApiError, type AppConfig, type User } from './lib/api';
import type { Photo } from './lib/image';
import Camera from './screens/Camera';
import Choose, { type Selection } from './screens/Choose';
import Generating from './screens/Generating';
import Login from './screens/Login';
import Result from './screens/Result';
import Start from './screens/Start';

type Screen = 'start' | 'camera' | 'choose' | 'generating' | 'result';

/** Resultado guardado junto com a escolha usada para gerá-lo. */
interface Generated {
  image: string;
  selection: Selection;
}

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('start');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [selection, setSelection] = useState<Selection>({ mode: 'cut', cut: null, color: null });
  const [result, setResult] = useState<Generated | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const photoRef = useRef<Photo | null>(null);
  photoRef.current = photo;
  const resultRef = useRef<Generated | null>(null);
  resultRef.current = result;

  const boot = useCallback(async () => {
    setBootError(null);
    try {
      const [cfg, me] = await Promise.all([api.config(), api.me().catch(() => null)]);
      setConfig(cfg);
      setUser(me?.user ?? null);
    } catch (err) {
      setBootError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  // Navegação com o botão "voltar" do celular / navegador.
  const go = useCallback((next: Screen, opts: { replace?: boolean } = {}) => {
    if (opts.replace) window.history.replaceState({ screen: next }, '');
    else window.history.pushState({ screen: next }, '');
    setScreen(next);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.history.replaceState({ screen: 'start' }, '');
    const onPop = (e: PopStateEvent) => {
      let next: Screen = (e.state?.screen as Screen) ?? 'start';
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (next === 'generating') next = 'choose';
      if (next === 'result' && !resultRef.current) next = 'choose';
      if ((next === 'choose' || next === 'result') && !photoRef.current) next = 'start';
      setScreen(next);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function acceptPhoto(p: Photo, fromCamera: boolean) {
    setPhoto(p);
    setResult(null);
    setError(null);
    go('choose', { replace: fromCamera });
  }

  async function generate() {
    if (!photo) return;
    const used = selection;
    const { mode, cut, color } = used;
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    go('generating');
    try {
      const { image } = await api.generate(
        {
          image: photo.dataUrl,
          aspectRatio: photo.aspectRatio,
          cutId: mode !== 'color' ? cut?.id : undefined,
          colorId: mode !== 'cut' ? color?.id : undefined,
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      abortRef.current = null;
      setResult({ image, selection: used });
      go('result', { replace: true });
    } catch (err) {
      if (controller.signal.aborted || (err as DOMException)?.name === 'AbortError') return;
      abortRef.current = null;
      if (err instanceof ApiError && err.status === 401) {
        // Sessão expirou: volta para a escolha (sem ficar presa no carregamento)
        // e pede para entrar de novo.
        window.history.replaceState({ screen: 'choose' }, '');
        setScreen('choose');
        setError('Sua sessão expirou. Entre de novo e toque em "Ver meu novo visual".');
        setUser(null);
        return;
      }
      setError((err as Error).message);
      window.history.back();
    }
  }

  function cancelGenerate() {
    abortRef.current?.abort();
    abortRef.current = null;
    window.history.back();
  }

  async function logout() {
    await api.logout().catch(() => undefined);
    window.google?.accounts.id.disableAutoSelect();
    setUser(null);
    setPhoto(null);
    setResult(null);
    go('start', { replace: true });
  }

  if (!config || (!user && bootError)) {
    return (
      <div className="app-bg flex min-h-[100dvh] flex-col items-center justify-center gap-5 px-6 text-center">
        <Flower size={64} className="spin-slow" />
        {bootError ? (
          <>
            <p className="max-w-sm font-bold text-plum-900">{bootError}</p>
            <Button icon="refresh" onClick={boot}>
              Tentar de novo
            </Button>
          </>
        ) : (
          <p className="font-bold text-plum-700">Carregando…</p>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        config={config}
        onLogin={(u) => {
          setUser(u);
          window.scrollTo(0, 0);
        }}
        notice={photo ? error : null}
      />
    );
  }

  const showHeader = screen === 'start' || screen === 'choose' || screen === 'result';

  return (
    <div className="app-bg flex min-h-[100dvh] flex-col">
      <HairArtDefs />
      {showHeader && (
        <Header
          user={user}
          onLogout={logout}
          onBack={screen === 'start' ? undefined : () => window.history.back()}
          backLabel={screen === 'result' ? 'Voltar para a escolha' : 'Voltar'}
        />
      )}

      {screen === 'start' && (
        <Start
          user={user}
          aiReady={config.aiReady}
          onCamera={() => go('camera')}
          onPhoto={(p) => acceptPhoto(p, false)}
        />
      )}
      {screen === 'camera' && <Camera onClose={() => window.history.back()} onPhoto={(p) => acceptPhoto(p, true)} />}
      {screen === 'choose' && photo && (
        <Choose
          photo={photo}
          selection={selection}
          onChange={(s) => {
            setSelection(s);
            setError(null);
          }}
          onChangePhoto={() => go('start')}
          onGenerate={generate}
          error={error}
          aiReady={config.aiReady}
        />
      )}
      {screen === 'generating' && photo && (
        <Generating photo={photo.dataUrl} mode={selection.mode} onCancel={cancelGenerate} />
      )}
      {screen === 'result' && photo && result && (
        <Result
          photo={photo}
          image={result.image}
          selection={result.selection}
          onTryAnother={() => window.history.back()}
          onNewPhoto={() => go('start')}
        />
      )}
    </div>
  );
}
