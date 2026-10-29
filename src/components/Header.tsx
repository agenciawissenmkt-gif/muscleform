import { useEffect, useRef, useState } from 'react';
import type { Account, User } from '../lib/api';
import Logo from './Logo';
import { Icon, IconButton } from './ui';
import { PANEL_URL } from '../lib/role';

/** Quantas imagens já foram usadas do plano / da demonstração. */
export function UsageBadge({ account }: { account: Account | null }) {
  if (!account || account.kind === 'admin') return null;
  const left = Math.max(0, account.limit - account.used);
  const low = left <= Math.max(2, Math.round(account.limit * 0.1));
  return (
    <span
      title={account.kind === 'demo' ? 'Imagens da demonstração' : 'Imagens do plano neste mês'}
      className={`hidden shrink-0 rounded-full px-3 py-1.5 text-sm font-extrabold min-[400px]:inline-block ${
        low ? 'bg-red-50 text-red-700' : 'bg-plum-100 text-plum-800'
      }`}
    >
      {account.kind === 'demo' ? `Demonstração: ${left} de ${account.limit}` : `${account.used} de ${account.limit}`}
    </span>
  );
}

export default function Header({
  user,
  account,
  onLogout,
  onBack,
  backLabel = 'Voltar',
}: {
  user: User;
  account: Account | null;
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
        <UsageBadge account={account} />
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
            <div className="pop-in absolute right-0 top-14 w-64 rounded-2xl bg-white p-2 shadow-lift ring-1 ring-plum-100">
              <div className="px-3 py-2">
                <p className="truncate font-extrabold text-plum-900">{user.name}</p>
                {user.email && <p className="truncate text-sm text-ink-soft">{user.email}</p>}
                {account?.kind === 'salon' && (
                  <p className="mt-2 rounded-xl bg-plum-50 px-3 py-2 text-sm font-bold text-plum-800">
                    {account.salon}
                    <br />
                    <span className="font-semibold text-ink-soft">
                      {account.used} de {account.limit} imagens neste mês
                    </span>
                  </p>
                )}
                {account?.kind === 'demo' && (
                  <p className="mt-2 rounded-xl bg-plum-50 px-3 py-2 text-sm font-bold text-plum-800">
                    Demonstração: {Math.max(0, account.limit - account.used)} de {account.limit} imagens restantes
                  </p>
                )}
              </div>
              {account && 'isAdmin' in account && account.isAdmin && PANEL_URL && (
                <a
                  href={PANEL_URL}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-bold text-plum-800 hover:bg-plum-50"
                >
                  <Icon name="sparkles" size={22} /> Painel empresarial
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-bold text-plum-800 hover:bg-plum-50"
              >
                <Icon name="logout" size={22} /> {account?.kind === 'demo' ? 'Sair da demonstração' : 'Sair'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
