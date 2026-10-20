import { useRef, useState } from 'react';
import { FloralCorner, Flower } from '../components/Flowers';
import { Button, Icon, Spinner } from '../components/ui';
import type { User } from '../lib/api';
import { photoFromFile, type Photo } from '../lib/image';

export default function Start({
  user,
  aiReady,
  onCamera,
  onPhoto,
}: {
  user: User;
  aiReady: boolean;
  onCamera: () => void;
  onPhoto: (p: Photo) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstName = user.name.split(' ')[0] || 'olá';

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onPhoto(await photoFromFile(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    // Celular: saudação → botões → passos (botões sempre visíveis sem rolar).
    // Computador: saudação e passos à esquerda, botões à direita.
    <main className="screen-in relative mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 content-start gap-6 overflow-hidden px-5 pb-10 pt-6 lg:grid-cols-[1fr_420px] lg:content-center lg:gap-x-14 lg:pt-14">
      <FloralCorner flip className="pointer-events-none absolute -right-14 -top-6 w-48 opacity-70 lg:w-72" />

      <section className="relative z-10 order-1 lg:order-none lg:col-start-1 lg:row-start-1 lg:self-end">
        <p className="text-lg font-bold text-plum-600">Olá, {firstName}!</p>
        <h1 className="mt-1 text-[2rem] font-extrabold leading-tight text-plum-950 sm:text-5xl">
          Vamos descobrir o seu <span className="font-display italic text-gradient">novo visual</span>?
        </h1>
      </section>

      <section className="relative z-10 order-3 lg:order-none lg:col-start-1 lg:row-start-2 lg:self-start">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wider text-plum-600">Como funciona</p>
        <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { n: 1, t: 'Tire uma foto', d: 'de frente, com o rosto bem visível' },
            { n: 2, t: 'Escolha', d: 'o corte, a cor ou os dois' },
            { n: 3, t: 'Veja e salve', d: 'o resultado em segundos' },
          ].map((s) => (
            <li key={s.n} className="flex items-center gap-3 py-1">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-plum-100 text-lg font-extrabold text-plum-700">
                {s.n}
              </span>
              <span>
                <b className="block text-plum-900">{s.t}</b>
                <span className="text-sm text-ink-soft">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative z-10 order-2 flex flex-col gap-4 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        {!aiReady && (
          <p role="status" className="flex gap-2 rounded-2xl bg-plum-50 px-4 py-3 text-sm font-bold text-plum-800">
            <Icon name="sparkles" size={20} className="shrink-0" />
            Modo demonstração: explore os cortes e as cores à vontade. A criação das imagens será ativada em breve.
          </p>
        )}

        <div className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-lift)] ring-1 ring-plum-100">
          <Button size="xl" icon="camera" onClick={onCamera} className="w-full">
            Tirar foto
          </Button>
          <Button
            variant="secondary"
            icon="gallery"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="mt-3 w-full"
          >
            Escolher da galeria
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          {busy && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-plum-700">
              <Spinner /> Preparando a foto…
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-plum-50 p-4 ring-1 ring-plum-100">
          <p className="flex items-center gap-2 font-extrabold text-plum-800">
            <Flower size={20} /> Dicas para um resultado perfeito
          </p>
          <ul className="mt-2 grid gap-1.5 text-[0.95rem] text-ink-soft">
            <li className="flex gap-2">
              <Icon name="face" size={20} className="shrink-0 text-plum-500" /> Rosto de frente, olhando para a câmera
            </li>
            <li className="flex gap-2">
              <Icon name="sun" size={20} className="shrink-0 text-plum-500" /> Boa luz, sem sombra forte no rosto
            </li>
            <li className="flex gap-2">
              <Icon name="scissors" size={20} className="shrink-0 text-plum-500" /> Cabelo à mostra, sem boné ou chapéu
            </li>
          </ul>
        </div>

        <p className="flex items-start gap-2 px-1 text-xs text-ink-soft">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />A foto é usada só para criar o novo visual e não
          fica salva no aplicativo.
        </p>
      </section>
    </main>
  );
}
