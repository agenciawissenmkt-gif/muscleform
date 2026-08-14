export type CarStatus = 'ativo' | 'reservado' | 'vendido'

export type SalespersonRole = 'administrator' | 'agent'

export type AiScheduleMode = '24h' | 'custom'

export interface Tenant {
  id: string
  owner_id: string
  nome: string
  slug: string
  cnpj: string | null
  contact_phone: string | null
  bot_phone: string | null
  google_calendar_id: string | null
  timezone: string
  chatwoot_base_url: string | null
  chatwoot_token: string | null
  onboarding_step: number
  onboarding_done: boolean
  whatsapp_status: string
  created_at: string
}

export interface TenantSettings {
  id: string
  tenant_id: string
  prompt_descoberta: string | null
  prompt_encantamento: string | null
  prompt_fechamento: string | null
  accepts_consignment: boolean
  accepts_trade: boolean
  auction_cars: boolean
  inspection_report: string | null
  partner_banks: string[]
  ai_schedule_mode: AiScheduleMode
  ai_start_time: string | null
  ai_end_time: string | null
}

export interface TenantChannel {
  id: string
  tenant_id: string
  account_id: number | null
  inbox_id: number | null
  instance_name: string | null
  status: string
}

export interface GoogleCredentials {
  tenant_id: string
  email: string | null
  calendar_id: string
  expires_at: string | null
}

export interface Salesperson {
  id: string
  tenant_id: string
  name: string
  email: string
  role: SalespersonRole
  chatwoot_user_id: number | null
}

export interface CarPhoto {
  id: string
  car_id: string
  url: string
  storage_path: string | null
  position: number
}

export interface Car {
  id: string
  tenant_id: string
  brand: string
  model: string
  version: string | null
  year: number | null
  model_year: number | null
  color: string | null
  doors: number | null
  transmission: string | null
  body_type: string | null
  fuel: string | null
  mileage_km: number | null
  price_brl: number | null
  engine: string | null
  horsepower: number | null
  accepts_trade: boolean
  description: string | null
  status: CarStatus
  created_at: string
  car_photos: CarPhoto[]
}

export const CAR_STATUS_LABEL: Record<CarStatus, string> = {
  ativo: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
}

export const TRANSMISSIONS = ['Manual', 'Automático', 'Automatizado', 'CVT'] as const
export const FUELS = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico', 'GNV'] as const
export const BODY_TYPES = [
  'Hatch',
  'Sedã',
  'SUV',
  'Picape',
  'Utilitário',
  'Coupé',
  'Conversível',
  'Minivan',
] as const
export const PARTNER_BANKS = ['BV', 'Santander', 'Itaú', 'Bradesco', 'Pan'] as const
