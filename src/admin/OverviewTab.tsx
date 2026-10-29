import { Card, Loading, useAdminData } from './shared';
import { brl, int, monthLabel, pct, type Overview } from './format';
import { Icon } from '../components/ui';

function Kpi({
  label,
  value,
  hint,
  tone = 'plum',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'plum' | 'green' | 'red' | 'amber';
}) {
  const tones = {
    plum: 'text-plum-900',
    green: 'text-emerald-700',
    red: 'text-red-700',
    amber: 'text-amber-700',
  };
  return (
    <div className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-plum-100">
      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function OverviewTab({ onOpenTenants }: { onOpenTenants: () => void }) {
  const { data: o, error, loading, reload } = useAdminData<Overview>('/api/admin/overview');
  if (loading && !o) return <Loading />;
  if (error || !o) return <Loading error={error} onRetry={reload} />;

  const costBrl = o.ai_cost_month_usd * o.usd_brl;
  const margin = o.mrr_brl - costBrl;
  const usage = o.quota_month ? o.images_month / o.quota_month : 0;
  // Os últimos 30 dias, inclusive os sem imagens
  const byDay = new Map(o.daily.map((d) => [d.day, d]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const key = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return byDay.get(key) || { day: key, images: 0, errors: 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.images + d.errors));
  const maxMonth = Math.max(1, ...o.months.map((m) => m.images));

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-plum-950">Visão geral</h1>
          <p className="text-ink-soft">Mês atual (desde {new Date(o.month_start).toLocaleDateString('pt-BR')})</p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-plum-700 hover:bg-plum-100"
        >
          <Icon name="refresh" size={18} /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          label="Faturamento mensal"
          value={brl(o.mrr_brl)}
          hint={`${int(o.tenants_active)} ${o.tenants_active === 1 ? 'cliente ativo' : 'clientes ativos'}`}
          tone="green"
        />
        <Kpi
          label="Custo da IA no mês"
          value={brl(costBrl)}
          hint={`US$ ${o.ai_cost_month_usd.toFixed(2)} · US$1 = R$${o.usd_brl}`}
        />
        <Kpi
          label="Margem no mês"
          value={brl(margin)}
          hint={o.mrr_brl ? `${pct(margin / o.mrr_brl)} do faturamento` : undefined}
          tone={margin >= 0 ? 'green' : 'red'}
        />
        <Kpi label="Imagens no mês" value={int(o.images_month)} hint={`${int(o.images_today)} hoje`} />
        <Kpi
          label="Uso dos planos"
          value={pct(usage)}
          hint={`${int(o.images_month)} de ${int(o.quota_month)} contratadas`}
          tone={usage > 0.9 ? 'amber' : 'plum'}
        />
        <Kpi
          label="Clientes"
          value={int(o.tenants_total)}
          hint={o.tenants_blocked ? `${int(o.tenants_blocked)} bloqueados / atrasados` : 'nenhum bloqueado'}
          tone={o.tenants_blocked ? 'amber' : 'plum'}
        />
        <Kpi
          label="Demonstrações"
          value={int(o.demo_images_month)}
          hint={`imagens no mês · ${o.demo_limit} por pessoa`}
        />
        <Kpi
          label="Falhas no mês"
          value={int(o.errors_month)}
          hint={`tempo médio ${(o.avg_duration_ms / 1000).toFixed(1)} s por imagem`}
          tone={o.errors_month ? 'red' : 'plum'}
        />
      </div>

      <Card title="Imagens por dia (últimos 30 dias)">
        <div className="flex h-44 items-end gap-1 overflow-x-auto">
          {days.map((d) => (
            <div
              key={d.day}
              className="flex min-w-[8px] flex-1 flex-col items-center justify-end gap-0.5"
              title={`${d.day}: ${d.images} imagens, ${d.errors} falhas`}
            >
              {d.errors > 0 && (
                <div className="w-full rounded-t bg-red-300" style={{ height: `${(d.errors / maxDay) * 140}px` }} />
              )}
              <div
                className="brand-gradient w-full rounded-t"
                style={{ height: `${Math.max(2, (d.images / maxDay) * 140)}px` }}
              />
              <span className="text-[10px] text-ink-soft">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Imagens e custo por mês">
          {o.months.length === 0 ? (
            <p className="text-ink-soft">Ainda não há imagens geradas.</p>
          ) : (
            <div className="grid gap-2">
              {o.months
                .slice()
                .reverse()
                .map((m) => (
                  <div key={m.month} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 text-sm">
                    <span className="font-bold text-plum-800">{monthLabel(m.month)}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-plum-100">
                      <div
                        className="brand-gradient h-full rounded-full"
                        style={{ width: `${(m.images / maxMonth) * 100}%` }}
                      />
                    </div>
                    <span className="text-right text-ink-soft">
                      <b className="text-plum-900">{int(m.images)}</b> · {brl(m.cost_usd * o.usd_brl)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
        <Card title="Atalhos">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={onOpenTenants}
              className="flex items-center gap-3 rounded-2xl bg-plum-50 px-4 py-3 text-left font-bold text-plum-900 hover:bg-plum-100"
            >
              <Icon name="face" /> Cadastrar ou gerenciar clientes
            </button>
            <p className="px-1 text-sm text-ink-soft">
              Custo por imagem: US$ {o.cost_per_image_usd} (≈ {brl(o.cost_per_image_usd * o.usd_brl)}). Ajuste em
              “Ajustes” se o preço da IA ou o dólar mudar.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
