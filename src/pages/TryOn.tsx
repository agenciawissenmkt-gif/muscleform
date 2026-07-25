import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LiveTryOnCanvas, { type LiveTryOnHandle, type TryOnStatus } from '../components/LiveTryOnCanvas';
import { haircuts } from '../data/haircuts';
import { haircolors } from '../data/haircolors';
import hairAssetManifest from '../data/hairAssetManifest.json';

export default function TryOn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const canvasHandle = useRef<LiveTryOnHandle>(null);

  const [colorId, setColorId] = useState<string | null>(params.get('cor'));
  const [haircutId, setHaircutId] = useState<string | null>(params.get('corte'));
  const [status, setStatus] = useState<TryOnStatus>('loading-model');
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [frozen, setFrozen] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const color = haircolors.find((c) => c.id === colorId) ?? null;
  const haircut = haircuts.find((h) => h.id === haircutId) ?? null;
  const hasRealisticPreview = Boolean(haircut && haircut.id in hairAssetManifest);

  function handleCapture() {
    const result = canvasHandle.current?.capture();
    if (!result) return;
    setSnapshot(result.photo);
    setFrozen(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
  }

  function handleRetry() {
    setFrozen(false);
    setSnapshot(null);
  }

  function handleFlipCamera() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }

  function handleDownload() {
    if (!snapshot) return;
    const a = document.createElement('a');
    a.href = snapshot;
    a.download = 'your-beauty-visual.jpg';
    a.click();
  }

  const isLoading = status === 'loading-model' || status === 'requesting-camera';
  const hasError = status === 'no-camera' || status === 'error';

  return (
    <div className="flex h-[100svh] flex-col bg-ink-900 px-4 pb-4 pt-5">
      <div className="flex items-center justify-between text-cream-50">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">Experimentar</p>
          <p className="text-[11px] text-cream-50/60">Rosto intacto, só o cabelo muda</p>
        </div>
        <button
          onClick={handleFlipCamera}
          disabled={isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 disabled:opacity-40"
          aria-label="Trocar câmera frontal/traseira"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 8a6 6 0 0 1 10-4.5M20 16a6 6 0 0 1-10 4.5M4 8V4M4 8h4M20 16v4M20 16h-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="relative mt-4 flex-1 overflow-hidden rounded-[2rem]">
        <LiveTryOnCanvas
          ref={canvasHandle}
          color={color}
          haircut={haircut}
          frozen={frozen}
          facingMode={facingMode}
          onStatusChange={(s, msg) => {
            setStatus(s);
            setStatusMessage(msg);
          }}
        />

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 bg-white"
            />
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/80 text-cream-50">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              className="h-9 w-9 rounded-full border-2 border-cream-50/25 border-t-cream-50"
            />
            <p className="text-sm text-cream-50/85">
              {status === 'loading-model' ? 'Carregando IA de cabelo...' : 'Abrindo a câmera...'}
            </p>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/90 px-8 text-center text-cream-50">
            <span className="text-3xl">📷</span>
            <p className="text-sm font-medium">{statusMessage ?? 'Não foi possível acessar a câmera.'}</p>
            <p className="text-xs text-cream-50/60">
              Verifique se você permitiu o acesso à câmera para este site nas configurações do navegador.
            </p>
          </div>
        )}

        {!isLoading && !hasError && !frozen && (haircut || color) && (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {color && (
              <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-cream-50 backdrop-blur">
                ● Cor ao vivo: {color.name}
              </span>
            )}
            {haircut && (
              <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-cream-50 backdrop-blur">
                {hasRealisticPreview ? `✨ Cabelo real: ${haircut.name}` : `◐ Guia de formato: ${haircut.name}`}
              </span>
            )}
          </div>
        )}

        {!isLoading && !hasError && !frozen && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCapture}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-white/30"
              aria-label="Capturar foto"
            >
              <span className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-400 to-gold-400" />
            </motion.button>
          </div>
        )}

        {frozen && (
          <img src={snapshot ?? undefined} alt="Resultado" className="absolute inset-0 h-full w-full object-cover" />
        )}

        {frozen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 bottom-4 flex justify-center gap-3 px-4"
          >
            <button
              onClick={handleRetry}
              className="flex-1 rounded-full bg-white/15 py-3 text-sm font-semibold text-cream-50 backdrop-blur"
            >
              Tentar outro
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 rounded-full bg-gradient-to-br from-rose-400 to-gold-400 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Salvar foto
            </button>
          </motion.div>
        )}
      </div>

      <Picker
        selectedColorId={colorId}
        selectedHaircutId={haircutId}
        onSelectColor={(id) => setColorId((prev) => (prev === id ? null : id))}
        onSelectHaircut={(id) => setHaircutId((prev) => (prev === id ? null : id))}
      />
    </div>
  );
}

function Picker({
  selectedColorId,
  selectedHaircutId,
  onSelectColor,
  onSelectHaircut,
}: {
  selectedColorId: string | null;
  selectedHaircutId: string | null;
  onSelectColor: (id: string) => void;
  onSelectHaircut: (id: string) => void;
}) {
  const [tab, setTab] = useState<'cores' | 'cortes'>('cores');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filteredColors = q
    ? haircolors.filter((c) => `${c.name} ${c.aka ?? ''} ${c.tags.join(' ')}`.toLowerCase().includes(q))
    : haircolors;
  const filteredCuts = q
    ? haircuts.filter((h) => `${h.name} ${h.aka ?? ''} ${h.tags.join(' ')}`.toLowerCase().includes(q))
    : haircuts;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-cream-50/60">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === 'cores' ? 'Buscar cor (ex: loiro, rosa, 7.3)...' : 'Buscar corte (ex: pixie, longo)...'}
          className="w-full bg-transparent text-[13px] text-cream-50 placeholder:text-cream-50/40 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="shrink-0 text-cream-50/50" aria-label="Limpar busca">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-2.5 flex gap-2">
        {(['cores', 'cortes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === t ? 'bg-white text-ink-900' : 'bg-white/10 text-cream-50/70'
            }`}
          >
            {t}
            <span className="ml-1 text-[10px] font-normal opacity-60">
              {t === 'cores' ? filteredColors.length : filteredCuts.length}
            </span>
          </button>
        ))}
      </div>

      {tab === 'cores' ? (
        filteredColors.length > 0 ? (
          <div className="no-scrollbar mt-3 grid max-h-[26vh] grid-cols-5 gap-x-2 gap-y-3 overflow-y-auto pb-1">
            {filteredColors.map((c) => (
              <button key={c.id} onClick={() => onSelectColor(c.id)} className="flex flex-col items-center gap-1.5">
                <span
                  className={`h-11 w-11 rounded-full ring-2 ring-offset-2 ring-offset-ink-900 transition-all ${
                    selectedColorId === c.id ? 'ring-rose-400 scale-110' : 'ring-white/20'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${c.swatch.join(', ')})` }}
                />
                <span className="max-w-[58px] truncate text-[9.5px] leading-tight text-cream-50/75">{c.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyPickerState />
        )
      ) : filteredCuts.length > 0 ? (
        <div className="no-scrollbar mt-3 grid max-h-[26vh] grid-cols-2 gap-2 overflow-y-auto pb-1">
          {filteredCuts.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelectHaircut(h.id)}
              className={`flex flex-col items-start gap-0.5 rounded-2xl border px-3 py-2 text-left transition-all ${
                selectedHaircutId === h.id ? 'border-rose-400 bg-white/10' : 'border-white/10'
              }`}
            >
              <span className="max-w-full truncate text-[11px] font-medium text-cream-50">
                {h.id in hairAssetManifest && '✨ '}
                {h.name}
              </span>
              <span className="text-[9px] uppercase tracking-wide text-cream-50/50">{h.length}</span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyPickerState />
      )}
    </div>
  );
}

function EmptyPickerState() {
  return <p className="mt-4 pb-2 text-center text-xs text-cream-50/50">Nada encontrado para essa busca.</p>;
}
