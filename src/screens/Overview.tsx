import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTenant } from '../core/tenant'
import { formatBRL, formatBRLCompact } from '../core/format'
import { useCars } from './inventory/useCars'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/Feedback'
import { CalendarIcon, CarIcon, ChatIcon, MoneyIcon, SparkIcon, WhatsappIcon } from '../ui/icons'

interface MetricProps {
  icon: ReactNode
  label: string
  value: string
  detail?: string
  tone?: 'brand' | 'emerald' | 'ink'
  delay?: number
}

const TONE = {
  brand: 'bg-brand-50 text-brand-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  ink: 'bg-ink-100 text-ink-700',
}

function Metric({ icon, label, value, detail, tone = 'brand', delay = 0 }: MetricProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm"
    >
      <span className={`grid size-11 place-items-center rounded-2xl ${TONE[tone]}`}>{icon}</span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-ink-500">{detail}</p>}
    </motion.div>
  )
}

export function Overview() {
  const { tenant, settings, channel, google } = useTenant()
  const { cars, loading } = useCars(tenant?.id)

  const stats = useMemo(() => {
    const available = cars.filter((car) => car.status === 'ativo')
    const reserved = cars.filter((car) => car.status === 'reservado')
    const sold = cars.filter((car) => car.status === 'vendido')
    const inventoryValue = available.reduce((total, car) => total + (car.price_brl ?? 0), 0)
    const averagePrice = available.length ? inventoryValue / available.length : 0
    const withoutPhotos = cars.filter((car) => car.car_photos.length === 0).length

    return { available, reserved, sold, inventoryValue, averagePrice, withoutPhotos }
  }, [cars])

  const aiConnected = tenant?.whatsapp_status === 'conectado'
  const scheduleLabel =
    settings?.ai_schedule_mode === 'custom' && settings.ai_start_time && settings.ai_end_time
      ? `Das ${settings.ai_start_time.slice(0, 5)} às ${settings.ai_end_time.slice(0, 5)}`
      : '24 horas por dia'

  const checklist = [
    { label: 'Regras da loja definidas', done: Boolean(tenant?.nome && settings?.prompt_descoberta) },
    { label: 'Google Agenda conectado', done: Boolean(google) },
    { label: 'Central de atendimento criada', done: Boolean(channel?.account_id) },
    { label: 'WhatsApp conectado', done: aiConnected },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Visão Geral</h1>
        <p className="mt-1 text-sm text-ink-500">
          Um retrato do estoque e do atendimento automático da {tenant?.nome ?? 'sua loja'}.
        </p>
      </header>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<CarIcon />}
          label="Total em estoque"
          value={loading ? '—' : String(cars.length)}
          detail={`${stats.reserved.length} reservado(s) · ${stats.sold.length} vendido(s)`}
          delay={0}
        />
        <Metric
          icon={<SparkIcon />}
          label="Veículos disponíveis"
          value={loading ? '—' : String(stats.available.length)}
          detail={stats.withoutPhotos ? `${stats.withoutPhotos} sem foto cadastrada` : 'Todos com foto cadastrada'}
          tone="emerald"
          delay={0.05}
        />
        <Metric
          icon={<MoneyIcon />}
          label="Valor do inventário"
          value={loading ? '—' : formatBRLCompact(stats.inventoryValue)}
          detail={stats.available.length ? `Ticket médio ${formatBRL(Math.round(stats.averagePrice))}` : 'Sem veículos ativos'}
          tone="ink"
          delay={0.1}
        />
        <Metric
          icon={<WhatsappIcon />}
          label="Status da IA"
          value={aiConnected ? 'Ativa' : 'Aguardando'}
          detail={aiConnected ? `Operando ${scheduleLabel.toLowerCase()}` : 'Conclua a implementação para ativar'}
          tone={aiConnected ? 'emerald' : 'ink'}
          delay={0.15}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-bold text-ink-900">Últimos veículos cadastrados</h2>
            <Link to="/estoque" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Ver estoque
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-ink-400">Carregando…</p>
          ) : cars.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">
              Nenhum veículo cadastrado ainda. Comece pelo{' '}
              <Link to="/estoque" className="font-semibold text-brand-600">
                estoque
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {cars.slice(0, 5).map((car) => (
                <li key={car.id} className="flex items-center gap-4 py-3">
                  <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                    {car.car_photos[0] ? (
                      <img src={car.car_photos[0].url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-ink-400">
                        <CarIcon className="size-5" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink-900">
                      {car.brand} {car.model}
                    </span>
                    <span className="block truncate text-xs text-ink-500">{car.version ?? '—'}</span>
                  </span>
                  <span className="hidden text-sm font-bold text-brand-700 sm:block">{formatBRL(car.price_brl)}</span>
                  <StatusBadge status={car.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-ink-900">Implementação</h2>
          <p className="mt-1 text-sm text-ink-500">Progresso da configuração do seu agente.</p>

          <ul className="mt-5 space-y-3">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full ${
                    item.done ? 'bg-emerald-500 text-white' : 'border border-dashed border-ink-300 text-ink-300'
                  }`}
                >
                  {item.done && (
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
                      <path d="M2 6.5 4.5 9 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm ${item.done ? 'font-semibold text-ink-900' : 'text-ink-500'}`}>{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 rounded-2xl bg-ink-50 p-4 text-sm">
            <p className="flex items-center gap-2 text-ink-600">
              <CalendarIcon className="size-4 text-brand-600" />
              Agenda: <strong className="text-ink-900">{google?.calendar_id ?? 'não conectada'}</strong>
            </p>
            <p className="flex items-center gap-2 text-ink-600">
              <ChatIcon className="size-4 text-brand-600" />
              Central: <strong className="text-ink-900">{channel?.account_id ? `conta #${channel.account_id}` : 'não criada'}</strong>
            </p>
            <p className="flex items-center gap-2 text-ink-600">
              <WhatsappIcon className="size-4 text-brand-600" />
              WhatsApp: <strong className="text-ink-900">{tenant?.bot_phone ?? 'não conectado'}</strong>
            </p>
          </div>

          {!tenant?.onboarding_done && (
            <Link to="/implementacao" className="mt-5 block">
              <Button className="w-full">Continuar implementação</Button>
            </Link>
          )}
        </section>
      </div>
    </div>
  )
}
