import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Icon, IconButton, Spinner } from '../components/ui';
import { drawToPhoto, photoFromFile, type Photo } from '../lib/image';

type Facing = 'user' | 'environment';

export default function Camera({ onClose, onPhoto }: { onClose: () => void; onPhoto: (p: Photo) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const [facing, setFacing] = useState<Facing>('user');
  const [status, setStatus] = useState<'starting' | 'live' | 'error'>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  const [shot, setShot] = useState<Photo | null>(null);
  const [flash, setFlash] = useState(false);
  const [hasTwoCameras, setHasTwoCameras] = useState(true);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setStatus('starting');
      stop();
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg(
          'Este navegador não deixa abrir a câmera aqui. Use o botão abaixo para tirar a foto pelo aparelho.',
        );
        setStatus('error');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        setStatus('live');
        navigator.mediaDevices
          .enumerateDevices()
          .then((d) => !cancelled && setHasTwoCameras(d.filter((x) => x.kind === 'videoinput').length > 1))
          .catch(() => undefined);
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException)?.name;
        setErrorMsg(
          name === 'NotAllowedError'
            ? 'A câmera foi bloqueada. Toque no cadeado ao lado do endereço do site e permita a câmera — ou use os botões abaixo.'
            : 'Não consegui abrir a câmera. Use os botões abaixo para tirar a foto pelo aparelho ou escolher da galeria.',
        );
        setStatus('error');
      }
    }
    if (!shot) start();
    return () => {
      cancelled = true;
    };
  }, [facing, shot, stop]);

  useEffect(() => stop, [stop]);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const photo = drawToPhoto(video, video.videoWidth, video.videoHeight, { mirror: facing === 'user', ratio: [3, 4] });
    setFlash(true);
    setTimeout(() => setFlash(false), 280);
    stop();
    setShot(photo);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      stop();
      onPhoto(await photoFromFile(file));
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus('error');
    }
  }

  const frame =
    'relative mx-auto aspect-[3/4] w-full max-w-[min(100vw,calc((100dvh-220px)*0.75))] overflow-hidden bg-plum-950 sm:rounded-[28px]';

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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Spinner className="border-white/30 border-t-white" />
                  <p className="font-semibold">Abrindo a câmera…</p>
                </div>
              )}
              {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <Icon name="camera" size={44} className="text-plum-300" />
                  <p className="text-base font-semibold leading-relaxed">{errorMsg}</p>
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
        {shot ? (
          <div className="mx-auto flex max-w-md flex-col gap-3">
            <Button size="xl" icon="check" onClick={() => onPhoto(shot)}>
              Usar esta foto
            </Button>
            <Button variant="light" icon="refresh" onClick={() => setShot(null)}>
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
              disabled={!hasTwoCameras || status === 'error'}
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
