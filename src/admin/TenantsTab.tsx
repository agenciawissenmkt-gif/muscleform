import { useEffect, useMemo, useState } from 'react';
import { Button, Icon } from '../components/ui';
import { postJson } from '../lib/api';
import { Card, Loading, useAdminData } from './shared';
import {
  brl,
  colorName,
  cutName,
  date,
  int,
  MODE_LABEL,
  monthLabel,
  STATUS,
  type Overview,
  type Tenant,
} from './format';

interface Detail {
  tenant: Tenant;
  months: { month: string; images: number; errors: number; cost_usd: number }[];
  by_user: { email: string; images: number }[];
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

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const p = limit ? Math.min(1, used / limit) : 1;
  return (
    <div>
      <div className="h-2.5 overflow-hidden rounded-full bg-plum-100">
        <div
          className={`h-full rounded-full ${p >= 1 ? 'bg-red-500' : p > 0.8 ? 'bg-amber-500' : 'brand-gradient'}`}
          style={{ width: `${p * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs font-bold text-ink-soft">
        {int(used)} de {int(limit)} imagens no mês
      </p>
    </div>
  );
}

export function TenantsTab() {
  const { data, error, loading, reload, setData } = useAdminData<Tenant[]>('/api/admin/tenants');
  const settings = useAdminData<Overview>('/api/admin/overview');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Tenant | 'new' | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.emails.some((e) => e.email.includes(q)) ||
        (t.city || '').toLowerCase().includes(q),
    );
  }, [data, query]);

  const costBrl = settings.data ? settings.data.cost_per_image_usd * settings.data.usd_brl : 0.056;

  function saved(t: Tenant) {
    setData((prev) => {
      const rest = (prev || []).filter((x) => x.id !== t.id);
      return t.status === 'deleted' ? rest : [t, ...rest];
    });
  }

  if (loading && !data) return <Loading />;
  if (error || !data) return <Loading error={error} onRetry={reload} />;

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-plum-950">Clientes</h1>
          <p className="text-ink-soft">
            {int(data.length)} {data.length === 1 ? 'salão cadastrado' : 'salões cadastrados'}. Só os e-mails Google
            liberados aqui conseguem entrar no app.
          </p>
        </div>
        <Button icon="sparkles" onClick={() => setEditing('new')}>
          Novo cliente
        </Button>
      </div>

      <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-soft ring-1 ring-plum-100">
        <Icon name="search" className="text-plum-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por salão, e-mail ou cidade"
          className="min-w-0 flex-1 appearance-none bg-transparent font-semibold text-plum-950 placeholder:text-ink-soft/70 focus:outline-none"
        />
      </label>

      {list.length === 0 ? (
        <Card>
          <p className="text-ink-soft">
            {data.length
              ? 'Nenhum cliente encontrado.'
              : 'Nenhum cliente ainda. Toque em “Novo cliente” para cadastrar o primeiro salão.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => {
            const st = STATUS[t.effective_status];
            const cost = t.used_month * costBrl;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setOpenId(t.id)}
                className="grid gap-3 rounded-3xl bg-white p-4 text-left shadow-soft ring-1 ring-plum-100 transition hover:ring-plum-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-extrabold text-plum-950">{t.name}</p>
                    <p className="truncate text-sm text-ink-soft">{t.emails.map((e) => e.email).join(', ')}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <UsageBar used={t.used_month} limit={t.monthly_limit} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span>
                    Plano <b>{t.plan === 'custom' ? `${int(t.monthly_limit)} (personalizado)` : t.plan}</b>
                  </span>
                  <span>
                    <b>{brl(t.price_brl)}</b>/mês
                  </span>
                  <span className={t.price_brl - cost >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                    margem <b>{brl(t.price_brl - cost)}</b>
                  </span>
                  {t.paid_until && <span className="text-ink-soft">pago até {date(t.paid_until)}</span>}
                </div>
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
          fx={settings.data?.usd_brl ?? 5.6}
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-plum-950/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="pop-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-lift sm:rounded-3xl"
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
  return (
    <Modal title={t?.name || 'Cliente'} onClose={onClose}>
      {!t ? (
        <Loading error={loading ? null : error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${STATUS[t.effective_status].cls}`}>
              {STATUS[t.effective_status].label}
            </span>
            {t.status_reason && <span className="text-sm text-ink-soft">Motivo: {t.status_reason}</span>}
          </div>

          <UsageBar used={t.used_month} limit={t.monthly_limit} />

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Info
              label="Plano"
              value={t.plan === 'custom' ? `${int(t.monthly_limit)} imagens (personalizado)` : `${t.plan} imagens`}
            />
            <Info label="Valor mensal" value={brl(t.price_brl)} />
            <Info label="Custo da IA no mês" value={brl(t.used_month * costBrl)} />
            <Info label="Margem no mês" value={brl(t.price_brl - t.used_month * costBrl)} />
            <Info label="Pago até" value={date(t.paid_until)} />
            <Info label="Vencimento" value={t.due_day ? `dia ${t.due_day}` : '—'} />
            <Info
              label="Bloqueio automático"
              value={t.auto_block ? `sim (${t.grace_days} dias de tolerância)` : 'não'}
            />
            <Info label="Responsável" value={t.owner_name || '—'} />
            <Info label="Telefone" value={t.phone || '—'} />
            <Info label="Cidade" value={t.city || '—'} />
            <Info label="Cliente desde" value={date(t.created_at)} />
          </div>

          <div>
            <h3 className="mb-2 font-extrabold text-plum-950">Contas Google liberadas</h3>
            <ul className="grid gap-1.5">
              {t.emails.map((e) => {
                const n = data.by_user.find((u) => u.email === e.email)?.images || 0;
                return (
                  <li
                    key={e.email}
                    className="flex flex-wrap justify-between gap-2 rounded-xl bg-plum-50 px-3 py-2 text-sm"
                  >
                    <b className="text-plum-900">{e.email}</b>
                    <span className="text-ink-soft">
                      {int(n)} imagens no mês · último acesso {date(e.last_login_at, true)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {t.notes && <p className="rounded-xl bg-plum-50 px-3 py-2 text-sm text-plum-900">{t.notes}</p>}

          {actionError && <p className="rounded-xl bg-red-50 px-4 py-3 font-bold text-red-700">{actionError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button size="md" icon="palette" variant="secondary" onClick={() => onEdit(t)} disabled={busy}>
              Editar
            </Button>
            <Button
              size="md"
              icon="check"
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
                  const reason = window.prompt('Motivo do bloqueio (aparece só aqui no painel):', 'Pagamento pendente');
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
                Desbloquear
              </Button>
            )}
            <Button
              size="md"
              icon="close"
              variant="ghost"
              disabled={busy}
              className="text-red-700 hover:bg-red-50"
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

          <div>
            <h3 className="mb-2 font-extrabold text-plum-950">Uso por mês</h3>
            {data.months.length === 0 ? (
              <p className="text-sm text-ink-soft">Ainda não gerou imagens.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-soft">
                    <th className="py-1">Mês</th>
                    <th>Imagens</th>
                    <th>Falhas</th>
                    <th>Custo IA</th>
                    <th>Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.months.map((m) => (
                    <tr key={m.month} className="border-t border-plum-100">
                      <td className="py-1.5 font-bold">{monthLabel(m.month)}</td>
                      <td>
                        {int(m.images)} / {int(t.monthly_limit)}
                      </td>
                      <td>{int(m.errors)}</td>
                      <td>{brl(m.cost_usd * fx)}</td>
                      <td>{brl(t.price_brl - m.cost_usd * fx)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-extrabold text-plum-950">Últimas imagens</h3>
            {data.recent.length === 0 ? (
              <p className="text-sm text-ink-soft">Nenhuma ainda.</p>
            ) : (
              <ul className="grid gap-1.5 text-sm">
                {data.recent.slice(0, 20).map((g, i) => (
                  <li key={i} className="flex flex-wrap justify-between gap-2 rounded-xl bg-plum-50/70 px-3 py-2">
                    <span>
                      <b>{MODE_LABEL[g.mode]}</b>:{' '}
                      {[g.cut_id && cutName(g.cut_id), g.color_id && colorName(g.color_id)].filter(Boolean).join(' + ')}
                    </span>
                    <span className={g.status === 'error' ? 'font-bold text-red-700' : 'text-ink-soft'}>
                      {g.status === 'error' ? `falhou: ${g.error || ''}` : g.status === 'canceled' ? 'cancelada' : 'ok'}{' '}
                      · {date(g.at, true)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-plum-50/70 px-3 py-2">
      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="font-bold text-plum-950">{value}</p>
    </div>
  );
}
