import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  colorCategories,
  cutCategories,
  type CatalogItem,
  type Category,
  type HairColor,
  type Haircut,
} from '../catalog';
import { CatalogCard } from '../components/CatalogCard';
import { Flower } from '../components/Flowers';
import { Button, Icon } from '../components/ui';
import type { Mode } from '../lib/api';
import type { Photo } from '../lib/image';
import { searchCatalog } from '../lib/search';

const MODES: { key: Mode; label: string; icon: 'scissors' | 'palette' | 'sparkles' }[] = [
  { key: 'cut', label: 'Corte', icon: 'scissors' },
  { key: 'color', label: 'Cor', icon: 'palette' },
  { key: 'both', label: 'Corte + Cor', icon: 'sparkles' },
];

export interface Selection {
  mode: Mode;
  cut: Haircut | null;
  color: HairColor | null;
}

export default function Choose({
  photo,
  selection,
  onChange,
  onChangePhoto,
  onGenerate,
  error,
  aiReady,
}: {
  photo: Photo;
  selection: Selection;
  onChange: (s: Selection) => void;
  onChangePhoto: () => void;
  onGenerate: () => void;
  error: string | null;
  aiReady: boolean;
}) {
  const { mode, cut, color } = selection;
  // No modo "Corte + Cor" a escolha acontece em 2 passos (abas).
  const [tab, setTab] = useState<'cut' | 'color'>(mode === 'color' ? 'color' : 'cut');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const listTop = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // Altura real da barra fixa do celular: o fim da lista nunca fica escondido atrás dela.
  const [barHeight, setBarHeight] = useState(180);
  // Teclado aberto na pesquisa: a barra de baixo sai da frente dos resultados
  const [typing, setTyping] = useState(false);
  // A barra só volta depois do toque que fechou o teclado (senão ela "rouba" o toque num cartão)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => el.offsetHeight && setBarHeight(el.offsetHeight);
    if (typeof ResizeObserver === 'undefined') {
      // iPhone com iOS < 13.4: mede de novo ao girar a tela e a cada mudança na tela
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeTab: 'cut' | 'color' = mode === 'both' ? tab : mode;

  useEffect(() => {
    setQuery('');
  }, [activeTab]);

  const categories = (activeTab === 'cut' ? cutCategories : colorCategories) as Category<CatalogItem>[];
  const results = useMemo(() => searchCatalog(categories, deferredQuery), [categories, deferredQuery]);
  const searching = deferredQuery.trim().length > 0;
  const total = useMemo(() => categories.reduce((n, c) => n + c.items.length, 0), [categories]);

  const ready = mode === 'cut' ? !!cut : mode === 'color' ? !!color : !!cut && !!color;
  const missing =
    mode === 'cut'
      ? 'Escolha um corte'
      : mode === 'color'
        ? 'Escolha uma cor'
        : !cut
          ? 'Escolha um corte'
          : 'Agora escolha a cor';

  function scrollToList() {
    const el = listTop.current;
    if (!el) return;
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 64;
    const y = el.getBoundingClientRect().top + window.scrollY - header - 8;
    if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function setMode(m: Mode) {
    onChange({ ...selection, mode: m });
    setTab(m === 'color' ? 'color' : m === 'both' && cut && !color ? 'color' : 'cut');
  }

  const selectedId = activeTab === 'cut' ? cut?.id : color?.id;

  // Ref com o estado atual: mantém onSelect estável e evita redesenhar
  // centenas de cards a cada toque.
  const latest = useRef({ selection, onChange });
  latest.current = { selection, onChange };

  const onSelect = useCallback((item: CatalogItem) => {
    const { selection, onChange } = latest.current;
    const { cut, color, mode } = selection;
    // Tocar só seleciona (um toque duplo não desmarca). Para tirar, use o X da escolha.
    if (item.kind === 'cut') {
      if (cut?.id === item.id) return;
      onChange({ ...selection, cut: item });
      if (mode === 'both' && !color) {
        setTimeout(() => {
          if (latest.current.selection.cut?.id !== item.id) return;
          setTab('color');
          scrollToList();
        }, 350);
      }
    } else if (color?.id !== item.id) {
      onChange({ ...selection, color: item });
    }
  }, []);

  const summary = (
    <div
      className={`grid gap-2 ${mode === 'both' ? 'grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-1' : 'grid-cols-1'}`}
    >
      {mode !== 'color' && (
        <Chip
          icon="scissors"
          label="Corte"
          value={cut?.name}
          onClear={cut ? () => onChange({ ...selection, cut: null }) : undefined}
        />
      )}
      {mode !== 'cut' && (
        <Chip
          icon="palette"
          label="Cor"
          value={color?.name}
          onClear={color ? () => onChange({ ...selection, color: null }) : undefined}
        />
      )}
    </div>
  );

  // Enquanto a IA não estiver ativada no servidor, o botão mostra um aviso
  // simpático em vez de um termo técnico.
  const [soon, setSoon] = useState(false);
  useEffect(() => {
    if (!soon) return;
    const t = setTimeout(() => setSoon(false), 6000);
    return () => clearTimeout(t);
  }, [soon]);
  const generateButton = (
    <Button
      size="xl"
      icon="sparkles"
      onClick={() => (aiReady ? onGenerate() : setSoon(true))}
      disabled={!ready}
      className="w-full"
    >
      {ready ? 'Veja sua beleza' : missing}
    </Button>
  );
  const soonNote = soon && !aiReady && (
    <p role="status" className="pop-in mb-3 rounded-2xl bg-plum-50 px-3.5 py-2.5 text-sm font-bold text-plum-800">
      ✨ A criação das imagens será ativada em breve. Por enquanto, explore à vontade os cortes e as cores!
    </p>
  );
  // No celular: só uma linha discreta com o que foi escolhido (sem caixas).
  const chosen = [mode !== 'color' && cut?.name, mode !== 'cut' && color?.name].filter(Boolean).join(' + ');
  // Sem ResizeObserver (iOS < 13.4): mede a barra quando o conteúdo dela muda
  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined' && barRef.current?.offsetHeight) {
      setBarHeight(barRef.current.offsetHeight);
    }
  }, [error, soon, chosen]);

  return (
    <>
      <main
        className="screen-in mx-auto w-full max-w-6xl flex-1 px-4 pt-4 sm:px-5 lg:grid lg:grid-cols-[340px_1fr] lg:gap-8 lg:!pb-12 lg:pt-6"
        style={{ paddingBottom: barHeight + 24 }}
      >
        {/* Coluna da foto (no computador fica fixa ao lado) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3 lg:flex-col lg:items-stretch">
            <div className="relative w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-plum-200 sm:w-24 lg:mx-auto lg:w-auto lg:rounded-[28px]">
              {/* No computador, a foto encolhe com a altura da tela para o botão caber sempre */}
              <img
                src={photo.dataUrl}
                alt="Sua foto"
                className="aspect-[3/4] w-full object-cover lg:h-[clamp(12rem,calc(100dvh-25rem),28rem)] lg:w-auto"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold leading-tight text-plum-950 lg:hidden">O que vamos mudar?</p>
              <button
                type="button"
                onClick={onChangePhoto}
                className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 font-bold text-plum-700 hover:bg-plum-100 lg:w-full lg:justify-center lg:ring-1 lg:ring-plum-200"
              >
                <Icon name="camera" size={20} /> Trocar foto
              </button>
            </div>
          </div>

          <div className="mt-5 hidden lg:block">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wider text-plum-600">Sua escolha</p>
            {summary}
            {error && <ErrorNote message={error} />}
            <div className="mt-4">
              {soonNote}
              {generateButton}
            </div>
          </div>
        </aside>

        <section className="mt-5 lg:mt-0">
          <p className="mb-2 hidden text-2xl font-extrabold text-plum-950 lg:block">O que vamos mudar?</p>
          {/* Corte / Cor / Corte + Cor */}
          <div
            role="radiogroup"
            aria-label="O que mudar"
            className="grid grid-cols-3 gap-2 rounded-3xl bg-plum-100/70 p-1.5"
          >
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={mode === m.key}
                onClick={() => setMode(m.key)}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[20px] px-1 text-[0.95rem] font-extrabold transition sm:flex-row sm:gap-2 ${
                  mode === m.key ? 'brand-gradient text-white shadow-soft' : 'text-plum-800 hover:bg-white/70'
                }`}
              >
                <Icon name={m.icon} size={22} />
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'both' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['cut', 'color'] as const).map((t, i) => {
                const done = t === 'cut' ? !!cut : !!color;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 font-extrabold transition ${
                      tab === t
                        ? 'border-orchid-500 bg-white text-plum-900'
                        : 'border-transparent bg-white/60 text-ink-soft'
                    }`}
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-sm ${
                        done ? 'bg-orchid-500 text-white' : 'bg-plum-100 text-plum-700'
                      }`}
                    >
                      {done ? <Icon name="check" size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    {t === 'cut' ? 'Corte' : 'Cor'}
                  </button>
                );
              })}
            </div>
          )}

          {/* Pesquisa */}
          <div
            ref={listTop}
            className="sticky top-[calc(4rem+1px+env(safe-area-inset-top))] z-20 -mx-4 mt-3 bg-paper/90 px-4 py-2 backdrop-blur-md sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0"
          >
            {/* A tecla "Buscar" do teclado fecha o teclado e mostra os resultados */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                searchRef.current?.blur();
              }}
              className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-soft ring-2 ring-plum-100 focus-within:ring-plum-400"
            >
              <Icon name="search" className="shrink-0 text-plum-500" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  clearTimeout(typingTimer.current);
                  setTyping(true);
                }}
                onBlur={() => {
                  typingTimer.current = setTimeout(() => setTyping(false), 300);
                }}
                placeholder={activeTab === 'cut' ? 'Pesquisar corte… ex.: chanel' : 'Pesquisar cor… ex.: loiro mel'}
                aria-label={activeTab === 'cut' ? 'Pesquisar corte' : 'Pesquisar cor'}
                enterKeyHint="search"
                className="min-w-0 flex-1 appearance-none bg-transparent text-[1.05rem] font-semibold text-plum-950 placeholder:font-medium placeholder:text-ink-soft/70 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpar pesquisa"
                  className="flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-plum-50"
                >
                  <Icon name="close" size={20} />
                </button>
              )}
            </form>
          </div>

          <div className="mt-2">
            {total === 0 ? (
              <Empty text="O catálogo ainda está sendo carregado." />
            ) : searching ? (
              results.length ? (
                <>
                  <p className="mb-3 mt-2 text-sm font-bold text-ink-soft">
                    {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                  </p>
                  <Grid items={results} selectedId={selectedId} onSelect={onSelect} />
                </>
              ) : (
                <Empty
                  text={`Não encontrei "${deferredQuery}". Tente outro nome, por exemplo: ${activeTab === 'cut' ? 'chanel, franja, cacheado' : 'loiro, ruivo, mechas'}.`}
                />
              )
            ) : (
              categories.map((cat) =>
                cat.items.length ? (
                  <section key={cat.key} className="lazy-section mt-4">
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-plum-900">
                      <Flower size={20} /> {cat.label}
                      <span className="text-sm font-bold text-ink-soft">({cat.items.length})</span>
                    </h2>
                    <Grid items={cat.items} selectedId={selectedId} onSelect={onSelect} />
                  </section>
                ) : null,
              )
            )}
          </div>
        </section>
      </main>

      {/* Barra fixa no celular (fora do <main> animado para ficar presa à tela) */}
      <div
        ref={barRef}
        className={`safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-plum-100 bg-white/95 px-4 pt-3 shadow-[0_-12px_30px_-18px_rgb(76_29_149/0.5)] backdrop-blur-md lg:hidden ${typing ? 'hidden' : ''}`}
      >
        <div className="mx-auto max-w-xl">
          {error && <ErrorNote message={error} />}
          {soonNote}
          {chosen && (
            <p className="mb-2 truncate text-center text-[0.95rem] font-bold text-plum-700">
              <Icon name="check" size={16} strokeWidth={3} className="mr-1 inline-block align-[-2px]" />
              {chosen}
            </p>
          )}
          {generateButton}
        </div>
      </div>
    </>
  );
}

function Grid({
  items,
  selectedId,
  onSelect,
}: {
  items: CatalogItem[];
  selectedId?: string;
  onSelect: (item: CatalogItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} selected={item.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

function Chip({
  icon,
  label,
  value,
  onClear,
}: {
  icon: 'scissors' | 'palette';
  label: string;
  value?: string;
  onClear?: () => void;
}) {
  return (
    <span
      className={`flex min-h-11 min-w-0 items-center gap-2 rounded-full pl-3.5 text-[0.95rem] font-bold ${
        value ? 'bg-plum-100 text-plum-900' : 'border border-dashed border-plum-300 bg-plum-50 pr-3.5 text-ink-soft'
      } ${value && !onClear ? 'pr-3.5' : ''}`}
    >
      <Icon name={icon} size={20} className="shrink-0 text-plum-600" />
      <span className="sr-only">{label}:</span>
      <span className="min-w-0 flex-1 truncate">
        {value ?? (label === 'Cor' ? 'escolha a cor' : 'escolha o corte')}
      </span>
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Remover ${label.toLowerCase()}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-plum-200"
        >
          <Icon name="close" size={16} strokeWidth={2.6} />
        </button>
      )}
    </span>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mb-3 mt-3 flex gap-2 rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-red-200"
    >
      <Icon name="alert" size={20} className="shrink-0" /> {message}
    </p>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-plum-100">
      <Flower size={44} />
      <p className="max-w-sm font-semibold text-ink-soft">{text}</p>
    </div>
  );
}
