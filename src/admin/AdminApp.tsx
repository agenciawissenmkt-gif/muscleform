// Painel empresarial do Beauty and self: clientes (salões), planos, uso de
// imagens, faturamento, rankings e falhas. Só para os administradores.
import { useCallback, useEffect, useState } from 'react';
import { Flower } from '../components/Flowers';
import Logo from '../components/Logo';
import { Icon } from '../components/ui';
import { GoogleButton } from '../screens/Login';
import { api, type AppConfig, type User } from '../lib/api';
import { startGoogleLogin, takeGoogleResult } from '../lib/googleLogin';
import { APP_URL, PANEL_PATH } from '../lib/role';
import { AuditTab, ErrorsTab, RankingsTab, SettingsTab } from './tabs';
import { OverviewTab } from './OverviewTab';
import { TenantsTab } from './TenantsTab';

type Tab = 'overview' | 'tenants' | 'rankings' | 'errors' | 'audit' | 'settings';

const TABS: { id: Tab; label: string; hint: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'overview', label: 'Dashboard', hint: 'Faturamento e uso', icon: 'chart' },
  { id: 'tenants', label: 'Clientes', hint: 'Salões e planos', icon: 'users' },
  { id: 'rankings', label: 'Rankings', hint: 'Grand Prix dos cortes', icon: 'trophy' },
  { id: 'errors', label: 'Falhas', hint: 'Erros na geração', icon: 'alert' },
  { id: 'audit', label: 'Registro', hint: 'Ações e logins', icon: 'list' },
  { id: 'settings', label: 'Ajustes', hint: 'Custos e demonstração', icon: 'cog' },
];

export default function AdminApp() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<'loading' | 'login' | 'ready'>('loading');
  const [notice, setNotice] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(() => {
    const t = new URLSearchParams(window.location.search).get('aba') as Tab | null;
    return t && TABS.some((x) => x.id === t) ? t : 'overview';
  });

  const boot = useCallback(async () => {
    setState('loading');
    try {
      const google = takeGoogleResult();
      if (google?.error) setNotice(google.error);
      if (google?.accessToken) {
        await api.loginGoogle(google.accessToken).catch((err: Error) => setNotice(err.message));
      }
      const [cfg, me] = await Promise.all([api.config(), api.me().catch(() => null)]);
      setConfig(cfg);
      if (!me?.user || !me.account || !('isAdmin' in me.account) || !me.account.isAdmin) {
        if (me?.user) setNotice(`A conta ${me.user.email} não é administradora do painel.`);
        setState('login');
        return;
      }
      setUser(me.user);
      setState('ready');
    } catch (err) {
      setNotice((err as Error).message);
      setState('login');
    }
  }, []);

  useEffect(() => {
    document.title = 'Painel — Beauty and self';
    boot();
  }, [boot]);

  function openTab(t: Tab) {
    setTab(t);
    setMenuOpen(false);
    window.history.replaceState(null, '', t === 'overview' ? PANEL_PATH : `${PANEL_PATH}?aba=${t}`);
    window.scrollTo(0, 0);
  }

  async function logout() {
    await api.logout().catch(() => undefined);
    setUser(null);
    setNotice(null);
    setState('login');
  }

  if (state === 'loading') {
    return (
      <div className="adm-sidebar flex min-h-[100dvh] flex-col items-center justify-center gap-4 text-white">
        <Flower size={64} className="spin-slow" />
        <p className="font-bold text-plum-200">Carregando o painel…</p>
      </div>
    );
  }

  if (state === 'login' || !user) {
    return (
      <main className="adm-sidebar relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-12 text-center">
        <div className="adm-glow pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-orchid-500/40 blur-3xl" />
        <div className="adm-glow pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-plum-500/40 blur-3xl" />
        <div className="adm-rise relative w-full max-w-sm rounded-[32px] bg-white/10 p-8 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl">
          <div className="flex justify-center">
            <Logo size="md" light />
          </div>
          <p className="mt-4 text-xl font-extrabold text-white">Painel empresarial</p>
          <p className="mt-1 text-plum-200">Acesso restrito aos administradores.</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            {notice && (
              <p
                role="alert"
                className="w-full rounded-2xl bg-rose-500/20 px-4 py-3 text-sm font-bold text-rose-100 ring-1 ring-rose-300/40"
              >
                {notice}
              </p>
            )}
            {config?.googleLogin && config.supabaseUrl ? (
              <GoogleButton onClick={() => startGoogleLogin(config.supabaseUrl!, PANEL_PATH)} />
            ) : (
              <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-plum-100">
                O login com Google ainda não está configurado.
              </p>
            )}
            {APP_URL && (
              <a href={APP_URL} className="mt-2 text-sm font-bold text-plum-200 underline">
                Ir para o aplicativo
              </a>
            )}
          </div>
        </div>
      </main>
    );
  }

  const current = TABS.find((t) => t.id === tab)!;
  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();

  const sidebar = (
    <div className="adm-sidebar flex h-full flex-col text-white">
      <div className="flex items-center gap-3 px-6 pb-6 pt-7">
        <Logo size="sm" light />
      </div>
      <p className="px-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-plum-300">Painel empresarial</p>
      <nav className="mt-4 grid gap-1.5 px-3">
        {TABS.map((t, i) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => openTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`adm-rise group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                active
                  ? 'bg-white text-plum-900 shadow-[0_10px_30px_-10px_rgb(192_38_211/0.8)]'
                  : 'text-plum-100 hover:bg-white/10'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition ${
                  active ? 'brand-gradient text-white shadow-lg' : 'bg-white/10 text-plum-200 group-hover:bg-white/20'
                }`}
              >
                <Icon name={t.icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-extrabold">{t.label}</span>
                <span className={`block truncate text-xs ${active ? 'text-plum-500' : 'text-plum-300'}`}>{t.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        {APP_URL && (
          <a
            href={APP_URL}
            className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/15 hover:bg-white/20"
          >
            <Icon name="external" size={18} /> Abrir o app dos salões
          </a>
        )}
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
          {user.picture ? (
            <img
              src={user.picture}
              alt=""
              referrerPolicy="no-referrer"
              className="size-10 rounded-full object-cover ring-2 ring-orchid-400"
            />
          ) : (
            <span className="brand-gradient flex size-10 items-center justify-center rounded-full font-extrabold">
              {initial}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold">{user.name}</span>
            <span className="block truncate text-xs text-plum-300">{user.email}</span>
          </span>
          <button
            type="button"
            onClick={logout}
            aria-label="Sair"
            className="rounded-xl p-2 text-plum-200 hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#f3eeff]">
      {/* Barra lateral fixa (computador) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">{sidebar}</aside>

      {/* Celular: barra de cima + menu que desliza */}
      <header className="adm-sidebar safe-top sticky top-0 z-30 flex h-16 items-center gap-3 px-4 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="rounded-xl p-2 hover:bg-white/10"
        >
          <Icon name="menu" />
        </button>
        <span className="font-extrabold">{current.label}</span>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-plum-950/60 backdrop-blur-sm" />
          <aside
            className="pop-in absolute inset-y-0 left-0 w-[82%] max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </aside>
        </div>
      )}

      <main key={tab} className="adm-rise px-4 pb-16 pt-6 sm:px-6 lg:ml-72 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          {tab === 'overview' && <OverviewTab onOpenTenants={() => openTab('tenants')} userName={user.name} />}
          {tab === 'tenants' && <TenantsTab />}
          {tab === 'rankings' && <RankingsTab />}
          {tab === 'errors' && <ErrorsTab />}
          {tab === 'audit' && <AuditTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
