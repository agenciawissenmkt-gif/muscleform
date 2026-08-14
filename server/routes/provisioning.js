import { Router } from 'express'
import { db, HttpError } from '../lib/db.js'
import { requireTenant, route } from '../lib/auth.js'

const router = Router()

/**
 * Fecha a implementação: monta o payload da loja e entrega ao webhook do N8N,
 * que cria o fluxo do agente autônomo para esse tenant.
 */
router.post(
  '/complete',
  route(async (req, res) => {
    const { user, tenant } = await requireTenant(req)

    const [settings, channel, google, team] = await Promise.all([
      db.selectOne('tenant_settings', `tenant_id=eq.${tenant.id}&select=*`),
      db.selectOne('tenant_channels', `tenant_id=eq.${tenant.id}&select=*`),
      db.selectOne('tenant_google_credentials', `tenant_id=eq.${tenant.id}&select=calendar_id,email`),
      db.select('salespeople', `tenant_id=eq.${tenant.id}&select=name,email,role&order=created_at`),
    ])

    const payload = {
      store_name: tenant.nome,
      owner_email: user.email,
      bot_phone: tenant.bot_phone,
      google_calendar_id: google?.calendar_id ?? tenant.google_calendar_id ?? 'primary',
      prompt_descoberta: settings?.prompt_descoberta ?? '',
      prompt_encantamento: settings?.prompt_encantamento ?? '',
      prompt_fechamento: settings?.prompt_fechamento ?? '',
      salespeople: (team ?? []).map((person) => ({
        name: person.name,
        email: person.email,
        role: person.role,
      })),
      // Contexto extra para o fluxo do N8N localizar a loja e respeitar suas regras
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        cnpj: tenant.cnpj,
        contact_phone: tenant.contact_phone,
        timezone: tenant.timezone,
        chatwoot_base_url: tenant.chatwoot_base_url,
        account_id: channel?.account_id ?? null,
        inbox_id: channel?.inbox_id ?? null,
        instance_name: channel?.instance_name ?? null,
      },
      regras: {
        aceita_consignacao: settings?.accepts_consignment ?? false,
        aceita_troca: settings?.accepts_trade ?? false,
        carro_de_leilao: settings?.auction_cars ?? false,
        laudo_cautelar: settings?.inspection_report ?? null,
        bancos_parceiros: settings?.partner_banks ?? [],
      },
      horario_ia: {
        modo: settings?.ai_schedule_mode ?? '24h',
        inicio: settings?.ai_start_time ?? null,
        fim: settings?.ai_end_time ?? null,
      },
    }

    const webhook = process.env.N8N_PROVISIONING_WEBHOOK_URL
    if (!webhook) {
      res.json({ ok: true, forwarded: false, payload })
      return
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.N8N_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 200)
      throw new HttpError(502, `O webhook do N8N respondeu ${response.status}. ${detail}`)
    }

    res.json({ ok: true, forwarded: true, payload })
  }),
)

export default router
