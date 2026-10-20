import { useEffect, useRef, useState } from 'react';
import type { User } from '../lib/api';
import Logo from './Logo';
import { Icon, IconButton } from './ui';

export default function Header({
  user,
  onLogout,
  onBack,
  backLabel = 'Voltar',
}: {
  user: User;
  onLogout: () => void;
  onBack?: () => void;
  backLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-plum-100/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:px-5">
        {onBack ? (
          <IconButton icon="back" label={backLabel} onClick={onBack} className="text-plum-800 hover:bg-plum-100" />
        ) : (
          <span className="w-1" />
        )}
        <div className="min-w-0 flex-1">
          <Logo size="sm" />
        </div>
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Minha conta"
            aria-expanded={open}
            className="flex size-12 items-center justify-center rounded-full ring-2 ring-plum-200 transition hover:ring-plum-400"
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                referrerPolicy="no-referrer"
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <span className="brand-gradient flex size-10 items-center justify-center rounded-full font-extrabold text-white">
                {initial}
              </span>
            )}
          </button>
          {open && (
            <div className="pop-in absolute right-0 top-14 w-64 rounded-2xl bg-white p-2 shadow-[var(--shadow-lift)] ring-1 ring-plum-100">
              <div className="px-3 py-2">
                <p className="truncate font-extrabold text-plum-900">{user.name}</p>
                <p className="truncate text-sm text-ink-soft">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-bold text-plum-800 hover:bg-plum-50"
              >
                <Icon name="logout" size={22} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
