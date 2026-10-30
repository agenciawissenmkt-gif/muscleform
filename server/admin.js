// API do painel empresarial. Só para os administradores cadastrados no banco
// (tabela app.admins) — conferido no servidor e de novo no banco a cada pedido.
import { Router } from 'express';
import { currentSession } from './auth.js';
import { rpc } from './db.js';

const router = Router();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Só administradores (o banco confere de novo em cada função)
router.use(async (req, res, next) => {
  const session = currentSession(req);
  if (!session || session.kind !== 'google') {
    res.status(401).json({ error: 'Entre com a sua conta Google de administrador.' });
    return;
  }
  try {
    const who = await rpc('bs_whoami', { p_email: session.email });
    if (!who.is_admin) {
      res.status(403).json({ error: 'Esta conta não é administradora do painel.' });
      return;
    }
    req.actor = session.email;
    res.setHeader('Cache-Control', 'no-store');
    next();
  } catch (err) {
    next(err);
  }
});

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const tenantId = (req) => {
  if (!UUID.test(req.params.id || '')) throw Object.assign(new Error('Salão inválido.'), { status: 400 });
  return req.params.id;
};
const text = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

router.get(
  '/overview',
  wrap(async (req, res) => {
    res.json(await rpc('bs_admin_overview', { p_actor: req.actor }));
  }),
);

router.get(
  '/tenants',
  wrap(async (req, res) => {
    res.json(await rpc('bs_admin_tenants', { p_actor: req.actor }));
  }),
);

router.get(
  '/tenants/:id',
  wrap(async (req, res) => {
    res.json(await rpc('bs_admin_tenant_detail', { p_actor: req.actor, p_id: tenantId(req) }));
  }),
);

// Cria (sem id) ou atualiza (com id) um salão
router.post(
  '/tenants',
  wrap(async (req, res) => {
    const b = req.body || {};
    const plan = ['500', '1000', 'custom'].includes(b.plan) ? b.plan : '500';
    const emails = Array.isArray(b.emails) ? b.emails.map((e) => text(e, 200)).filter(Boolean).slice(0, 20) : [];
    const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
    const data = {
      id: b.id && UUID.test(b.id) ? b.id : null,
      name: text(b.name, 120),
      owner_name: text(b.owner_name, 120),
      phone: text(b.phone, 40),
      city: text(b.city, 80),
      notes: text(b.notes, 1000),
      plan,
      monthly_limit: plan === 'custom' ? num(b.monthly_limit) : null,
      price_brl: num(b.price_brl) ?? 0,
      due_day: num(b.due_day),
      paid_until: /^\d{4}-\d{2}-\d{2}$/.test(b.paid_until || '') ? b.paid_until : null,
      auto_block: b.auto_block === true,
      grace_days: num(b.grace_days),
      emails,
    };
    res.json(await rpc('bs_admin_tenant_save', { p_actor: req.actor, p_data: data }));
  }),
);

// Bloquear / desbloquear / apagar
router.post(
  '/tenants/:id/status',
  wrap(async (req, res) => {
    const status = req.body?.status;
    if (!['active', 'blocked', 'deleted'].includes(status)) {
      res.status(400).json({ error: 'Ação inválida.' });
      return;
    }
    res.json(
      await rpc('bs_admin_tenant_status', {
        p_actor: req.actor,
        p_id: tenantId(req),
        p_status: status,
        p_reason: text(req.body?.reason),
      }),
    );
  }),
);

// Registrar pagamento (+1 mês)
router.post(
  '/tenants/:id/paid',
  wrap(async (req, res) => {
    res.json(await rpc('bs_admin_tenant_paid', { p_actor: req.actor, p_id: tenantId(req) }));
  }),
);

router.get(
  '/rankings',
  wrap(async (req, res) => {
    const tenant = UUID.test(String(req.query.tenant || '')) ? req.query.tenant : null;
    const days = Math.min(3650, Math.max(1, Number(req.query.days) || 30));
    res.json(await rpc('bs_admin_rankings', { p_actor: req.actor, p_tenant: tenant, p_days: days }));
  }),
);

router.get(
  '/errors',
  wrap(async (req, res) => {
    res.json(await rpc('bs_admin_errors', { p_actor: req.actor, p_limit: 100 }));
  }),
);

router.get(
  '/audit',
  wrap(async (req, res) => {
    res.json(await rpc('bs_admin_audit', { p_actor: req.actor, p_limit: 150 }));
  }),
);

router.post(
  '/settings',
  wrap(async (req, res) => {
    const n = (v) => (v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v));
    const cost = n(req.body?.cost_per_image_usd);
    const fx = n(req.body?.usd_brl);
    const demo = n(req.body?.demo_limit);
    const demoIp = n(req.body?.demo_ip_daily);
    const demoCap = n(req.body?.demo_daily_cap);
    if ((cost != null && (cost < 0 || cost > 10)) || (fx != null && (fx <= 0 || fx > 100))) {
      res.status(400).json({ error: 'Valores inválidos.' });
      return;
    }
    await rpc('bs_admin_settings_save', {
      p_actor: req.actor,
      p_cost_usd: cost,
      p_usd_brl: fx,
      p_demo_limit: demo == null ? null : Math.round(demo),
      p_demo_ip_daily: demoIp == null ? null : Math.round(demoIp),
      p_demo_daily_cap: demoCap == null ? null : Math.round(demoCap),
    });
    res.json({ ok: true });
  }),
);

export default router;
