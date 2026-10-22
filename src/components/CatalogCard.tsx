import { memo } from 'react';
import type { CatalogItem } from '../catalog';
import { ColorSwatch, HairArt } from './HairArt';
import { Icon } from './ui';

function CatalogCardImpl({
  item,
  selected,
  onSelect,
}: {
  item: CatalogItem;
  selected: boolean;
  onSelect: (item: CatalogItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-pressed={selected}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white text-left transition active:scale-[0.97] ${
        selected
          ? 'shadow-lift ring-[3px] ring-orchid-500'
          : 'shadow-[0_4px_16px_-10px_rgb(76_29_149/0.4)] ring-1 ring-plum-100 hover:ring-plum-300'
      }`}
    >
      {/* Quadrado feito com padding (funciona em todos os navegadores, inclusive
          Safari de iPhone antigo, onde aspect-ratio dentro de botão falha). */}
      <div
        className={`relative w-full overflow-hidden pt-[100%] ${
          selected ? 'bg-gradient-to-b from-orchid-400/25 to-plum-100' : 'bg-gradient-to-b from-plum-50 to-plum-100'
        }`}
      >
        {item.photo ? (
          <img
            src={item.photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : item.kind === 'cut' ? (
          <HairArt look={item.look} className="absolute bottom-[-5.4%] left-[3.7%] h-[108%] w-[92.6%]" />
        ) : (
          <ColorSwatch swatch={item.swatch} className="absolute inset-0 h-full w-full" />
        )}
        {/* Amostra exata da cor (raiz → pontas) */}
        {item.kind === 'color' && item.photo && (
          <span className="absolute bottom-2 left-2 block size-8 overflow-hidden rounded-full shadow-md ring-2 ring-white">
            <ColorSwatch swatch={item.swatch} className="h-full w-full" />
          </span>
        )}
        {selected && (
          <span className="pop-in absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-orchid-500 text-white shadow-lg">
            <Icon name="check" size={20} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <span className="text-[1.02rem] font-extrabold leading-tight text-plum-950">{item.name}</span>
        <span className="mt-1 line-clamp-2 text-[0.85rem] leading-snug text-ink-soft">{item.description}</span>
      </div>
    </button>
  );
}

export const CatalogCard = memo(CatalogCardImpl);
