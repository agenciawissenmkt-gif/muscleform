import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Icon, IconButton, Spinner } from '../components/ui';
import { drawToPhoto, photoFromFile, type Photo } from '../lib/image';
import { detectInApp } from '../lib/inapp';

type Facing = 'user' | 'environment';

export default function Camera({ onClose, onPhoto }: { onClose: () => void; onPhoto: (p: Photo) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const [facing, setFacing] = useState<Facing>('user');
  // paused: o navegador não deixou o vídeo começar sozinho (precisa de um toque)
  const [status, setStatus] = useState<'starting' | 'live' | 'paused' | 'error'>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  // A câmera está demorando (ex.: a pessoa não respondeu ao pedido de permissão)
  const [slow, setSlow] = useState(false);
  const [inApp] = useState(detectInApp);
  const [shot, setShot] = useState<Photo | null>(null);
  const [flash, setFlash] = useState(false);
  const [hasTwoCameras, setHasTwoCameras] = useState(true);
  const [retry, setRetry] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  // Hora da última foto: ignora toques duplos que cairiam nos botões seguintes.
  const shotAt = useRef(0);
  // Retoma o vídeo com um toque, quando o navegador não deixou começar sozinho
  const resumeRef = useRef<() => void>(() => undefined);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => !cancelled && setSlow(true), 7000);

    function fail(message: string) {
      if (cancelled) return;
      stop();
      setErrorMsg(message);
      setStatus('error');
    }

    async function open() {
      const constraints = {
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
      };
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Muitos Androids demoram a soltar a câmera anterior (ex.: ao virar): tenta mais uma vez
        const name = (err as DOMException)?.name;
        if (name !== 'NotReadableError' && name !== 'AbortError' && name !== 'TrackStartError') throw err;
        await new Promise((r) => setTimeout(r, 500));
        return navigator.mediaDevices.getUserMedia(constraints);
      }
    }

    async function start() {
      setStatus('starting');
      setSlow(false);
      stop();
      if (typeof navigator.mediaDevices?.getUserMedia !== 'function') {
        return fail(
          'Este navegador não deixa abrir a câmera aqui. Use o botão abaixo para tirar a foto pelo aparelho.',
        );
      }
      try {
        const stream = await open();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        // Câmera desligada pelo sistema (ex.: o app foi para segundo plano): reabre
        stream.getVideoTracks().forEach((t) => {
          t.onended = () => !cancelled && streamRef.current === stream && setRetry((n) => n + 1);
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        const playing = await video.play().then(
          () => true,
          () => false,
        );
        if (cancelled) return;
        if (!playing) {
          setStatus('paused');
          return;
        }
        await showWhenReady(video);
        navigator.mediaDevices
          .enumerateDevices()
          .then((d) => !cancelled && setHasTwoCameras(d.filter((x) => x.kind === 'videoinput').length > 1))
          .catch(() => undefined);
      } catch (err) {
        const name = (err as DOMException)?.name;
        if (name === 'NotAllowedError' && inApp) {
          return fail(
            `${inApp.app ? `O ${inApp.app}` : 'Este aplicativo'} não deixa abrir a câmera aqui. Toque em "Tirar foto pelo aparelho", escolha da galeria ou abra o link no navegador.`,
          );
        }
        fail(
          name === 'NotAllowedError'
            ? 'A câmera está bloqueada. Libere a câmera nos ajustes do navegador e toque em "Tentar de novo" — ou use os botões abaixo.'
            : 'Não consegui abrir a câmera. Toque em "Tentar de novo", tire a foto pelo aparelho ou escolha da galeria.',
        );
      }
    }

    /** Só mostra "ao vivo" quando a imagem chega de verdade (alguns aparelhos ficam pretos). */
    async function showWhenReady(video: HTMLVideoElement) {
      const ok =
        video.videoWidth > 0 ||
        (await new Promise<boolean>((resolve) => {
          const t = setTimeout(() => resolve(video.videoWidth > 0), 5000);
          video.addEventListener(
            'loadeddata',
            () => {
              clearTimeout(t);
              resolve(video.videoWidth > 0);
            },
            { once: true },
          );
        }));
      if (cancelled) return;
      if (ok) setStatus('live');
      else fail('A câmera não mostrou imagem neste aparelho. Use "Tirar foto pelo aparelho" ou a galeria.');
    }
    resumeRef.current = () => {
      const video = videoRef.current;
      if (!video) return;
      setStatus('starting');
      video.play().then(
        () => showWhenReady(video),
        () => fail('Não consegui mostrar a câmera. Toque em "Tirar foto pelo aparelho" ou escolha da galeria.'),
      );
    };

    if (!shot) start();
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [facing, shot, stop, retry, inApp]);

  useEffect(() => stop, [stop]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.videoWidth) {
      stop();
      setErrorMsg('A câmera parou de mostrar imagem. Toque em "Tentar de novo" ou use os botões abaixo.');
      setStatus('error');
      return;
    }
    const photo = drawToPhoto(video, video.videoWidth, video.videoHeight, { mirror: facing === 'user', ratio: [3, 4] });
    shotAt.current = Date.now();
    setFlash(true);
    setTimeout(() => setFlash(false), 280);
    stop();
    setShot(photo);
  }

  /** Evita que um toque duplo no botão da foto acione o botão de baixo. */
  const guarded = (fn: () => void) => () => {
    if (Date.now() - shotAt.current < 600) return;
    fn();
  };

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileError(null);
    try {
      // Só desliga a câmera depois que a foto da galeria abriu direitinho.
      const photo = await photoFromFile(file);
      stop();
      onPhoto(photo);
    } catch (err) {
      setFileError((err as Error).message);
    }
  }

  const frame =
    'ratio-box mx-auto w-full max-w-[min(100vw,calc((100dvh-220px)*0.75))] overflow-hidden bg-plum-950 sm:rounded-[28px]';

  return (
    <main className="fixed inset-0 z-40 flex flex-col bg-plum-950 text-white">
      <div className="safe-top flex items-center justify-between px-3 py-2">
        <IconButton
          icon="close"
          label="Fechar câmera"
          onClick={() => {
            stop();
            onClose();
          }}
          className="bg-white/10 hover:bg-white/20"
        />
        <p className="font-extrabold tracking-wide">{shot ? 'Ficou boa?' : 'Encaixe o rosto no contorno'}</p>
        <span className="size-12" />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className={frame}>
          {shot ? (
            <img src={shot.dataUrl} alt="Foto tirada" className="pop-in absolute inset-0 size-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="absolute inset-0 size-full object-cover"
                style={{ transform: facing === 'user' ? 'scaleX(-1)' : undefined }}
              />
              {status === 'live' && (
                <svg
                  viewBox="0 0 300 400"
                  className="pointer-events-none absolute inset-0 size-full"
                  aria-hidden="true"
                >
                  <defs>
                    <mask id="face-hole">
                      <rect width="300" height="400" fill="white" />
                      <ellipse cx="150" cy="185" rx="92" ry="122" fill="black" />
                    </mask>
                  </defs>
                  <rect width="300" height="400" fill="rgb(26 9 51 / 0.45)" mask="url(#face-hole)" />
                  <ellipse
                    cx="150"
                    cy="185"
                    rx="92"
                    ry="122"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeDasharray="7 7"
                    opacity="0.9"
                  />
                </svg>
              )}
              {status === 'starting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <Spinner className="border-white/30 border-t-white" />
                  <p className="font-semibold">Abrindo a câmera…</p>
                  {slow && (
                    <>
                      <p className="text-sm leading-relaxed text-plum-200">
                        Se apareceu um pedido para usar a câmera, toque em <b>Permitir</b>. Está demorando? Use:
                      </p>
                      <Button variant="light" icon="camera" onClick={() => nativeRef.current?.click()}>
                        Tirar foto pelo aparelho
                      </Button>
                    </>
                  )}
                </div>
              )}
              {status === 'paused' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <Button size="xl" icon="camera" onClick={() => resumeRef.current()}>
                    Toque para ver a câmera
                  </Button>
                </div>
              )}
              {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <Icon name="camera" size={44} className="text-plum-300" />
                  <p className="text-base font-semibold leading-relaxed">{errorMsg}</p>
                  {typeof navigator.mediaDevices?.getUserMedia === 'function' && !inApp && (
                    <Button icon="refresh" onClick={() => setRetry((n) => n + 1)}>
                      Tentar de novo
                    </Button>
                  )}
                  <Button variant="light" icon="camera" onClick={() => nativeRef.current?.click()}>
                    Tirar foto pelo aparelho
                  </Button>
                </div>
              )}
            </>
          )}
          {flash && <div className="absolute inset-0 bg-white" style={{ animation: 'screen-in .28s reverse both' }} />}
        </div>
      </div>

      <div className="safe-bottom px-5 pt-4">
        {fileError && (
          <p
            role="alert"
            className="mx-auto mb-3 max-w-md rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
          >
            {fileError}
          </p>
        )}
        {shot ? (
          <div className="mx-auto flex max-w-md flex-col gap-3">
            <Button size="xl" icon="check" onClick={guarded(() => onPhoto(shot))}>
              Usar esta foto
            </Button>
            <Button variant="light" icon="refresh" onClick={guarded(() => setShot(null))}>
              Tirar outra
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-20 flex-col items-center gap-1 text-sm font-bold"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/30">
                <Icon name="gallery" />
              </span>
              Galeria
            </button>
            <button
              type="button"
              onClick={capture}
              disabled={status !== 'live'}
              aria-label="Tirar foto"
              className="flex size-[84px] items-center justify-center rounded-full bg-white/20 ring-4 ring-white transition active:scale-90 disabled:opacity-40"
            >
              <span className="brand-gradient block size-[64px] rounded-full" />
            </button>
            <button
              type="button"
              onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
              disabled={!hasTwoCameras || status !== 'live'}
              className="flex w-20 flex-col items-center gap-1 text-sm font-bold disabled:opacity-40"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/30">
                <Icon name="switch" />
              </span>
              Virar
            </button>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <input ref={nativeRef} type="file" accept="image/*" capture={facing} className="hidden" onChange={onFile} />
    </main>
  );
}
