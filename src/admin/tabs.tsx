import { useState } from 'react';
import { Button, Icon } from '../components/ui';
import { postJson } from '../lib/api';
import { Card, Loading, PageTitle, useAdminData } from './shared';
import { CountUp, Podium } from './charts';
import {
  ACTION_LABEL,
  colorName,
  colorPhoto,
  cutName,
  cutPhoto,
  date,
  int,
  LOGIN_LABEL,
  MODE_LABEL,
  type Overview,
  type Tenant,
} from './format';

interface Rankings {
  cuts: { id: string; n: number }[];
  colors: { id: string; n: number }[];
  combos: { cut: string; color: string; n: number }[];
  modes: Record<string, number>;
  tenants: { id: string; name: string; n: number }[];
}

function RankList({ items }: { items: { key: string; label: string; n: number; photo?: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.n));
  if (!items.length) return <p className="text-sm text-ink-soft">Sem dados no período.</p>;
  return (
    <ol className="grid gap-2">
      {items.map((it, i) => (
        <li key={it.key} className="grid grid-cols-[28px_40px_1fr] items-center gap-3">
          <span className="text-center font-extrabold text-plum-500">{i + 1}</span>
          {it.photo ? (
            <img src={it.photo} alt="" loading="lazy" className="size-10 rounded-xl object-cover" />
          ) : (
            <span className="size-10 rounded-xl bg-plum-100" />
          )}
          <div className="min-w-0">
            <div className="flex justify-between gap-2 text-sm">
              <span className="truncate font-bold text-plum-950">{it.label}</span>
              <span className="shrink-0 font-extrabold text-plum-700">{int(it.n)}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-plum-100">
              <div className="brand-gradient h-full rounded-full" style={{ width: `${(it.n / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RankingsTab() {
  const [days, setDays] = useState(30);
  const [tenant, setTenant] = useState('');
  const tenants = useAdminData<Tenant[]>('/api/admin/tenants');
  const { data, error, loading, reload } = useAdminData<Rankings>(
    `/api/admin/rankings?days=${days}${tenant ? `&tenant=${tenant}` : ''}`,
  );

  const sel = 'adm-card min-h-11 rounded-2xl px-3 font-bold text-plum-900 ring-1 ring-plum-100';
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageTitle
        title="Grand Prix"
        subtitle="Os campeões de uso: cortes, cores, combinações e salões."
        right={
          <div className="flex flex-wrap gap-2">
            <select value={tenant} onChange={(e) => setTenant(e.target.value)} className={sel}>
              <option value="">Todos os salões</option>
              {(tenants.data || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={sel}>
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
              <option value={365}>Último ano</option>
            </select>
          </div>
        }
      />
      {loading && !data ? (
        <Loading />
      ) : error || !data ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <>
          <section className="adm-hero adm-rise relative overflow-hidden rounded-[32px] p-6 text-white sm:p-8">
            <div className="adm-glow pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-orchid-400/40 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Icon name="trophy" size={26} />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-plum-200">Pódio dos cortes</p>
                <h2 className="text-2xl font-extrabold">Os mais pedidos pelas clientes</h2>
              </div>
            </div>
            <div className="relative mt-6 rounded-[28px] bg-white/95 px-3 pb-4 pt-6 text-plum-950">
              {data.cuts.length === 0 ? (
                <p className="py-10 text-center font-bold text-ink-soft">Sem dados no período.</p>
              ) : (
                <Podium
                  items={data.cuts.slice(0, 3).map((c) => ({ label: cutName(c.id), n: c.n, photo: cutPhoto(c.id) }))}
                />
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(['cut', 'color', 'both'] as const).map((m, i) => (
              <div
                key={m}
                className="adm-card adm-rise flex items-center gap-4 rounded-[24px] p-4 ring-1 ring-plum-100"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="brand-gradient flex size-12 items-center justify-center rounded-2xl text-white shadow-lg">
                  <Icon name={m === 'cut' ? 'scissors' : m === 'color' ? 'palette' : 'sparkles'} size={22} />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                    Só {MODE_LABEL[m].toLowerCase()}
                  </p>
                  <p className="text-2xl font-extrabold text-plum-950">
                    <CountUp value={data.modes[m] || 0} format={int} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Pódio das cores" subtitle="As cores mais usadas" delay={80}>
              {data.colors.length === 0 ? (
                <p className="text-ink-soft">Sem dados no período.</p>
              ) : (
                <Podium
                  items={data.colors
                    .slice(0, 3)
                    .map((c) => ({ label: colorName(c.id), n: c.n, photo: colorPhoto(c.id) }))}
                />
              )}
            </Card>
            {!tenant ? (
              <Card title="Pódio dos salões" subtitle="Quem mais gerou imagens" delay={120}>
                {data.tenants.length === 0 ? (
                  <p className="text-ink-soft">Sem dados no período.</p>
                ) : (
                  <Podium items={data.tenants.slice(0, 3).map((t) => ({ label: t.name, n: t.n }))} />
                )}
              </Card>
            ) : (
              <Card title="Combinações (corte + cor)" delay={120}>
                <RankList
                  items={data.combos.map((c) => ({
                    key: `${c.cut}|${c.color}`,
                    label: `${cutName(c.cut)} + ${colorName(c.color)}`,
                    n: c.n,
                    photo: cutPhoto(c.cut),
                  }))}
                />
              </Card>
            )}
            <Card title="Classificação completa · cortes" delay={160}>
              <RankList
                items={data.cuts.map((c) => ({ key: c.id, label: cutName(c.id), n: c.n, photo: cutPhoto(c.id) }))}
              />
            </Card>
            <Card title="Classificação completa · cores" delay={200}>
              <RankList
                items={data.colors.map((c) => ({ key: c.id, label: colorName(c.id), n: c.n, photo: colorPhoto(c.id) }))}
              />
            </Card>
            {!tenant && (
              <Card title="Combinações mais usadas (corte + cor)" className="lg:col-span-2" delay={240}>
                <RankList
                  items={data.combos.map((c) => ({
                    key: `${c.cut}|${c.color}`,
                    label: `${cutName(c.cut)} + ${colorName(c.color)}`,
                    n: c.n,
                    photo: cutPhoto(c.cut),
                  }))}
                />
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface Errors {
  recent: {
    at: string;
    tenant: string | null;
    email: string | null;
    demo: boolean;
    mode: string;
    cut_id: string | null;
    color_id: string | null;
    error: string | null;
    duration_ms: number | null;
  }[];
  by_message: { error: string | null; n: number }[];
}

export function ErrorsTab() {
  const { data, error, loading, reload } = useAdminData<Errors>('/api/admin/errors');
  if (loading && !data) return <Loading />;
  if (error || !data) return <Loading error={error} onRetry={reload} />;
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageTitle title="Falhas" subtitle="Imagens que a IA não conseguiu gerar (não contam no plano do cliente)." />
      <Card title="Motivos mais comuns (30 dias)">
        {data.by_message.length === 0 ? (
          <p className="text-ink-soft">Nenhuma falha. 🎉</p>
        ) : (
          <ul className="grid gap-2">
            {data.by_message.map((m, i) => (
              <li key={i} className="flex justify-between gap-3 rounded-xl bg-red-50 px-3 py-2 text-sm">
                <span className="font-bold text-red-800">{m.error || 'Sem detalhe'}</span>
                <b className="shrink-0 text-red-700">{int(m.n)}x</b>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Últimas falhas">
        {data.recent.length === 0 ? (
          <p className="text-ink-soft">Nenhuma falha registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-ink-soft">
                  <th className="py-1">Quando</th>
                  <th>Salão</th>
                  <th>Escolha</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r, i) => (
                  <tr key={i} className="border-t border-plum-100 align-top">
                    <td className="py-2 pr-2">{date(r.at, true)}</td>
                    <td className="pr-2">
                      {r.demo ? 'Demonstração' : r.tenant || '—'}
                      {r.email && <span className="block text-xs text-ink-soft">{r.email}</span>}
                    </td>
                    <td className="pr-2">
                      {[r.cut_id && cutName(r.cut_id), r.color_id && colorName(r.color_id)].filter(Boolean).join(' + ')}
                    </td>
                    <td className="text-red-700">{r.error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

interface Audit {
  actions: {
    at: string;
    actor: string;
    action: string;
    tenant: string | null;
    details: Record<string, unknown> | null;
  }[];
  logins: { at: string; email: string; outcome: string }[];
}

export function AuditTab() {
  const { data, error, loading, reload } = useAdminData<Audit>('/api/admin/audit');
  if (loading && !data) return <Loading />;
  if (error || !data) return <Loading error={error} onRetry={reload} />;
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageTitle title="Registro" subtitle="Quem fez o quê no painel, e quem tentou entrar no app." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Ações no painel">
          {data.actions.length === 0 ? (
            <p className="text-ink-soft">Nenhuma ação ainda.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {data.actions.map((a, i) => (
                <li key={i} className="rounded-xl bg-plum-50/70 px-3 py-2">
                  <b className="text-plum-950">{ACTION_LABEL[a.action] || a.action}</b>
                  {a.tenant && <> · {a.tenant}</>}
                  {typeof a.details?.reason === 'string' && a.details.reason && <> · motivo: {a.details.reason}</>}
                  <span className="block text-xs text-ink-soft">
                    {a.actor} · {date(a.at, true)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Logins no app">
          {data.logins.length === 0 ? (
            <p className="text-ink-soft">Nenhum login ainda.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {data.logins.map((l, i) => (
                <li
                  key={i}
                  className={`flex flex-wrap justify-between gap-2 rounded-xl px-3 py-2 ${l.outcome === 'denied' ? 'bg-red-50' : 'bg-plum-50/70'}`}
                >
                  <span>
                    <b>{l.email}</b> · {LOGIN_LABEL[l.outcome] || l.outcome}
                  </span>
                  <span className="text-ink-soft">{date(l.at, true)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export function SettingsTab() {
  const { data, error, loading, reload } = useAdminData<Overview>('/api/admin/overview');
  const [f, setF] = useState<{ cost: string; fx: string; demo: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (loading && !data) return <Loading />;
  if (error || !data) return <Loading error={error} onRetry={reload} />;
  const v = f ?? { cost: String(data.cost_per_image_usd), fx: String(data.usd_brl), demo: String(data.demo_limit) };
  const input = 'mt-1 min-h-12 w-full rounded-xl bg-plum-50/60 px-3 font-semibold text-plum-950 ring-1 ring-plum-200';

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await postJson('/api/admin/settings', { cost_per_image_usd: v.cost, usd_brl: v.fx, demo_limit: v.demo });
      setMsg({ ok: true, text: 'Ajustes salvos.' });
      reload();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid max-w-2xl grid-cols-1 gap-5">
      <PageTitle title="Ajustes" subtitle="Custos usados nos cálculos de margem e a demonstração grátis." />
      <Card>
        <form onSubmit={save} className="grid gap-4">
          <label className="font-bold text-plum-900">
            Custo da IA por imagem (US$)
            <input
              type="number"
              step="0.0001"
              min={0}
              value={v.cost}
              onChange={(e) => setF({ ...v, cost: e.target.value })}
              className={input}
            />
            <span className="mt-1 block text-sm font-semibold text-ink-soft">Muse no fal.ai: US$ 0,01 por imagem.</span>
          </label>
          <label className="font-bold text-plum-900">
            Cotação do dólar (R$, com IOF)
            <input
              type="number"
              step="0.01"
              min={0}
              value={v.fx}
              onChange={(e) => setF({ ...v, fx: e.target.value })}
              className={input}
            />
          </label>
          <label className="font-bold text-plum-900">
            Imagens grátis na demonstração (por pessoa)
            <input
              type="number"
              min={0}
              max={20}
              value={v.demo}
              onChange={(e) => setF({ ...v, demo: e.target.value })}
              className={input}
            />
          </label>
          {msg && (
            <p
              className={`rounded-xl px-4 py-3 font-bold ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}
            >
              {msg.text}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" icon="check" disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar ajustes'}
            </Button>
          </div>
        </form>
      </Card>
      <Card title="Administradores">
        <p className="text-sm text-ink-soft">
          Só estes e-mails entram no painel: charneskitiago123@gmail.com e agenciawissenmkt@gmail.com.
        </p>
      </Card>
    </div>
  );
}
