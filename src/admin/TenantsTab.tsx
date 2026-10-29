import { useEffect, useMemo, useState } from 'react';
import { Button, Icon } from '../components/ui';
import { postJson } from '../lib/api';
import { Bars3D, CountUp, Ring3D } from './charts';
import { Card, Loading, PageTitle, useAdminData } from './shared';
import {
  brl,
  colorName,
  colorPhoto,
  cutName,
  cutPhoto,
  date,
  int,
  MODE_LABEL,
  monthLabel,
  pct,
  STATUS,
  type Overview,
  type Tenant,
} from './format';

interface Detail {
  tenant: Tenant;
  months: { month: string; images: number; errors: number; cost_usd: number }[];
  days: { day: string; images: number }[];
  by_user: { email: string; images: number; total: number; errors: number; last_at: string | null }[];
  top_cuts: { id: string; n: number }[];
  top_colors: { id: string; n: number }[];
  recent: {
    at: string;
    email: string;
    mode: string;
    cut_id: string | null;
    color_id: string | null;
    status: string;
    error: string | null;
    duration_ms: number | null;
  }[];
}

/** Anel pequeno de uso do plano (lista de clientes) */
function MiniRing({ used, limit }: { used: number; limit: number }) {
  const p = Math.min(1, used / Math.max(1, limit));
  const r = 22;
  const c = 2 * Math.PI * r;
  const color = p >= 1 ? '#e11d48' : p > 0.8 ? '#f59e0b' : '#7c3aed';
  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 56 56" className="size-16 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#ede9fe" strokeWidth="7" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`}
          className="adm-draw"
          style={{ ['--len' as string]: c * p }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-plum-900">
        {pct(p)}
      </span>
    </div>
  );
}

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'alert', label: 'Perto do limite' },
  { id: 'blocked', label: 'Bloqueados / atrasados' },
] as const;

export function TenantsTab() {
  const { data, error, loading, reload, setData } = useAdminData<Tenant[]>('/api/admin/tenants');
  const settings = useAdminData<Overview>('/api/admin/overview');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [editing, setEditing] = useState<Tenant | 'new' | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((t) => {
      const match =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.emails.some((e) => e.email.includes(q)) ||
        (t.city || '').toLowerCase().includes(q);
      const p = t.used_month / Math.max(1, t.monthly_limit);
      const f =
        filter === 'all' ||
        (filter === 'active' && t.effective_status === 'active') ||
        (filter === 'alert' && p >= 0.8) ||
        (filter === 'blocked' && (t.effective_status === 'blocked' || t.effective_status === 'overdue'));
      return match && f;
    });
  }, [data, query, filter]);

  const fx = settings.data?.usd_brl ?? 5.6;
  const costBrl = settings.data ? settings.data.cost_per_image_usd * fx : 0.056;

  function saved(t: Tenant) {
    setData((prev) => {
      const rest = (prev || []).filter((x) => x.id !== t.id);
      return t.status === 'deleted' ? rest : [t, ...rest];
    });
  }

  if (loading && !data) return <Loading />;
  if (error || !data) return <Loading error={error} onRetry={reload} />;

  const totals = data.reduce(
    (acc, t) => ({
      mrr: acc.mrr + (t.effective_status === 'active' ? Number(t.price_brl) : 0),
      images: acc.images + t.used_month,
    }),
    { mrr: 0, images: 0 },
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageTitle
        title="Clientes"
        subtitle="Cada salão, seu plano e quantas imagens cada conta Google gerou."
        right={
          <Button icon="sparkles" onClick={() => setEditing('new')}>
            Novo cliente
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Salões cadastrados', v: data.length, f: int, icon: 'users' as const },
          { label: 'Faturamento mensal', v: totals.mrr, f: brl, icon: 'money' as const },
          { label: 'Imagens no mês (todos)', v: totals.images, f: int, icon: 'chart' as const },
        ].map((k, i) => (
          <div
            key={k.label}
            className="adm-card adm-rise flex items-center gap-4 rounded-[24px] p-4 ring-1 ring-plum-100"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="brand-gradient flex size-12 items-center justify-center rounded-2xl text-white shadow-lg">
              <Icon name={k.icon} size={22} />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">{k.label}</p>
              <p className="text-2xl font-extrabold text-plum-950">
                <CountUp value={k.v} format={k.f} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="adm-card flex min-h-12 min-w-[240px] flex-1 items-center gap-3 rounded-2xl px-4 ring-1 ring-plum-100">
          <Icon name="search" className="text-plum-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por salão, e-mail ou cidade"
            className="min-w-0 flex-1 appearance-none bg-transparent font-semibold text-plum-950 placeholder:text-ink-soft/70 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-white/70 p-1.5 ring-1 ring-plum-100">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${filter === f.id ? 'brand-gradient text-white shadow' : 'text-plum-700 hover:bg-plum-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="brand-gradient flex size-16 items-center justify-center rounded-3xl text-white shadow-lift">
              <Icon name="users" size={30} />
            </span>
            <p className="max-w-sm font-bold text-plum-900">
              {data.length
                ? 'Nenhum cliente com esse filtro.'
                : 'Nenhum cliente ainda. Cadastre o primeiro salão e libere as contas Google dele.'}
            </p>
            {!data.length && (
              <Button icon="sparkles" onClick={() => setEditing('new')}>
                Cadastrar primeiro cliente
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((t, i) => {
            const st = STATUS[t.effective_status];
            const cost = t.used_month * costBrl;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setOpenId(t.id)}
                className="adm-card adm-rise group relative overflow-hidden rounded-[28px] p-5 text-left ring-1 ring-plum-100 transition hover:-translate-y-1 hover:ring-plum-300"
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-orchid-400/10 blur-2xl transition group-hover:bg-orchid-400/25" />
                <div className="flex items-center gap-4">
                  <MiniRing used={t.used_month} limit={t.monthly_limit} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-lg font-extrabold text-plum-950">{t.name}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="truncate text-sm text-ink-soft">{t.emails.map((e) => e.email).join(', ')}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-plum-50 px-2 py-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">No mês</p>
                    <p className="font-extrabold text-plum-950">
                      {int(t.used_month)}
                      <span className="text-xs font-bold text-ink-soft">/{int(t.monthly_limit)}</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-plum-50 px-2 py-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">Valor</p>
                    <p className="font-extrabold text-plum-950">{brl(t.price_brl)}</p>
                  </div>
                  <div className="rounded-2xl bg-plum-50 px-2 py-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">Margem</p>
                    <p className={`font-extrabold ${t.price_brl - cost >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {brl(t.price_brl - cost)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex items-center justify-between text-xs font-bold text-ink-soft">
                  <span>{int(t.used_total ?? 0)} imagens desde o início</span>
                  <span className="text-plum-600 group-hover:underline">Ver ficha →</span>
                </p>
              </button>
            );
          })}
        </div>
      )}

      {editing && (
        <TenantForm
          tenant={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(t) => {
            saved(t);
            setEditing(null);
            setOpenId(t.id);
          }}
        />
      )}
      {openId && !editing && (
        <TenantDetail
          id={openId}
          costBrl={costBrl}
          fx={fx}
          onClose={() => setOpenId(null)}
          onEdit={(t) => setEditing(t)}
          onChanged={(t) => {
            saved(t);
            if (t.status === 'deleted') setOpenId(null);
          }}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  // Tecla Esc fecha a janela
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-plum-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="pop-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-plum-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-2 text-plum-700 hover:bg-plum-50"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const field =
  'mt-1 min-h-12 w-full rounded-xl bg-plum-50/60 px-3 font-semibold text-plum-950 ring-1 ring-plum-200 focus:outline-none focus:ring-2 focus:ring-plum-400';

function TenantForm({
  tenant,
  onClose,
  onSaved,
}: {
  tenant: Tenant | null;
  onClose: () => void;
  onSaved: (t: Tenant) => void;
}) {
  const [f, setF] = useState({
    name: tenant?.name || '',
    owner_name: tenant?.owner_name || '',
    phone: tenant?.phone || '',
    city: tenant?.city || '',
    notes: tenant?.notes || '',
    emails: tenant?.emails.map((e) => e.email).join('\n') || '',
    plan: tenant?.plan || '500',
    monthly_limit: String(tenant?.monthly_limit ?? 2000),
    price_brl: String(tenant?.price_brl ?? ''),
    due_day: String(tenant?.due_day ?? ''),
    paid_until: tenant?.paid_until || '',
    auto_block: tenant?.auto_block ?? false,
    grace_days: String(tenant?.grace_days ?? 5),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF((p) => ({
        ...p,
        [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value,
      }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const t = await postJson<Tenant>('/api/admin/tenants', {
        ...f,
        id: tenant?.id,
        emails: f.emails.split(/[\s,;]+/).filter(Boolean),
      });
      onSaved(t);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={tenant ? `Editar ${tenant.name}` : 'Novo cliente'} onClose={onClose}>
      <form onSubmit={save} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="font-bold text-plum-900 sm:col-span-2">
            Nome do salão *
            <input required value={f.name} onChange={set('name')} className={field} maxLength={120} />
          </label>
          <label className="font-bold text-plum-900">
            Responsável
            <input value={f.owner_name} onChange={set('owner_name')} className={field} maxLength={120} />
          </label>
          <label className="font-bold text-plum-900">
            WhatsApp / telefone
            <input value={f.phone} onChange={set('phone')} className={field} maxLength={40} inputMode="tel" />
          </label>
          <label className="font-bold text-plum-900 sm:col-span-2">
            Cidade
            <input value={f.city} onChange={set('city')} className={field} maxLength={80} />
          </label>
        </div>

        <label className="font-bold text-plum-900">
          Contas Google liberadas * <span className="font-semibold text-ink-soft">(um e-mail por linha)</span>
          <textarea
            required
            value={f.emails}
            onChange={set('emails')}
            rows={3}
            placeholder="salao@gmail.com"
            className={`${field} py-2`}
          />
          <span className="mt-1 block text-sm font-semibold text-ink-soft">
            Só esses e-mails conseguem entrar no app. Tirar um e-mail daqui bloqueia o acesso dele na hora.
          </span>
        </label>

        <fieldset className="grid gap-2">
          <legend className="font-bold text-plum-900">Plano (imagens por mês) *</legend>
          <div className="grid grid-cols-3 gap-2">
            {(['500', '1000', 'custom'] as const).map((p) => (
              <label
                key={p}
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl text-center font-extrabold ring-1 ${
                  f.plan === p ? 'brand-gradient text-white ring-transparent' : 'bg-white text-plum-800 ring-plum-200'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p}
                  checked={f.plan === p}
                  onChange={set('plan')}
                  className="sr-only"
                />
                {p === 'custom' ? 'Personalizado' : `${p} fotos`}
              </label>
            ))}
          </div>
          {f.plan === 'custom' && (
            <label className="font-bold text-plum-900">
              Limite de imagens por mês
              <input
                type="number"
                min={0}
                required
                value={f.monthly_limit}
                onChange={set('monthly_limit')}
                className={field}
              />
            </label>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="font-bold text-plum-900">
            Valor mensal (R$)
            <input
              type="number"
              min={0}
              step="0.01"
              value={f.price_brl}
              onChange={set('price_brl')}
              className={field}
            />
          </label>
          <label className="font-bold text-plum-900">
            Dia do vencimento
            <input type="number" min={1} max={28} value={f.due_day} onChange={set('due_day')} className={field} />
          </label>
          <label className="font-bold text-plum-900">
            Pago até
            <input type="date" value={f.paid_until} onChange={set('paid_until')} className={field} />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-plum-50 p-3 font-bold text-plum-900">
          <input
            type="checkbox"
            checked={f.auto_block}
            onChange={set('auto_block')}
            className="mt-1 size-5 accent-plum-700"
          />
          <span>
            Bloquear automaticamente se não pagar
            <span className="block text-sm font-semibold text-ink-soft">
              O app para de gerar imagens depois de “Pago até” +
              <input
                type="number"
                min={0}
                max={60}
                value={f.grace_days}
                onChange={set('grace_days')}
                className="mx-1 w-14 rounded-lg bg-white px-1 text-center ring-1 ring-plum-200"
              />
              dias de tolerância. Ao registrar o pagamento, volta a funcionar.
            </span>
          </span>
        </label>

        <label className="font-bold text-plum-900">
          Observações
          <textarea value={f.notes} onChange={set('notes')} rows={2} className={`${field} py-2`} maxLength={1000} />
        </label>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 font-bold text-red-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon="check" disabled={busy}>
            {busy ? 'Salvando…' : tenant ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TenantDetail({
  id,
  costBrl,
  fx,
  onClose,
  onEdit,
  onChanged,
}: {
  id: string;
  costBrl: number;
  fx: number;
  onClose: () => void;
  onEdit: (t: Tenant) => void;
  onChanged: (t: Tenant) => void;
}) {
  const { data, error, loading, reload, setData } = useAdminData<Detail>(`/api/admin/tenants/${id}`);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function act(path: string, body: unknown) {
    setBusy(true);
    setActionError(null);
    try {
      const t = await postJson<Tenant>(path, body);
      onChanged(t);
      setData((d) => (d ? { ...d, tenant: t } : d));
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const t = data?.tenant;
  const st = t ? STATUS[t.effective_status] : null;
  const usage = t ? t.used_month / Math.max(1, t.monthly_limit) : 0;
  const days = (() => {
    const byDay = new Map((data?.days || []).map((d) => [d.day, d.images]));
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86400000);
      const key = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      return { label: key.slice(8), value: byDay.get(key) || 0 };
    });
  })();
  const monthCost =
    data?.months.find((m) => m.month === new Date().toISOString().slice(0, 7))?.cost_usd ??
    (t ? (t.used_month * costBrl) / fx : 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-plum-950/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t?.name || 'Cliente'}
        onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full max-w-3xl overflow-y-auto bg-[#f3eeff] shadow-2xl"
        style={{ animation: 'adm-rise .45s cubic-bezier(.2,.8,.2,1) both' }}
      >
        {!t ? (
          <div className="p-8">
            <Loading error={loading ? null : error} onRetry={reload} />
          </div>
        ) : (
          <>
            {/* Cabeçalho da ficha */}
            <header className="adm-hero relative overflow-hidden px-6 pb-24 pt-6 text-white sm:px-8">
              <div className="adm-glow pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-orchid-400/40 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${st!.cls}`}>{st!.label}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="rounded-full bg-white/15 p-2 hover:bg-white/25"
                >
                  <Icon name="close" />
                </button>
              </div>
              <div className="relative mt-4 flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-3xl bg-white/20 text-3xl font-extrabold ring-1 ring-white/30 backdrop-blur">
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-3xl font-extrabold tracking-tight">{t.name}</h2>
                  <p className="text-plum-100">
                    {[t.owner_name, t.city, t.phone].filter(Boolean).join(' · ') ||
                      'Cliente desde ' + date(t.created_at)}
                  </p>
                </div>
              </div>
              {t.status_reason && t.effective_status !== 'active' && (
                <p className="relative mt-3 inline-block rounded-xl bg-white/15 px-3 py-1.5 text-sm font-bold">
                  Motivo: {t.status_reason}
                </p>
              )}
            </header>

            <div className="relative z-10 -mt-16 grid grid-cols-1 gap-5 px-4 pb-10 sm:px-8">
              {/* Uso do plano + números principais */}
              <section className="adm-card adm-rise grid items-center gap-6 rounded-[28px] p-5 ring-1 ring-plum-100 sm:grid-cols-[auto_1fr]">
                <Ring3D
                  value={usage}
                  size={170}
                  label="Plano do mês"
                  sub={`${int(t.used_month)} de ${int(t.monthly_limit)}`}
                  danger={usage >= 1}
                />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Imagens no mês', v: t.used_month, f: int },
                    { label: 'Desde o início', v: t.used_total ?? 0, f: int },
                    { label: 'Valor do plano', v: Number(t.price_brl), f: brl },
                    { label: 'Margem no mês', v: Number(t.price_brl) - monthCost * fx, f: brl },
                  ].map((k) => (
                    <div key={k.label} className="rounded-2xl bg-plum-50 px-4 py-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">{k.label}</p>
                      <p className="text-2xl font-extrabold text-plum-950">
                        <CountUp value={k.v} format={k.f} />
                      </p>
                    </div>
                  ))}
                  <p className="col-span-2 text-sm text-ink-soft">
                    Plano{' '}
                    <b className="text-plum-900">
                      {t.plan === 'custom' ? `personalizado (${int(t.monthly_limit)})` : `${t.plan} imagens`}
                    </b>{' '}
                    · custo da IA no mês <b className="text-plum-900">{brl(monthCost * fx)}</b> · pago até{' '}
                    <b className="text-plum-900">{date(t.paid_until)}</b>
                    {t.auto_block && <> · bloqueio automático após {t.grace_days} dias</>}
                  </p>
                </div>
              </section>

              {/* Ações */}
              <section
                className="adm-card adm-rise rounded-[28px] p-4 ring-1 ring-plum-100"
                style={{ animationDelay: '60ms' }}
              >
                {actionError && (
                  <p className="mb-3 rounded-xl bg-rose-50 px-4 py-3 font-bold text-rose-700">{actionError}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="md" icon="palette" variant="secondary" onClick={() => onEdit(t)} disabled={busy}>
                    Editar dados e plano
                  </Button>
                  <Button
                    size="md"
                    icon="money"
                    variant="secondary"
                    onClick={() => act(`/api/admin/tenants/${t.id}/paid`, {})}
                    disabled={busy}
                  >
                    Registrar pagamento (+1 mês)
                  </Button>
                  {t.status === 'active' ? (
                    <Button
                      size="md"
                      icon="lock"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => {
                        const reason = window.prompt(
                          'Motivo do bloqueio (aparece só aqui no painel):',
                          'Pagamento pendente',
                        );
                        if (reason !== null) act(`/api/admin/tenants/${t.id}/status`, { status: 'blocked', reason });
                      }}
                    >
                      Bloquear acesso
                    </Button>
                  ) : (
                    <Button
                      size="md"
                      icon="check"
                      disabled={busy}
                      onClick={() => act(`/api/admin/tenants/${t.id}/status`, { status: 'active' })}
                    >
                      Desbloquear acesso
                    </Button>
                  )}
                  <Button
                    size="md"
                    icon="close"
                    variant="ghost"
                    disabled={busy}
                    className="text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      const typed = window.prompt(
                        `Apagar "${t.name}"? As contas Google dele não vão mais conseguir entrar. O histórico de uso continua nos relatórios.\n\nPara confirmar, digite o nome do salão:`,
                      );
                      if (typed !== null && typed.trim().toLowerCase() === t.name.trim().toLowerCase()) {
                        act(`/api/admin/tenants/${t.id}/status`, { status: 'deleted', reason: 'Apagado no painel' });
                      } else if (typed !== null) {
                        setActionError('Nome diferente: o cliente não foi apagado.');
                      }
                    }}
                  >
                    Apagar cliente
                  </Button>
                </div>
              </section>

              {/* Rastreio por conta Google */}
              <Card
                title="Imagens por conta Google"
                subtitle="Exatamente quantas imagens cada e-mail liberado gerou"
                delay={100}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="text-left text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                        <th className="pb-2">Conta</th>
                        <th className="pb-2 text-right">No mês</th>
                        <th className="pb-2 text-right">Desde o início</th>
                        <th className="pb-2 text-right">Falhas</th>
                        <th className="pb-2 text-right">Última imagem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...t.emails.map((e) => ({ email: e.email, last_login_at: e.last_login_at, active: true })),
                        ...data.by_user
                          .filter((u) => !t.emails.some((e) => e.email === u.email))
                          .map((u) => ({ email: u.email, last_login_at: null, active: false })),
                      ].map((e) => {
                        const u = data.by_user.find((x) => x.email === e.email);
                        return (
                          <tr key={e.email} className="border-t border-plum-100">
                            <td className="py-3">
                              <span className="flex items-center gap-2">
                                <span
                                  className={`size-2.5 rounded-full ${e.active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                />
                                <b className="text-plum-950">{e.email}</b>
                              </span>
                              <span className="ml-4 block text-xs text-ink-soft">
                                {e.active
                                  ? `último acesso ${date(e.last_login_at, true)}`
                                  : 'conta removida (histórico)'}
                              </span>
                            </td>
                            <td className="py-3 text-right text-lg font-extrabold text-plum-900">
                              {int(u?.images || 0)}
                            </td>
                            <td className="py-3 text-right font-extrabold text-plum-900">{int(u?.total || 0)}</td>
                            <td
                              className={`py-3 text-right font-bold ${u?.errors ? 'text-rose-600' : 'text-ink-soft'}`}
                            >
                              {int(u?.errors || 0)}
                            </td>
                            <td className="py-3 text-right text-ink-soft">{date(u?.last_at, true)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Imagens por dia" subtitle="Últimos 30 dias" delay={140}>
                <Bars3D items={days} height={210} labelEvery={3} showValues={false} />
              </Card>

              {data.months.length > 0 && (
                <Card title="Histórico mensal" subtitle="Imagens, custo da IA e margem" delay={180}>
                  <Bars3D
                    items={data.months
                      .slice()
                      .reverse()
                      .map((m) => ({ label: monthLabel(m.month), value: m.images, extra: m.errors }))}
                    height={200}
                  />
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[460px] text-sm">
                      <thead>
                        <tr className="text-left text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                          <th className="pb-2">Mês</th>
                          <th className="pb-2 text-right">Imagens</th>
                          <th className="pb-2 text-right">Falhas</th>
                          <th className="pb-2 text-right">Custo IA</th>
                          <th className="pb-2 text-right">Margem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.months.map((m) => (
                          <tr key={m.month} className="border-t border-plum-100">
                            <td className="py-2 font-bold">{monthLabel(m.month)}</td>
                            <td className="py-2 text-right font-extrabold">
                              {int(m.images)} / {int(t.monthly_limit)}
                            </td>
                            <td className="py-2 text-right">{int(m.errors)}</td>
                            <td className="py-2 text-right">{brl(m.cost_usd * fx)}</td>
                            <td className="py-2 text-right font-extrabold text-emerald-700">
                              {brl(Number(t.price_brl) - m.cost_usd * fx)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {(data.top_cuts.length > 0 || data.top_colors.length > 0) && (
                <Card title="Preferidos deste salão" delay={200}>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[
                      {
                        title: 'Cortes',
                        items: data.top_cuts.map((c) => ({
                          id: c.id,
                          n: c.n,
                          name: cutName(c.id),
                          photo: cutPhoto(c.id),
                        })),
                      },
                      {
                        title: 'Cores',
                        items: data.top_colors.map((c) => ({
                          id: c.id,
                          n: c.n,
                          name: colorName(c.id),
                          photo: colorPhoto(c.id),
                        })),
                      },
                    ].map((g) => (
                      <div key={g.title}>
                        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-ink-soft">{g.title}</p>
                        {g.items.length === 0 ? (
                          <p className="text-sm text-ink-soft">—</p>
                        ) : (
                          <ul className="grid gap-2">
                            {g.items.map((it) => (
                              <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-plum-50 p-2">
                                {it.photo ? (
                                  <img src={it.photo} alt="" className="size-10 rounded-xl object-cover" />
                                ) : (
                                  <span className="size-10 rounded-xl bg-plum-100" />
                                )}
                                <span className="flex-1 truncate text-sm font-bold text-plum-950">{it.name}</span>
                                <b className="pr-2 text-plum-700">{it.n}</b>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card title="Últimas imagens" subtitle="As 20 mais recentes" delay={220}>
                {data.recent.length === 0 ? (
                  <p className="text-sm text-ink-soft">Nenhuma imagem ainda.</p>
                ) : (
                  <ul className="grid gap-2 text-sm">
                    {data.recent.slice(0, 20).map((g, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-2xl bg-plum-50/80 p-2">
                        {g.cut_id && cutPhoto(g.cut_id) ? (
                          <img src={cutPhoto(g.cut_id)} alt="" className="size-10 rounded-xl object-cover" />
                        ) : g.color_id && colorPhoto(g.color_id) ? (
                          <img src={colorPhoto(g.color_id)} alt="" className="size-10 rounded-xl object-cover" />
                        ) : (
                          <span className="size-10 rounded-xl bg-plum-100" />
                        )}
                        <span className="min-w-0 flex-1">
                          <b className="block truncate text-plum-950">
                            {[g.cut_id && cutName(g.cut_id), g.color_id && colorName(g.color_id)]
                              .filter(Boolean)
                              .join(' + ')}
                          </b>
                          <span className="block truncate text-xs text-ink-soft">
                            {MODE_LABEL[g.mode]} · {g.email} · {date(g.at, true)}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${
                            g.status === 'error'
                              ? 'bg-rose-100 text-rose-700'
                              : g.status === 'canceled'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}
                          title={g.error || ''}
                        >
                          {g.status === 'error' ? 'falhou' : g.status === 'canceled' ? 'cancelada' : 'ok'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {t.notes && (
                <Card title="Observações" delay={240}>
                  <p className="whitespace-pre-wrap text-sm text-plum-900">{t.notes}</p>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
