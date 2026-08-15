import { Router } from 'express'
import crypto from 'node:crypto'
import { db, HttpError, upsertChannel } from '../lib/db.js'
import { requireTenant, route } from '../lib/auth.js'

const router = Router()

export function chatwootConfig() {
  const baseUrl = (process.env.CHATWOOT_BASE_URL || '').replace(/\/$/, '')
  const platformToken = process.env.CHATWOOT_PLATFORM_TOKEN

  if (!baseUrl || !platformToken) {
    throw new HttpError(
      501,
      'Chatwoot não configurado no servidor.',
      'Defina CHATWOOT_BASE_URL e CHATWOOT_PLATFORM_TOKEN (chave Super Admin) em server/.env.',
    )
  }

  return { baseUrl, platformToken }
}

async function platform(path, { method = 'GET', body } = {}) {
  const { baseUrl, platformToken } = chatwootConfig()

  const res = await fetch(`${baseUrl}/platform/api/v1/${path}`, {
    method,
    headers: { api_access_token: platformToken, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    const message = data?.message || data?.error || `Erro do Chatwoot (${res.status})`
    throw new HttpError(res.status === 401 ? 502 : res.status, `Chatwoot: ${message}`)
  }

  return data
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return { message: text.slice(0, 200) }
  }
}

/**
 * Cria (ou reaproveita) a sub-conta da loja no Chatwoot e garante que cada
 * vendedor cadastrado tenha usuário e acesso à conta.
 */
router.post(
  '/provision',
  route(async (req, res) => {
    const { tenant, settings } = await requireTenant(req)
    const { baseUrl } = chatwootConfig()

    const channel = await db.selectOne('tenant_channels', `tenant_id=eq.${tenant.id}&select=*`)
    const team = await db.select('salespeople', `tenant_id=eq.${tenant.id}&select=*&order=created_at`)

    if (!team.length) {
      throw new HttpError(400, 'Cadastre pelo menos um vendedor antes de criar a central.')
    }

    let accountId = channel?.chatwoot_account_id ?? null
    if (!accountId) {
      const account = await platform('accounts', { method: 'POST', body: { name: tenant.nome } })
      accountId = account.id
    }

    const users = []
    let adminToken = settings?.chatwoot_token ?? null

    for (const person of team) {
      let userId = person.chatwoot_user_id ?? null
      let invited = false
      let accessToken = null

      if (!userId) {
        try {
          const created = await platform('users', {
            method: 'POST',
            body: {
              name: person.name,
              email: person.email,
              password: crypto.randomBytes(18).toString('base64url'),
              confirmed: true,
            },
          })
          userId = created.id
          accessToken = created.access_token ?? null
          invited = true
        } catch (error) {
          // 422 = usuário já existe no Chatwoot (outra loja ou cadastro anterior)
          if (error.status !== 422) throw error
        }
      }

      if (userId) {
        await platform(`accounts/${accountId}/account_users`, {
          method: 'POST',
          body: { user_id: userId, role: person.role },
        }).catch((error) => {
          if (error.status !== 422) throw error // 422 = já pertence à conta
        })

        await db.update('salespeople', `id=eq.${person.id}`, { chatwoot_user_id: userId })
        if (person.role === 'administrator' && accessToken) adminToken = accessToken
      }

      users.push({ email: person.email, chatwoot_user_id: userId, role: person.role, invited })
    }

    await upsertChannel(tenant.id, { chatwoot_account_id: accountId, ativo: true })

    await db.upsert(
      'tenant_settings',
      [
        {
          tenant_id: tenant.id,
          chatwoot_base_url: baseUrl,
          ...(adminToken ? { chatwoot_token: adminToken } : {}),
        },
      ],
      'tenant_id',
    )

    res.json({ account_id: accountId, users })
  }),
)

export default router
