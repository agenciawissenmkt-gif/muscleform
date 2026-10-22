import { useEffect, useState, type CSSProperties } from 'react';
import { FallingPetals } from '../components/Flowers';
import Logo from '../components/Logo';
import { Button } from '../components/ui';
import type { Mode } from '../lib/api';

const MESSAGES: Record<Mode, string[]> = {
  cut: [
    'Preparando sua foto…',
    'Desenhando o novo corte fio a fio…',
    'Ajustando o comprimento e as camadas…',
    'Preservando o seu rosto e o cenário…',
    'Dando brilho e movimento aos fios…',
    'Finalizando os detalhes…',
  ],
  color: [
    'Preparando sua foto…',
    'Misturando a cor perfeita…',
    'Aplicando a cor mecha por mecha…',
    'Preservando o seu rosto e o cenário…',
    'Ajustando brilho e reflexos…',
    'Finalizando os detalhes…',
  ],
  both: [
    'Preparando sua foto…',
    'Desenhando o novo corte fio a fio…',
    'Misturando a cor perfeita…',
    'Preservando o seu rosto e o cenário…',
    'Ajustando brilho e movimento…',
    'Finalizando os detalhes…',
  ],
};

function BloomingFlower() {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      viewBox="0 0 120 120"
      className="size-28 drop-shadow-[0_10px_20px_rgb(26_9_51/0.45)] sm:size-32"
      aria-hidden="true"
    >
      <g className="spin-slow" style={{ transformOrigin: '60px 60px' }}>
        {petals.map((r, i) => (
          <ellipse
            key={r}
            className="petal-bloom"
            cx="60"
            cy="33"
            rx="11"
            ry="24"
            fill={i % 2 ? 'var(--color-orchid-400)' : 'var(--color-blossom-200)'}
            style={{ '--r': `${r}deg`, animationDelay: `${i * 0.12}s`, transformOrigin: '60px 60px' } as CSSProperties}
          />
        ))}
        <circle cx="60" cy="60" r="12" fill="var(--color-pollen)" />
        <circle cx="56" cy="56" r="3.5" fill="#fff" opacity="0.7" />
      </g>
    </svg>
  );
}

export default function Generating({ photo, mode, onCancel }: { photo: string; mode: Mode; onCancel: () => void }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(4);
  const messages = MESSAGES[mode];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 3200);
    return () => clearInterval(t);
  }, [messages.length]);

  // Barra de progresso estimada: avança rápido no começo e desacelera,
  // sem nunca chegar a 100% antes da imagem ficar pronta.
  useEffect(() => {
    const t = setInterval(() => setProgress((p) => p + (95 - p) * 0.045), 300);
    return () => clearInterval(t);
  }, []);

  return (
    // Rola em celulares bem pequenos: o botão "Cancelar" nunca fica escondido.
    <main className="brand-gradient fixed inset-0 z-50 overflow-y-auto text-white">
      <FallingPetals />
      <div className="safe-top safe-bottom relative flex min-h-full flex-col items-center px-6">
        <div className="mt-5 flex justify-center">
          <Logo size="sm" light />
        </div>

        <div className="screen-in relative my-auto flex w-full max-w-sm flex-col items-center py-6 text-center">
          <div className="relative w-[clamp(7rem,calc((100dvh-27rem)*0.75),16rem)]">
            <div className="ratio-box overflow-hidden rounded-[32px] ring-4 ring-white/40 shadow-[0_30px_60px_-20px_rgb(26_9_51/0.7)]">
              <img src={photo} alt="" className="absolute inset-0 size-full object-cover blur-[1.5px] saturate-[.75]" />
              <div className="absolute inset-0 bg-plum-900/30" />
              <div className="shimmer absolute inset-0" />
              <div className="scan-line absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-orchid-400/45 to-transparent" />
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <BloomingFlower />
            </div>
          </div>

          <h1 className="mt-14 text-[1.7rem] font-extrabold leading-tight [@media(max-height:640px)]:mt-10 [@media(max-height:640px)]:text-2xl [@media(max-height:640px)]:leading-tight">
            Criando seu novo visual
          </h1>
          <p key={index} className="fade-swap mt-2 min-h-14 text-lg font-semibold text-plum-100" aria-live="polite">
            {messages[index]}
          </p>

          <div
            className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/20 [@media(max-height:640px)]:mt-3"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Progresso"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blossom-200 to-pollen transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-plum-100">Isso leva alguns segundos. Não feche esta tela.</p>

          <Button variant="light" size="md" onClick={onCancel} className="mt-6 [@media(max-height:640px)]:mt-3">
            Cancelar
          </Button>
        </div>
      </div>
    </main>
  );
}
