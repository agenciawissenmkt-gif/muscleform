import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import StyleCard from '../components/StyleCard';
import ColorCard from '../components/ColorCard';
import { haircuts, lengthLabels, type HairLength } from '../data/haircuts';
import { haircolors, colorFamilyLabels, type ColorFamily } from '../data/haircolors';

type Tab = 'cortes' | 'cores';

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = (params.get('tab') as Tab) || 'cortes';
  const query = (params.get('q') || '').trim().toLowerCase();
  const [lengthFilter, setLengthFilter] = useState<HairLength | 'todos'>('todos');
  const [familyFilter, setFamilyFilter] = useState<ColorFamily | 'todos'>('todos');

  function setTab(t: Tab) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', t);
      return next;
    });
  }

  const filteredCuts = useMemo(() => {
    return haircuts.filter((h) => {
      if (lengthFilter !== 'todos' && h.length !== lengthFilter) return false;
      if (!query) return true;
      const haystack = `${h.name} ${h.aka ?? ''} ${h.description} ${h.tags.join(' ')} ${h.origin}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [lengthFilter, query]);

  const filteredColors = useMemo(() => {
    return haircolors.filter((c) => {
      if (familyFilter !== 'todos' && c.family !== familyFilter) return false;
      if (!query) return true;
      const haystack = `${c.name} ${c.aka ?? ''} ${c.description} ${c.tags.join(' ')} ${c.origin}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [familyFilter, query]);

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Explorar</h1>
      <p className="mt-1 text-sm text-ink-600/70">Cortes e cores do Brasil e do mundo, pesquisados a dedo.</p>

      <div className="mt-4">
        <SearchBar
          defaultValue={params.get('q') || ''}
          onSubmitOverride={(v) =>
            setParams((prev) => {
              const next = new URLSearchParams(prev);
              if (v) next.set('q', v);
              else next.delete('q');
              return next;
            })
          }
        />
      </div>

      <div className="mt-5 flex gap-2 rounded-full bg-blush-100 p-1">
        {(['cortes', 'cores'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              tab === t ? 'text-white' : 'text-ink-600/70'
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 to-gold-400"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative capitalize">{t}</span>
          </button>
        ))}
      </div>

      {tab === 'cortes' ? (
        <>
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {(['todos', 'curto', 'medio', 'longo'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLengthFilter(l)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  lengthFilter === l
                    ? 'border-rose-400 bg-rose-400 text-white'
                    : 'border-blush-200 bg-white text-ink-600/70'
                }`}
              >
                {l === 'todos' ? 'Todos' : lengthLabels[l]}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 pb-4">
            {filteredCuts.map((cut, i) => (
              <StyleCard key={cut.id} haircut={cut} index={i} onClick={() => navigate(`/experimentar?corte=${cut.id}`)} />
            ))}
          </div>
          {filteredCuts.length === 0 && <EmptyState />}
        </>
      ) : (
        <>
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {(['todos', 'loiro', 'castanho', 'preto', 'ruivo', 'fantasia', 'tecnica'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFamilyFilter(f)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  familyFilter === f
                    ? 'border-rose-400 bg-rose-400 text-white'
                    : 'border-blush-200 bg-white text-ink-600/70'
                }`}
              >
                {f === 'todos' ? 'Todas' : colorFamilyLabels[f]}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 pb-4">
            {filteredColors.map((color, i) => (
              <ColorCard key={color.id} color={color} index={i} onClick={() => navigate(`/experimentar?cor=${color.id}`)} />
            ))}
          </div>
          {filteredColors.length === 0 && <EmptyState />}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center">
      <span className="text-3xl">🔍</span>
      <p className="text-sm font-medium text-ink-900">Nada encontrado</p>
      <p className="text-xs text-ink-600/60">Tente buscar por outro nome, cor ou estilo.</p>
    </div>
  );
}
