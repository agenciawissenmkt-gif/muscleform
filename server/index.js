import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { supabaseConfigured } from './lib/db.js'
import googleRoutes from './routes/google.js'
import chatwootRoutes from './routes/chatwoot.js'
import evolutionRoutes from './routes/evolution.js'
import provisioningRoutes from './routes/provisioning.js'

/**
 * Back-end de provisionamento do Wissen Cars.
 *
 * O front fala direto com o Supabase para estoque e configurações; este servidor
 * existe apenas para as integrações que exigem chaves privilegiadas:
 * Google OAuth, Chatwoot (Super Admin), Evolution API e o webhook do N8N.
 */

const app = express()

app.use(cors({ origin: process.env.APP_URL || true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    integrations: {
      supabase: supabaseConfigured(),
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      chatwoot: Boolean(process.env.CHATWOOT_BASE_URL && process.env.CHATWOOT_PLATFORM_TOKEN),
      evolution: Boolean(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY),
      n8n: Boolean(process.env.N8N_PROVISIONING_WEBHOOK_URL),
      simulate: process.env.WISSEN_SIMULATE === 'true',
    },
  })
})

app.use('/api/google', googleRoutes)
app.use('/api/chatwoot', chatwootRoutes)
app.use('/api/evolution', evolutionRoutes)
app.use('/api/provisioning', provisioningRoutes)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

const port = Number(process.env.PORT || 8787)
app.listen(port, () => {
  console.log(`[wissen-cars] servidor de provisionamento em http://localhost:${port}`)
  if (!supabaseConfigured()) {
    console.warn('[wissen-cars] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes — as rotas responderão 501.')
  }
})
