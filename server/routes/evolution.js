import { Router } from 'express'
import { db, HttpError, upsertChannel } from '../lib/db.js'
import { requireTenant, route } from '../lib/auth.js'

const router = Router()

/** Modo simulação: permite testar a etapa 4 (QR + comemoração) sem Evolution API. */
const SIMULATE = process.env.WISSEN_SIMULATE === 'true'
const SIMULATED_CONNECT_MS = 12_000
const simulated = new Map()

function evolutionConfig() {
  const baseUrl = (process.env.EVOLUTION_API_URL || '').replace(/\/$/, '')
  const apiKey = process.env.EVOLUTION_API_KEY

  if (!baseUrl || !apiKey) {
    if (SIMULATE) return null
    throw new HttpError(
      501,
      'Evolution API não configurada no servidor.',
      'Defina EVOLUTION_API_URL e EVOLUTION_API_KEY em server/.env — ou WISSEN_SIMULATE=true para testar o fluxo sem WhatsApp real.',
    )
  }

  return { baseUrl, apiKey }
}

async function evolution(path, { method = 'GET', body } = {}) {
  const config = evolutionConfig()

  const res = await fetch(`${config.baseUrl}/${path}`, {
    method,
    headers: { apikey: config.apiKey, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text.slice(0, 200) }
  }

  if (!res.ok) {
    const message = data?.response?.message || data?.message || data?.error || `Erro (${res.status})`
    throw new HttpError(502, `Evolution API: ${Array.isArray(message) ? message.join(', ') : message}`)
  }

  return data
}

function instanceName(tenant) {
  return `wissen-${tenant.slug}`.slice(0, 60)
}

/** Extrai o QR em base64 das várias formas que a Evolution devolve. */
function readQrCode(payload) {
  const raw =
    payload?.qrcode?.base64 ??
    payload?.qrcode?.code ??
    payload?.base64 ??
    payload?.code ??
    null

  if (!raw) return null
  return String(raw).startsWith('data:') ? raw : `data:image/png;base64,${raw}`
}

function simulatedQr(name) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
<rect width="240" height="240" fill="#fff"/>
<g fill="#0F172A">${Array.from({ length: 144 })
    .map((_, i) => {
      const x = (i % 12) * 20
      const y = Math.floor(i / 12) * 20
      const on = (i * 7 + name.length * 3) % 3 !== 0
      return on ? `<rect x="${x}" y="${y}" width="20" height="20"/>` : ''
    })
    .join('')}</g>
<rect x="80" y="90" width="80" height="60" rx="8" fill="#7C3AED"/>
<text x="120" y="126" font-family="sans-serif" font-size="12" fill="#fff" text-anchor="middle">SIMULAÇÃO</text>
</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/** Descobre o inbox criado pela integração no Chatwoot — o par (account, inbox) identifica o tenant no N8N. */
async function findInboxId(tenant, accountId) {
  if (!tenant.chatwoot_base_url || !tenant.chatwoot_token || !accountId) return null

  try {
    const res = await fetch(`${tenant.chatwoot_base_url}/api/v1/accounts/${accountId}/inboxes`, {
      headers: { api_access_token: tenant.chatwoot_token },
    })
    if (!res.ok) return null
    const data = await res.json()
    const inboxes = data?.payload ?? []
    const match = inboxes.find((inbox) => String(inbox.name).includes(tenant.slug)) ?? inboxes[0]
    return match?.id ?? null
  } catch {
    return null
  }
}

// --- Criação da instância ----------------------------------------------------

router.post(
  '/instance',
  route(async (req, res) => {
    const { tenant } = await requireTenant(req)
    const channel = await db.selectOne('tenant_channels', `tenant_id=eq.${tenant.id}&select=*`)
    const name = instanceName(tenant)
    const config = evolutionConfig()

    if (!config) {
      simulated.set(name, Date.now())
      await upsertChannel(tenant.id, { instance_name: name, status: 'aguardando_leitura' })
      res.json({ instance: name, status: 'aguardando_leitura', qrcode: simulatedQr(name), simulated: true })
      return
    }

    // Se a instância já existir, a Evolution responde 403/409 — nesse caso seguimos para o connect.
    let created = null
    try {
      created = await evolution('instance/create', {
        method: 'POST',
        body: {
          instanceName: name,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
          ...(tenant.bot_phone ? { number: tenant.bot_phone } : {}),
        },
      })
    } catch (error) {
      if (!/already|exists|in use/i.test(error.message)) throw error
    }

    // Liga a instância à central de atendimento da loja (cria a inbox no Chatwoot).
    if (channel?.account_id && tenant.chatwoot_base_url && tenant.chatwoot_token) {
      await evolution(`chatwoot/set/${name}`, {
        method: 'POST',
        body: {
          enabled: true,
          accountId: String(channel.account_id),
          token: tenant.chatwoot_token,
          url: tenant.chatwoot_base_url,
          signMsg: false,
          reopenConversation: true,
          conversationPending: false,
          nameInbox: `wissen-${tenant.slug}`,
          importContacts: false,
          importMessages: false,
          mergeBrazilContacts: true,
          autoCreate: true,
        },
      }).catch((error) => {
        console.warn('[wissen-cars] integração Chatwoot/Evolution falhou:', error.message)
      })
    }

    let qrcode = readQrCode(created)
    if (!qrcode) {
      const connect = await evolution(`instance/connect/${name}`)
      qrcode = readQrCode(connect)
    }

    await upsertChannel(tenant.id, { instance_name: name, status: 'aguardando_leitura' })

    res.json({ instance: name, status: 'aguardando_leitura', qrcode })
  }),
)

// --- Status / renovação do QR ------------------------------------------------

router.get(
  '/state',
  route(async (req, res) => {
    const { tenant } = await requireTenant(req)
    const channel = await db.selectOne('tenant_channels', `tenant_id=eq.${tenant.id}&select=*`)
    const name = channel?.instance_name || instanceName(tenant)
    const config = evolutionConfig()

    if (!config) {
      const startedAt = simulated.get(name)
      const connected = startedAt && Date.now() - startedAt > SIMULATED_CONNECT_MS
      if (connected) {
        await upsertChannel(tenant.id, { status: 'conectado', inbox_id: channel?.inbox_id ?? null })
        await db.update('tenants', `id=eq.${tenant.id}`, { whatsapp_status: 'conectado' })
      }
      res.json({
        instance: name,
        status: connected ? 'conectado' : 'aguardando_leitura',
        qrcode: connected ? null : simulatedQr(name),
        simulated: true,
      })
      return
    }

    const data = await evolution(`instance/connectionState/${name}`)
    const rawState = data?.instance?.state ?? data?.state ?? 'close'

    if (rawState === 'open') {
      const inboxId = channel?.inbox_id ?? (await findInboxId(tenant, channel?.account_id))
      await upsertChannel(tenant.id, { status: 'conectado', ...(inboxId ? { inbox_id: inboxId } : {}) })
      await db.update('tenants', `id=eq.${tenant.id}`, { whatsapp_status: 'conectado' })
      res.json({ instance: name, status: 'conectado', qrcode: null, inbox_id: inboxId })
      return
    }

    // Ainda não leram o QR: devolve um código atualizado.
    const connect = await evolution(`instance/connect/${name}`).catch(() => null)
    res.json({ instance: name, status: 'aguardando_leitura', qrcode: readQrCode(connect) })
  }),
)

// --- Desconectar -------------------------------------------------------------

router.post(
  '/disconnect',
  route(async (req, res) => {
    const { tenant } = await requireTenant(req)
    const channel = await db.selectOne('tenant_channels', `tenant_id=eq.${tenant.id}&select=*`)
    const name = channel?.instance_name || instanceName(tenant)
    const config = evolutionConfig()

    if (config) {
      await evolution(`instance/logout/${name}`, { method: 'DELETE' }).catch(() => undefined)
      await evolution(`instance/delete/${name}`, { method: 'DELETE' }).catch(() => undefined)
    } else {
      simulated.delete(name)
    }

    await upsertChannel(tenant.id, { status: 'desconectado' })
    await db.update('tenants', `id=eq.${tenant.id}`, { whatsapp_status: 'desconectado' })

    res.json({ ok: true })
  }),
)

export default router
