import { Icon } from '../components/ui';
import { Bars3D, CountUp, Sparkline } from './charts';
import { brl, int, monthLabel, pct, STATUS, type Overview, type Tenant } from './format';
import { Card, Loading, useAdminData } from './shared';

function last30(daily: Overview['daily']) {
  const byDay = new Map(daily.map((d) => [d.day, d]));
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const key = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return byDay.get(key) || { day: key, images: 0, errors: 0 };
  });
}

function Kpi({
  icon,
  label,
  value,
  format,
  hint,
  tone,
  spark,
  delay,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  value: number;
  format: (v: number) => string;
  hint?: string;
  tone: 'plum' | 'green' | 'rose' | 'amber';
  spark?: number[];
  delay: number;
}) {
  const tones = {
    plum: { chip: 'from-plum-600 to-orchid-500', text: 'text-plum-950', spark: '#a855f7' },
    green: { chip: 'from-emerald-500 to-teal-500', text: 'text-emerald-700', spark: '#10b981' },
    rose: { chip: 'from-rose-500 to-pink-500', text: 'text-rose-600', spark: '#f43f5e' },
    amber: { chip: 'from-amber-400 to-orange-500', text: 'text-amber-700', spark: '#f59e0b' },
  }[tone];
  return (
    <div
      className="adm-card adm-rise group relative overflow-hidden rounded-[28px] p-5 ring-1 ring-plum-100 transition hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tones.chip}`}
        >
          <Icon name={icon} size={24} />
        </span>
        {spark && <Sparkline values={spark} color={tones.spark} />}
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold tracking-tight ${tones.text}`}>
        <CountUp value={value} format={format} />
      </p>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function OverviewTab({ onOpenTenants, userName }: { onOpenTenants: () => void; userName: string }) {
  const { data: o, error, loading, reload } = useAdminData<Overview>('/api/admin/overview');
  const tenants = useAdminData<Tenant[]>('/api/admin/tenants');
  if (loading && !o) return <Loading />;
  if (error || !o) return <Loading error={error} onRetry={reload} />;

  const costBrl = o.ai_cost_month_usd * o.usd_brl;
  const margin = o.mrr_brl - costBrl;
  const days = last30(o.daily);
  const monthName = new Date(o.month_start).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const top = (tenants.data || [])
    .slice()
    .sort((a, b) => b.used_month / Math.max(1, b.monthly_limit) - a.used_month / Math.max(1, a.monthly_limit))
    .slice(0, 6);
  const errorRate =
    o.images_month + o.errors_month ? o.errors_month / (o.images_month + o.demo_images_month + o.errors_month) : 0;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Destaque do mês */}
      <section className="adm-hero adm-rise relative overflow-hidden rounded-[32px] p-6 text-white shadow-[0_30px_60px_-30px_rgb(46_16_101/0.8)] sm:p-8">
        <div className="adm-glow pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-orchid-400/40 blur-3xl" />
        <div className="relative">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-plum-200">
              Olá, {userName.split(' ')[0]} · {monthName}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Seu negócio este mês</h1>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Faturamento mensal',
                  v: o.mrr_brl,
                  f: brl,
                  sub: `${int(o.tenants_active)} ${o.tenants_active === 1 ? 'cliente ativo' : 'clientes ativos'}`,
                },
                {
                  label: 'Margem (após custo da IA)',
                  v: margin,
                  f: brl,
                  sub: o.mrr_brl ? `${pct(margin / o.mrr_brl)} do faturamento` : '—',
                },
                { label: 'Imagens geradas', v: o.images_month, f: int, sub: `${int(o.images_today)} hoje` },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-plum-200">{k.label}</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    <CountUp value={k.v} format={k.f} />
                  </p>
                  <p className="text-sm text-plum-100">{k.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon="users"
          label="Clientes"
          value={o.tenants_total}
          format={int}
          tone="plum"
          delay={80}
          hint={o.tenants_blocked ? `${int(o.tenants_blocked)} bloqueados / atrasados` : 'nenhum bloqueado'}
        />
        <Kpi
          icon="money"
          label="Custo da IA no mês"
          value={costBrl}
          format={brl}
          tone="amber"
          delay={140}
          hint={`US$ ${o.ai_cost_month_usd.toFixed(2)} · US$1 = R$${o.usd_brl}`}
          spark={days.map((d) => d.images)}
        />
        <Kpi
          icon="sparkles"
          label="Demonstrações no mês"
          value={o.demo_images_month}
          format={int}
          tone="green"
          delay={200}
          hint={`${o.demo_limit} grátis por aparelho/mês · hoje ${int(o.demo_images_today)} de ${int(o.demo_daily_cap)}`}
        />
        <Kpi
          icon="alert"
          label="Falhas no mês"
          value={o.errors_month}
          format={int}
          tone="rose"
          delay={260}
          hint={`${pct(errorRate)} das tentativas · ${(o.avg_duration_ms / 1000).toFixed(1)} s por imagem`}
          spark={days.map((d) => d.errors)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          title="Imagens por dia"
          subtitle="Últimos 30 dias · em rosa, as falhas"
          className="xl:col-span-2"
          delay={120}
          right={
            <button
              type="button"
              onClick={reload}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold text-plum-700 hover:bg-plum-100"
            >
              <Icon name="refresh" size={16} /> Atualizar
            </button>
          }
        >
          <Bars3D
            items={days.map((d) => ({
              label: d.day.slice(8),
              value: d.images,
              extra: d.errors,
              title: `${new Date(d.day + 'T12:00').toLocaleDateString('pt-BR')}: ${d.images} imagens, ${d.errors} falhas`,
            }))}
            height={300}
            labelEvery={3}
            showValues={false}
          />
        </Card>
        <Card
          title="Uso dos planos por cliente"
          subtitle="Quem está mais perto do limite"
          delay={180}
          right={
            <button type="button" onClick={onOpenTenants} className="text-sm font-bold text-plum-700 hover:underline">
              Ver todos →
            </button>
          }
        >
          {top.length === 0 ? (
            <p className="text-ink-soft">Nenhum cliente ainda.</p>
          ) : (
            <ul className="grid gap-4">
              {top.map((t) => {
                const p = Math.min(1, t.used_month / Math.max(1, t.monthly_limit));
                return (
                  <li key={t.id}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="brand-gradient flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white">
                          {t.name.charAt(0)}
                        </span>
                        <b className="truncate text-plum-950">{t.name}</b>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${STATUS[t.effective_status].cls}`}
                      >
                        {pct(p)}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-plum-100">
                      <div
                        className={`h-full rounded-full transition-[width] duration-1000 ${p >= 1 ? 'bg-rose-500' : p > 0.8 ? 'bg-amber-500' : 'brand-gradient'}`}
                        style={{ width: `${p * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs font-bold text-ink-soft">
                      {int(t.used_month)} de {int(t.monthly_limit)} imagens
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Imagens por mês" subtitle="Últimos 12 meses" delay={160}>
          {o.months.length === 0 ? (
            <p className="text-ink-soft">Ainda não há imagens geradas.</p>
          ) : (
            <Bars3D
              items={o.months.map((m) => ({ label: monthLabel(m.month), value: m.images }))}
              height={230}
              labelEvery={o.months.length > 8 ? 2 : 1}
            />
          )}
        </Card>
        <Card title="Custo da IA por mês" subtitle={`Em reais · US$ ${o.cost_per_image_usd} por imagem`} delay={220}>
          {o.months.length === 0 ? (
            <p className="text-ink-soft">Ainda não há custo.</p>
          ) : (
            <Bars3D
              shade={1}
              items={o.months.map((m) => ({
                label: monthLabel(m.month),
                value: Math.round(m.cost_usd * o.usd_brl * 100) / 100,
                title: `${monthLabel(m.month)}: ${brl(m.cost_usd * o.usd_brl)}`,
              }))}
              height={230}
              labelEvery={o.months.length > 8 ? 2 : 1}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
