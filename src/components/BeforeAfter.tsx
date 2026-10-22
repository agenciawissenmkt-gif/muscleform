import { useRef, useState, type CSSProperties } from 'react';

/** Comparador "antes e depois": arraste a barra (ou use as setas do teclado). */
export default function BeforeAfter({ before, after, ratio }: { before: string; after: string; ratio: string }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function moveTo(clientX: number) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }

  return (
    <div
      ref={box}
      className="ratio-box w-full touch-pan-y select-none overflow-hidden"
      style={{ '--ratio': ratio.replace(':', ' / ') } as CSSProperties}
      // Arrastar para os lados move a barra; deslizar para cima/baixo rola a página.
      onPointerDown={(e) => {
        dragging.current = true;
        if (e.pointerType === 'mouse') {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          moveTo(e.clientX);
        }
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img src={before} alt="Antes" draggable={false} className="absolute inset-0 size-full object-cover" />
      <img
        src={after}
        alt="Depois"
        draggable={false}
        className="absolute inset-0 size-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      />
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-sm font-extrabold text-white backdrop-blur">
        Antes
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-orchid-500/85 px-3 py-1 text-sm font-extrabold text-white backdrop-blur">
        Depois
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.4)]"
        style={{ left: `${pos}%` }}
      />
      <button
        type="button"
        role="slider"
        aria-label="Comparar antes e depois"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
          if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
        }}
        className="absolute top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-plum-700 shadow-lift ring-4 ring-orchid-400/60"
        style={{ left: `${pos}%` }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6-5 6 5 6M15 6l5 6-5 6" />
        </svg>
      </button>
    </div>
  );
}
