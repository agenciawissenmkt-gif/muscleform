import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Field, Input, Select, Textarea, Toggle } from '../../ui/Field'
import { BODY_TYPES, CAR_STATUS_LABEL, FUELS, TRANSMISSIONS, type Car, type CarStatus } from '../../core/types'
import { PhotoPicker } from './PhotoPicker'
import type { CarDraft, PhotoItem } from './useCars'

interface Props {
  open: boolean
  car: Car | null
  onClose: () => void
  onSave: (draft: CarDraft, photos: PhotoItem[], carId?: string) => Promise<unknown>
}

interface FormState {
  brand: string
  model: string
  version: string
  year: string
  model_year: string
  color: string
  doors: string
  transmission: string
  body_type: string
  fuel: string
  mileage_km: string
  price_brl: string
  engine: string
  horsepower: string
  accepts_trade: boolean
  description: string
  status: CarStatus
}

const EMPTY: FormState = {
  brand: '',
  model: '',
  version: '',
  year: '',
  model_year: '',
  color: '',
  doors: '4',
  transmission: '',
  body_type: '',
  fuel: '',
  mileage_km: '',
  price_brl: '',
  engine: '',
  horsepower: '',
  accepts_trade: true,
  description: '',
  status: 'ativo',
}

function toForm(car: Car): FormState {
  return {
    brand: car.brand ?? '',
    model: car.model ?? '',
    version: car.version ?? '',
    year: car.year?.toString() ?? '',
    model_year: car.model_year?.toString() ?? '',
    color: car.color ?? '',
    doors: car.doors?.toString() ?? '',
    transmission: car.transmission ?? '',
    body_type: car.body_type ?? '',
    fuel: car.fuel ?? '',
    mileage_km: car.mileage_km?.toString() ?? '',
    price_brl: car.price_brl?.toString() ?? '',
    engine: car.engine ?? '',
    horsepower: car.horsepower?.toString() ?? '',
    accepts_trade: car.accepts_trade,
    description: car.description ?? '',
    status: car.status,
  }
}

const num = (value: string) => (value.trim() === '' ? null : Number(value.replace(/\./g, '').replace(',', '.')))
const text = (value: string) => (value.trim() === '' ? null : value.trim())

export function CarFormModal({ open, car, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (car) {
      setForm(toForm(car))
      setPhotos(
        car.car_photos.map((photo) => ({
          kind: 'existing' as const,
          id: photo.id,
          url: photo.url,
          storage_path: photo.storage_path,
        })),
      )
    } else {
      setForm(EMPTY)
      setPhotos([])
    }
  }, [open, car])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.brand.trim() || !form.model.trim()) {
      setError('Informe pelo menos a marca e o modelo do veículo.')
      return
    }

    setSaving(true)
    setError(null)

    const draft: CarDraft = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      version: text(form.version),
      year: num(form.year),
      model_year: num(form.model_year),
      color: text(form.color),
      doors: num(form.doors),
      transmission: text(form.transmission),
      body_type: text(form.body_type),
      fuel: text(form.fuel),
      mileage_km: num(form.mileage_km),
      price_brl: num(form.price_brl),
      engine: text(form.engine),
      horsepower: num(form.horsepower),
      accepts_trade: form.accepts_trade,
      description: text(form.description),
      status: form.status,
    }

    try {
      await onSave(draft, photos, car?.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o veículo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={car ? 'Editar anúncio' : 'Cadastrar veículo'}
      subtitle={
        car
          ? 'As alterações ficam disponíveis para a IA imediatamente.'
          : 'Os dados preenchidos aqui alimentam o agente de IA no WhatsApp.'
      }
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="car-form" loading={saving}>
            {car ? 'Salvar alterações' : 'Cadastrar veículo'}
          </Button>
        </>
      }
    >
      <form id="car-form" onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h3 className="mb-3 text-sm font-bold text-ink-900">Fotos do veículo</h3>
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-ink-900">Identificação</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Marca" required value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Toyota" />
            <Input label="Modelo" required value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Corolla" />
            <Input
              label="Versão"
              className="sm:col-span-2"
              value={form.version}
              onChange={(e) => set('version', e.target.value)}
              placeholder="XEi 2.0 Flex 16V Aut."
            />
            <Input label="Ano de fabricação" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2022" />
            <Input label="Ano do modelo" inputMode="numeric" value={form.model_year} onChange={(e) => set('model_year', e.target.value)} placeholder="2023" />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-ink-900">Ficha técnica</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Quilometragem" inputMode="numeric" value={form.mileage_km} onChange={(e) => set('mileage_km', e.target.value)} placeholder="45000" hint="Somente números" />
            <Input label="Cor" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Prata" />
            <Input label="Portas" inputMode="numeric" value={form.doors} onChange={(e) => set('doors', e.target.value)} placeholder="4" />
            <Select label="Câmbio" options={TRANSMISSIONS} placeholder="Selecione" value={form.transmission} onChange={(e) => set('transmission', e.target.value)} />
            <Select label="Combustível" options={FUELS} placeholder="Selecione" value={form.fuel} onChange={(e) => set('fuel', e.target.value)} />
            <Select label="Carroceria" options={BODY_TYPES} placeholder="Selecione" value={form.body_type} onChange={(e) => set('body_type', e.target.value)} />
            <Input label="Motor" value={form.engine} onChange={(e) => set('engine', e.target.value)} placeholder="2.0 16V" />
            <Input label="Potência (cv)" inputMode="numeric" value={form.horsepower} onChange={(e) => set('horsepower', e.target.value)} placeholder="177" />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-ink-900">Comercial</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Preço"
              prefix="R$"
              inputMode="decimal"
              value={form.price_brl}
              onChange={(e) => set('price_brl', e.target.value)}
              placeholder="129900"
            />
            <Field label="Status do anúncio">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CAR_STATUS_LABEL) as CarStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set('status', status)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                      form.status === status
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                    }`}
                  >
                    {CAR_STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Toggle
                checked={form.accepts_trade}
                onChange={(value) => set('accepts_trade', value)}
                label="Aceita troca neste veículo"
                description="A IA vai oferecer avaliação do carro usado do cliente."
              />
            </div>
            <Textarea
              label="Descrição e opcionais"
              className="sm:col-span-2"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Único dono, revisões em concessionária, multimídia, câmera de ré, sensor de estacionamento..."
              hint="Quanto mais detalhes, melhor o agente de IA apresenta o veículo."
            />
          </div>
        </section>

        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </form>
    </Modal>
  )
}
