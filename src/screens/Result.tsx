import { useEffect, useRef, useState } from 'react';
import BeforeAfter from '../components/BeforeAfter';
import { Flower } from '../components/Flowers';
import InAppNotice from '../components/InAppNotice';
import { Button, Icon } from '../components/ui';
import {
  canShareFiles,
  convertImage,
  detectPlatform,
  downloadBlob,
  fileName,
  shareFile,
  type Photo,
} from '../lib/image';
import { detectInApp } from '../lib/inapp';
import type { Selection } from './Choose';

type Format = 'jpg' | 'png';

type View = 'after' | 'before' | 'compare';

export default function Result({
  photo,
  image,
  selection,
  onTryAnother,
  onNewPhoto,
}: {
  photo: Photo;
  image: string;
  selection: Selection;
  onTryAnother: () => void;
  onNewPhoto: () => void;
}) {
  const [view, setView] = useState<View>('after');
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const label = [selection.mode !== 'color' && selection.cut?.name, selection.mode !== 'cut' && selection.color?.name]
    .filter(Boolean)
    .join(' + ');
  const [platform] = useState(detectPlatform);
  const [canShare] = useState(canShareFiles);
  // Dentro do Instagram/Facebook/TikTok no Android não há como baixar arquivos
  const [inApp] = useState(detectInApp);
  const cannotSave = !!inApp && !canShare;

  // Os arquivos ficam prontos já ao abrir a tela: no iPhone a janela de
  // compartilhar só abre se for chamada logo depois do toque.
  const files = useRef<Partial<Record<Format, Blob>>>({});
  useEffect(() => {
    let alive = true;
    files.current = {};
    const prepare = (format: Format) =>
      convertImage(image, format).then((b) => {
        if (alive) files.current[format] = b;
      });
    prepare('jpg')
      .then(() => (alive ? prepare('png') : undefined))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [image]);
  const getFile = async (format: Format) =>
    files.current[format] ?? (files.current[format] = await convertImage(image, format));

  async function run(key: string, fn: () => Promise<string | null>) {
    setBusy(key);
    setNotice(null);
    try {
      setNotice(await fn());
    } catch {
      setNotice('Não consegui salvar a imagem. Tente de novo.');
    } finally {
      setBusy(null);
    }
  }

  // Cada aparelho salva de um jeito:
  // - iPhone: a folha de compartilhar tem "Salvar Imagem" (vai para o app Fotos);
  // - Android: o download vai para a pasta Download, que aparece na Galeria;
  // - computador: download normal.
  const useShareSheet = platform === 'ios' && canShare;

  const save = (format: Format = 'jpg') =>
    run(format === 'png' ? 'png' : 'save', async () => {
      // (sem "await" antes do compartilhar quando o arquivo já está pronto)
      const blob = files.current[format] ?? (await getFile(format));
      const name = fileName(label, format);
      if (useShareSheet) {
        const r = await shareFile(blob, name);
        if (r === 'retry') return 'Toque de novo para abrir as opções de salvar.';
        if (r !== 'unsupported') return null;
      }
      downloadBlob(blob, name);
      if (platform === 'android') return 'Imagem salva! Ela aparece na Galeria, na pasta Download.';
      if (platform === 'ios') return 'Imagem salva em Arquivos → Downloads.';
      return `Imagem ${format.toUpperCase()} baixada!`;
    });

  const send = () =>
    run('send', async () => {
      const blob = files.current.jpg ?? (await getFile('jpg'));
      const r = await shareFile(blob, fileName(label, 'jpg'));
      if (r === 'retry') return 'Toque de novo em Enviar para abrir as opções.';
      return r === 'unsupported'
        ? 'Este aparelho não permite enviar direto. Salve a imagem e envie pela galeria.'
        : null;
    });

  return (
    <main className="screen-in mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-5 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 lg:pt-8">
      <section>
        <div className="mb-3 lg:hidden">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-plum-950">
            <Flower size={26} /> Seu novo visual
          </h1>
          {label && <p className="mt-0.5 truncate pl-9 font-bold text-plum-600">{label}</p>}
        </div>

        <div className="mx-auto max-w-[min(100%,calc((100dvh-260px)*0.75))] overflow-hidden rounded-[28px] bg-plum-100 shadow-lift ring-1 ring-plum-200 lg:max-w-[min(100%,calc((100dvh-140px)*0.75))]">
          {view === 'compare' ? (
            <BeforeAfter before={photo.dataUrl} after={image} ratio={photo.aspectRatio} />
          ) : (
            <img
              key={view}
              src={view === 'after' ? image : photo.dataUrl}
              alt={view === 'after' ? 'Depois: seu novo visual' : 'Antes: sua foto original'}
              className="pop-in w-full object-cover"
              style={{ aspectRatio: photo.aspectRatio.replace(':', ' / ') }}
            />
          )}
        </div>

        <div
          role="tablist"
          aria-label="Visualização"
          className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-1.5 rounded-2xl bg-plum-100/80 p-1.5"
        >
          {(
            [
              ['after', 'Depois'],
              ['before', 'Antes'],
              ['compare', 'Comparar'],
            ] as [View, string][]
          ).map(([k, t]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={view === k}
              onClick={() => setView(k)}
              className={`min-h-12 rounded-xl font-extrabold transition ${view === k ? 'bg-white text-plum-900 shadow' : 'text-plum-700 hover:bg-white/60'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <aside className="mt-5 lg:sticky lg:top-24 lg:mt-0">
        <h1 className="hidden items-center gap-2 text-3xl font-extrabold text-plum-950 lg:flex">
          <Flower size={30} /> Seu novo visual
        </h1>
        {label && (
          <p className="mt-4 hidden rounded-2xl bg-white px-4 py-3 font-bold text-plum-800 ring-1 ring-plum-100 lg:block">
            <span className="text-sm font-extrabold uppercase tracking-wider text-plum-500">Escolha</span>
            <br />
            {label}
          </p>
        )}

        <div className="flex flex-col gap-3 lg:mt-4">
          {cannotSave ? (
            <>
              <p className="flex items-start gap-2 rounded-2xl bg-plum-50 px-4 py-3 font-bold text-plum-900 ring-1 ring-plum-200">
                <Icon name="camera" size={22} className="mt-0.5 shrink-0 text-plum-600" />
                Para guardar agora, tire um print da tela.
              </p>
              <InAppNotice inApp={inApp} reason="Salvar a imagem no aparelho não funciona" />
            </>
          ) : (
            <Button size="xl" icon="download" onClick={() => save('jpg')} disabled={!!busy}>
              {busy === 'save' ? 'Preparando…' : platform === 'desktop' ? 'Baixar imagem' : 'Salvar na galeria'}
            </Button>
          )}
          {platform !== 'desktop' && canShare && (
            <Button variant="secondary" icon="share" onClick={send} disabled={!!busy}>
              {busy === 'send' ? 'Preparando…' : 'Enviar (WhatsApp…)'}
            </Button>
          )}
          {!cannotSave && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" icon="download" size="md" onClick={() => save('jpg')} disabled={!!busy}>
                Baixar JPG
              </Button>
              <Button variant="ghost" icon="download" size="md" onClick={() => save('png')} disabled={!!busy}>
                Baixar PNG
              </Button>
            </div>
          )}
          {useShareSheet && (
            <p className="px-1 text-sm text-ink-soft">
              Dica: no iPhone, toque em <b>Salvar Imagem</b> para guardar no app Fotos.
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="pop-in flex items-center gap-2 rounded-xl bg-plum-50 px-3 py-2 font-bold text-plum-800"
            >
              <Icon name="check" size={20} /> {notice}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-3 border-t border-plum-100 pt-6">
          <Button variant="secondary" icon="sparkles" onClick={onTryAnother}>
            Experimentar outro visual
          </Button>
          <Button variant="ghost" icon="camera" onClick={onNewPhoto}>
            Tirar nova foto
          </Button>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-soft">
          Imagem criada por inteligência artificial: é uma simulação do resultado. O resultado real no salão pode
          variar.
        </p>
      </aside>
    </main>
  );
}
