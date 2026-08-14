import { useEffect, useState, type FormEvent } from 'react'
import { useTenant } from '../../core/tenant'
import { defaultPrompts } from '../../core/prompts'
import { maskCnpj, maskPhone, onlyDigits, slugify } from '../../core/format'
import { PARTNER_BANKS, type AiScheduleMode } from '../../core/types'
import { Button } from '../../ui/Button'
import { CheckPill, Field, Input, Textarea, Toggle } from '../../ui/Field'
import { useToast } from '../../ui/Feedback'
import { SparkIcon } from '../../ui/icons'
import { InfoNote, StepCard } from './StepCard'

export function StepRules({ onNext }: { onNext: () => void }) {
  const { tenant, settings, updateTenant, updateSettings } = useTenant()
  const { toast } = useToast()

  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [consignment, setConsignment] = useState(false)
  const [trade, setTrade] = useState(true)
  const [auction, setAuction] = useState(false)
  const [report, setReport] = useState('')
  const [banks, setBanks] = useState<string[]>([])
  const [mode, setMode] = useState<AiScheduleMode>('24h')
  const [start, setStart] = useState('18:00')
  const [end, setEnd] = useState('08:00')
  const [descoberta, setDescoberta] = useState('')
  const [encantamento, setEncantamento] = useState('')
  const [fechamento, setFechamento] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tenant) {
      setNome(tenant.nome ?? '')
      setCnpj(tenant.cnpj ? maskCnpj(tenant.cnpj) : '')
      setPhone(tenant.contact_phone ? maskPhone(tenant.contact_phone) : '')
    }
    if (settings) {
      setConsignment(settings.accepts_consignment)
      setTrade(settings.accepts_trade)
      setAuction(settings.auction_cars)
      setReport(settings.inspection_report ?? '')
      setBanks(settings.partner_banks ?? [])
      setMode(settings.ai_schedule_mode)
      if (settings.ai_start_time) setStart(settings.ai_start_time.slice(0, 5))
      if (settings.ai_end_time) setEnd(settings.ai_end_time.slice(0, 5))
      setDescoberta(settings.prompt_descoberta ?? '')
      setEncantamento(settings.prompt_encantamento ?? '')
      setFechamento(settings.prompt_fechamento ?? '')
    }
  }, [tenant?.id, settings?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function generatePrompts() {
    const generated = defaultPrompts({
      storeName: nome || 'loja',
      settings: {
        accepts_consignment: consignment,
        accepts_trade: trade,
        auction_cars: auction,
        inspection_report: report || null,
        partner_banks: banks,
      },
    })
    setDescoberta(generated.prompt_descoberta)
    setEncantamento(generated.prompt_encantamento)
    setFechamento(generated.prompt_fechamento)
    toast('Prompts sugeridos gerados. Ajuste o texto como quiser antes de salvar.', 'info')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!nome.trim()) {
      setError('Informe o nome da loja.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateTenant({
        nome: nome.trim(),
        slug: tenant?.slug || `${slugify(nome)}-${crypto.randomUUID().slice(0, 6)}`,
        cnpj: onlyDigits(cnpj) || null,
        contact_phone: onlyDigits(phone) || null,
      })

      await updateSettings({
        accepts_consignment: consignment,
        accepts_trade: trade,
        auction_cars: auction,
        inspection_report: report.trim() || null,
        partner_banks: banks,
        ai_schedule_mode: mode,
        ai_start_time: mode === 'custom' ? `${start}:00` : null,
        ai_end_time: mode === 'custom' ? `${end}:00` : null,
        prompt_descoberta: descoberta.trim() || null,
        prompt_encantamento: encantamento.trim() || null,
        prompt_fechamento: fechamento.trim() || null,
      })

      toast('Regras da loja salvas.')
      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar as regras.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepCard
        title="Regras da loja & comportamento da IA"
        description="Essas informações definem o que o agente pode prometer ao cliente e em que horário ele atende."
        footer={
          <Button type="submit" loading={saving}>
            Salvar e continuar
          </Button>
        }
      >
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome da loja"
              required
              className="sm:col-span-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Auto Wissen Motors"
            />
            <Input label="CNPJ" value={cnpj} onChange={(e) => setCnpj(maskCnpj(e.target.value))} placeholder="00.000.000/0001-00" />
            <Input
              label="Telefone de contato"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              placeholder="(41) 99999-9999"
              hint="Telefone da loja para o cliente falar com um humano."
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-ink-900">Regras comerciais</h3>
            <Toggle
              checked={consignment}
              onChange={setConsignment}
              label="Aceita consignação"
              description="A loja vende veículos de terceiros deixados em consignação."
            />
            <Toggle
              checked={trade}
              onChange={setTrade}
              label="Aceita troca"
              description="O carro usado do cliente pode entrar como parte do pagamento."
            />
            <Toggle
              checked={auction}
              onChange={setAuction}
              label="Trabalha com carro de leilão"
              description="A IA informa ao cliente quando o veículo tem origem de leilão."
            />
            <Input
              label="Pesquisa veicular / laudo cautelar"
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Laudo Cautelar 100% Aprovado"
              hint="Frase que a IA usa ao falar da procedência dos veículos."
            />
          </section>

          <section>
            <h3 className="text-sm font-bold text-ink-900">Bancos parceiros para financiamento</h3>
            <p className="mt-1 text-xs text-ink-500">A IA só cita bancos selecionados aqui.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PARTNER_BANKS.map((bank) => (
                <CheckPill
                  key={bank}
                  checked={banks.includes(bank)}
                  onChange={(checked) =>
                    setBanks((prev) => (checked ? [...prev, bank] : prev.filter((item) => item !== bank)))
                  }
                >
                  {bank}
                </CheckPill>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-ink-900">Horário de atuação da IA</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode('24h')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mode === '24h' ? 'border-brand-600 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <span className="block text-sm font-bold text-ink-900">24 horas</span>
                <span className="mt-0.5 block text-xs text-ink-500">O agente responde a qualquer hora, todos os dias.</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mode === 'custom' ? 'border-brand-600 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <span className="block text-sm font-bold text-ink-900">Horário específico</span>
                <span className="mt-0.5 block text-xs text-ink-500">Fora do horário, a conversa fica com a equipe.</span>
              </button>
            </div>

            {mode === 'custom' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Início">
                  <input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  />
                </Field>
                <Field label="Fim" hint="Pode virar o dia — ex.: das 18:00 às 08:00.">
                  <input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  />
                </Field>
              </div>
            )}
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-ink-900">Prompts do agente</h3>
                <p className="mt-1 text-xs text-ink-500">As três fases da conversa, lidas pelo fluxo do N8N.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={generatePrompts} icon={<SparkIcon className="size-4" />}>
                Gerar sugestão
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <Textarea
                label="Descoberta"
                value={descoberta}
                onChange={(e) => setDescoberta(e.target.value)}
                placeholder="Como a IA entende a necessidade do cliente…"
              />
              <Textarea
                label="Encantamento"
                value={encantamento}
                onChange={(e) => setEncantamento(e.target.value)}
                placeholder="Como a IA apresenta o veículo e envia as fotos…"
              />
              <Textarea
                label="Fechamento"
                value={fechamento}
                onChange={(e) => setFechamento(e.target.value)}
                placeholder="Como a IA conduz para a visita, o test-drive e o financiamento…"
              />
            </div>
          </section>

          {error && <InfoNote tone="red">{error}</InfoNote>}
        </div>
      </StepCard>
    </form>
  )
}
