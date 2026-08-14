import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'
import { slugify } from './format'
import type { GoogleCredentials, Salesperson, Tenant, TenantChannel, TenantSettings } from './types'

interface TenantValue {
  tenant: Tenant | null
  settings: TenantSettings | null
  channel: TenantChannel | null
  salespeople: Salesperson[]
  google: GoogleCredentials | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateTenant: (patch: Partial<Tenant>) => Promise<void>
  updateSettings: (patch: Partial<TenantSettings>) => Promise<void>
}

const TenantContext = createContext<TenantValue | null>(null)

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [settings, setSettings] = useState<TenantSettings | null>(null)
  const [channel, setChannel] = useState<TenantChannel | null>(null)
  const [salespeople, setSalespeople] = useState<Salesperson[]>([])
  const [google, setGoogle] = useState<GoogleCredentials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Busca a loja do usuário logado; na primeira vez, cria a loja e as settings. */
  const load = useCallback(async () => {
    if (!user) {
      setTenant(null)
      setSettings(null)
      setChannel(null)
      setSalespeople([])
      setGoogle(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: found, error: findError } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (findError) throw findError

      let current = found as Tenant | null

      if (!current) {
        const fallbackName = (user.user_metadata?.full_name as string | undefined) || 'Minha Loja'
        const { data: created, error: createError } = await supabase
          .from('tenants')
          .insert({
            owner_id: user.id,
            nome: fallbackName,
            slug: `${slugify(fallbackName) || 'loja'}-${user.id.slice(0, 6)}`,
          })
          .select('*')
          .single()

        if (createError) throw createError
        current = created as Tenant
      }

      const [settingsRes, channelRes, peopleRes, googleRes] = await Promise.all([
        supabase.from('tenant_settings').select('*').eq('tenant_id', current.id).maybeSingle(),
        supabase.from('tenant_channels').select('*').eq('tenant_id', current.id).maybeSingle(),
        supabase.from('salespeople').select('*').eq('tenant_id', current.id).order('created_at'),
        supabase.from('tenant_google_credentials').select('tenant_id,email,calendar_id,expires_at').eq('tenant_id', current.id).maybeSingle(),
      ])

      let currentSettings = settingsRes.data as TenantSettings | null
      if (!currentSettings) {
        const { data: createdSettings } = await supabase
          .from('tenant_settings')
          .insert({ tenant_id: current.id })
          .select('*')
          .single()
        currentSettings = createdSettings as TenantSettings | null
      }

      setTenant(current)
      setSettings(currentSettings)
      setChannel((channelRes.data as TenantChannel | null) ?? null)
      setSalespeople((peopleRes.data as Salesperson[] | null) ?? [])
      setGoogle((googleRes.data as GoogleCredentials | null) ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados da loja.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const updateTenant = useCallback(
    async (patch: Partial<Tenant>) => {
      if (!tenant) return
      const { data, error: updateError } = await supabase
        .from('tenants')
        .update(patch)
        .eq('id', tenant.id)
        .select('*')
        .single()
      if (updateError) throw updateError
      setTenant(data as Tenant)
    },
    [tenant],
  )

  const updateSettings = useCallback(
    async (patch: Partial<TenantSettings>) => {
      if (!tenant) return
      const { data, error: updateError } = await supabase
        .from('tenant_settings')
        .update(patch)
        .eq('tenant_id', tenant.id)
        .select('*')
        .single()
      if (updateError) throw updateError
      setSettings(data as TenantSettings)
    },
    [tenant],
  )

  const value = useMemo<TenantValue>(
    () => ({
      tenant,
      settings,
      channel,
      salespeople,
      google,
      loading,
      error,
      refresh: load,
      updateTenant,
      updateSettings,
    }),
    [tenant, settings, channel, salespeople, google, loading, error, load, updateTenant, updateSettings],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantValue {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant precisa estar dentro de <TenantProvider>')
  return ctx
}
