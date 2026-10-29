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

const TABS: { id: Tab; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'overview', label: 'Visão geral', icon: 'sparkles' },
  { id: 'tenants', label: 'Clientes', icon: 'face' },
  { id: 'rankings', label: 'Rankings', icon: 'scissors' },
  { id: 'errors', label: 'Falhas', icon: 'alert' },
  { id: 'audit', label: 'Registro', icon: 'lock' },
  { id: 'settings', label: 'Ajustes', icon: 'palette' },
];

export default function AdminApp() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<'loading' | 'login' | 'ready'>('loading');
  const [notice, setNotice] = useState<string | null>(null);
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
      <div className="app-bg flex min-h-[100dvh] flex-col items-center justify-center gap-4">
        <Flower size={56} className="spin-slow" />
        <p className="font-bold text-plum-700">Carregando o painel…</p>
      </div>
    );
  }

  if (state === 'login' || !user) {
    return (
      <main className="app-bg flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 text-center">
        <Logo size="lg" />
        <p className="mt-4 text-xl font-extrabold text-plum-900">Painel empresarial</p>
        <p className="mt-1 text-ink-soft">Acesso restrito aos administradores.</p>
        <div className="mt-8 flex w-full flex-col items-center gap-3">
          {notice && (
            <p
              role="alert"
              className="w-full max-w-[360px] rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {notice}
            </p>
          )}
          {config?.googleLogin && config.supabaseUrl ? (
            <GoogleButton onClick={() => startGoogleLogin(config.supabaseUrl!, PANEL_PATH)} />
          ) : (
            <p className="max-w-[360px] rounded-2xl bg-white px-4 py-3 text-sm text-ink-soft ring-1 ring-plum-200">
              O login com Google ainda não está configurado no servidor.
            </p>
          )}
          {APP_URL && (
            <a href={APP_URL} className="mt-2 text-sm font-bold text-plum-700 underline">
              Ir para o aplicativo
            </a>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-plum-50/60">
      <header className="safe-top sticky top-0 z-30 border-b border-plum-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Logo size="sm" />
          <span className="hidden rounded-full bg-plum-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-plum-800 sm:inline">
            Painel empresarial
          </span>
          <span className="flex-1" />
          <span className="hidden truncate text-sm font-bold text-ink-soft md:inline">{user.email}</span>
          {APP_URL && (
            <a
              href={APP_URL}
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold text-plum-700 hover:bg-plum-50"
            >
              Abrir app
            </a>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-plum-700 hover:bg-plum-50"
          >
            <Icon name="logout" size={18} /> Sair
          </button>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => openTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold transition ${
                tab === t.id ? 'brand-gradient text-white shadow-soft' : 'text-plum-700 hover:bg-plum-100'
              }`}
            >
              <Icon name={t.icon} size={18} /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
        {tab === 'overview' && <OverviewTab onOpenTenants={() => openTab('tenants')} />}
        {tab === 'tenants' && <TenantsTab />}
        {tab === 'rankings' && <RankingsTab />}
        {tab === 'errors' && <ErrorsTab />}
        {tab === 'audit' && <AuditTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
