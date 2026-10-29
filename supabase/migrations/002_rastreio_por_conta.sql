-- Painel: total de imagens desde o início, última imagem e rastreio por conta Google
-- (por e-mail: imagens no mês, desde o início, falhas e última imagem).

create or replace function app.tenant_json(t app.tenants) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', t.id, 'name', t.name, 'owner_name', t.owner_name, 'phone', t.phone, 'city', t.city, 'notes', t.notes,
    'plan', t.plan, 'monthly_limit', t.monthly_limit, 'price_brl', t.price_brl,
    'status', t.status, 'effective_status', app.effective_status(t), 'status_reason', t.status_reason,
    'due_day', t.due_day, 'paid_until', t.paid_until, 'auto_block', t.auto_block, 'grace_days', t.grace_days,
    'created_at', t.created_at, 'updated_at', t.updated_at,
    'used_month', app.used_this_month(t.id),
    'used_total', (select count(*)::int from app.generations g where g.tenant_id = t.id and g.status in ('ok', 'canceled')),
    'last_image_at', (select max(g.created_at) from app.generations g where g.tenant_id = t.id and g.status = 'ok'),
    'emails', coalesce((select jsonb_agg(jsonb_build_object('email', u.email, 'role', u.role, 'last_login_at', u.last_login_at) order by u.created_at)
                        from app.tenant_users u where u.tenant_id = t.id), '[]'::jsonb)) $$;

create or replace function public.bs_admin_tenant_detail(p_secret text, p_actor text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare t app.tenants; v_month timestamptz := app.month_start();
begin
  perform app.require_admin(p_secret, p_actor);
  select * into t from app.tenants where id = p_id;
  if not found then raise exception 'Salão não encontrado.'; end if;
  return jsonb_build_object(
    'tenant', app.tenant_json(t),
    'months', (select coalesce(jsonb_agg(jsonb_build_object('month', m, 'images', n, 'errors', e, 'cost_usd', c) order by m desc), '[]'::jsonb) from (
      select to_char(created_at at time zone 'America/Sao_Paulo', 'YYYY-MM') m,
             count(*) filter (where status in ('ok', 'canceled')) n, count(*) filter (where status = 'error') e, coalesce(sum(cost_usd), 0) c
      from app.generations where tenant_id = p_id group by 1) x),
    'days', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'images', n) order by d), '[]'::jsonb) from (
      select (created_at at time zone 'America/Sao_Paulo')::date d, count(*) n from app.generations
      where tenant_id = p_id and status in ('ok', 'canceled') and created_at > now() - interval '30 days' group by 1) dd),
    'by_user', (select coalesce(jsonb_agg(jsonb_build_object('email', email, 'images', month_n, 'total', total_n,
                  'errors', err_n, 'last_at', last_at) order by total_n desc), '[]'::jsonb) from (
      select email,
             count(*) filter (where status in ('ok', 'canceled') and created_at >= v_month) month_n,
             count(*) filter (where status in ('ok', 'canceled')) total_n,
             count(*) filter (where status = 'error') err_n,
             max(created_at) filter (where status = 'ok') last_at
      from app.generations where tenant_id = p_id and email is not null group by 1) u),
    'top_cuts', (select coalesce(jsonb_agg(jsonb_build_object('id', cut_id, 'n', n) order by n desc), '[]'::jsonb) from (
      select cut_id, count(*) n from app.generations where tenant_id = p_id and status = 'ok' and cut_id is not null
      group by 1 order by 2 desc limit 5) tc),
    'top_colors', (select coalesce(jsonb_agg(jsonb_build_object('id', color_id, 'n', n) order by n desc), '[]'::jsonb) from (
      select color_id, count(*) n from app.generations where tenant_id = p_id and status = 'ok' and color_id is not null
      group by 1 order by 2 desc limit 5) tco),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object('at', created_at, 'email', email, 'mode', mode, 'cut_id', cut_id,
                 'color_id', color_id, 'status', status, 'error', error, 'duration_ms', duration_ms) order by created_at desc), '[]'::jsonb)
               from (select * from app.generations where tenant_id = p_id order by created_at desc limit 50) r)
  );
end $$;

revoke all on all functions in schema app from public, anon, authenticated;
revoke all on function public.bs_admin_tenant_detail(text, text, uuid) from public, authenticated;
grant execute on function public.bs_admin_tenant_detail(text, text, uuid) to anon;
