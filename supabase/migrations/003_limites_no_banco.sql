-- Limites contra abuso guardados no banco (valem para todas as cópias do
-- servidor na Vercel, não só para a que recebeu o pedido) e demonstração mais
-- justa: 10 imagens por aparelho por mês, com tolerância por internet (IP) e
-- teto diário.

insert into app.config (key, value) values
  ('limit_per_hour', '60'),        -- imagens por hora, por conta Google
  ('limit_per_day', '400'),        -- imagens por dia, por conta Google
  ('parallel_per_account', '3'),   -- imagens sendo geradas ao mesmo tempo, por conta
  ('demo_ip_daily', '30'),         -- imagens de demonstração por internet (IP) a cada 24 h
  ('demo_daily_cap', '200')        -- teto de imagens de demonstração por dia, somando todo mundo
on conflict (key) do nothing;

-- Demonstração: 10 imagens por aparelho a cada mês (antes eram 2 no total)
update app.config set value = '10', updated_at = now(), updated_by = 'migração 003' where key = 'demo_limit';

create index if not exists generations_email_created_idx on app.generations (email, created_at) where email is not null;
create index if not exists generations_demo_created_idx on app.generations (created_at) where demo_id is not null;

create or replace function app.cfg_int(p_key text, p_default int) returns int
language sql stable security definer set search_path = '' as $$
  select coalesce((app.cfg(p_key) #>> '{}')::int, p_default)
$$;

-- Início do dia atual no horário de Brasília
create or replace function app.day_start() returns timestamptz
language sql stable set search_path = '' as $$
  select (date_trunc('day', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo'
$$;

-- Reserva uma geração (confere bloqueio, limite do plano e limites contra abuso;
-- trava o salão para dois pedidos ao mesmo tempo não passarem do limite)
create or replace function public.bs_gen_begin(p_secret text, p_email text, p_mode text, p_cut text, p_color text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user app.tenant_users;
  v_tenant app.tenants;
  v_used int;
  v_running int;
  v_hour int;
  v_day int;
  v_per_hour int := app.cfg_int('limit_per_hour', 60);
  v_per_day int := app.cfg_int('limit_per_day', 400);
  v_id bigint;
begin
  perform app.check_secret(p_secret);
  select * into v_user from app.tenant_users where email = lower(trim(p_email));
  if not found then return jsonb_build_object('ok', false, 'code', 'not_allowed'); end if;
  select * into v_tenant from app.tenants where id = v_user.tenant_id for update;
  if v_tenant.status = 'deleted' then return jsonb_build_object('ok', false, 'code', 'not_allowed'); end if;
  if app.effective_status(v_tenant) = 'blocked' then return jsonb_build_object('ok', false, 'code', 'blocked'); end if;
  if app.effective_status(v_tenant) = 'overdue' then return jsonb_build_object('ok', false, 'code', 'overdue'); end if;
  v_used := app.used_this_month(v_tenant.id);
  if v_used >= v_tenant.monthly_limit then
    return jsonb_build_object('ok', false, 'code', 'quota', 'limit', v_tenant.monthly_limit, 'used', v_used);
  end if;
  -- Contra cliques repetidos e abuso. "Em andamento" há mais de 4 min é de um
  -- servidor que caiu (a função dura no máximo 3 min) e não trava a conta.
  select count(*) filter (where status = 'pending' and created_at > now() - interval '4 minutes'),
         count(*) filter (where created_at > now() - interval '1 hour'),
         count(*)
    into v_running, v_hour, v_day
    from app.generations
   where email = v_user.email and status in ('ok', 'pending', 'canceled') and created_at > now() - interval '1 day';
  if v_running >= app.cfg_int('parallel_per_account', 3) then
    return jsonb_build_object('ok', false, 'code', 'busy');
  end if;
  if v_hour >= v_per_hour then return jsonb_build_object('ok', false, 'code', 'rate_hour', 'limit', v_per_hour); end if;
  if v_day >= v_per_day then return jsonb_build_object('ok', false, 'code', 'rate_day', 'limit', v_per_day); end if;
  insert into app.generations (tenant_id, email, mode, cut_id, color_id)
  values (v_tenant.id, v_user.email, p_mode, nullif(p_cut, ''), nullif(p_color, ''))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'limit', v_tenant.monthly_limit, 'used', v_used + 1);
end $$;

-- Demonstração: até N imagens por aparelho no mês; uma internet (IP) pode ter várias
-- pessoas (4G, wi-fi de empresa), então ela tem um limite maior, por dia; e um
-- teto diário somando todo mundo protege o custo se a demonstração viralizar.
create or replace function public.bs_demo_begin(p_secret text, p_demo_id text, p_ip_hash text, p_mode text, p_cut text, p_color text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_limit int := app.cfg_int('demo_limit', 10);
  v_device int;
  v_running int;
  v_id bigint;
begin
  perform app.check_secret(p_secret);
  if p_demo_id is null or length(p_demo_id) < 16 then return jsonb_build_object('ok', false, 'code', 'not_allowed'); end if;
  perform pg_advisory_xact_lock(hashtext('demo:' || coalesce(p_ip_hash, p_demo_id)));
  select count(*),
         count(*) filter (where status = 'pending' and created_at > now() - interval '4 minutes')
    into v_device, v_running
    from app.generations where demo_id = p_demo_id and status in ('ok', 'pending', 'canceled')
     and created_at >= app.month_start();
  if v_device >= v_limit then return jsonb_build_object('ok', false, 'code', 'demo_used', 'limit', v_limit); end if;
  if v_running > 0 then return jsonb_build_object('ok', false, 'code', 'busy'); end if;
  if (select count(*) from app.generations where demo_id is not null and ip_hash = p_ip_hash
        and status in ('ok', 'pending', 'canceled') and created_at > now() - interval '1 day') >= app.cfg_int('demo_ip_daily', 30) then
    return jsonb_build_object('ok', false, 'code', 'demo_ip');
  end if;
  if (select count(*) from app.generations where demo_id is not null
        and status in ('ok', 'pending', 'canceled') and created_at >= app.day_start()) >= app.cfg_int('demo_daily_cap', 200) then
    return jsonb_build_object('ok', false, 'code', 'demo_busy');
  end if;
  insert into app.generations (demo_id, ip_hash, mode, cut_id, color_id)
  values (p_demo_id, p_ip_hash, p_mode, nullif(p_cut, ''), nullif(p_color, ''))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'limit', v_limit, 'used', v_device + 1);
end $$;

create or replace function public.bs_demo_status(p_secret text, p_demo_id text, p_ip_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_limit int := app.cfg_int('demo_limit', 10); v_used int;
begin
  perform app.check_secret(p_secret);
  select count(*)::int into v_used from app.generations
   where demo_id = p_demo_id and status in ('ok', 'pending', 'canceled') and created_at >= app.month_start();
  return jsonb_build_object('limit', v_limit, 'used', least(v_used, v_limit));
end $$;

-- Painel: números da demonstração de hoje e os novos ajustes
create or replace function public.bs_admin_overview(p_secret text, p_actor text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_cost numeric := (app.cfg('cost_per_image_usd') #>> '{}')::numeric;
  v_fx numeric := (app.cfg('usd_brl') #>> '{}')::numeric;
  v_month timestamptz := app.month_start();
  r jsonb;
begin
  perform app.require_admin(p_secret, p_actor);
  select jsonb_build_object(
    'cost_per_image_usd', v_cost, 'usd_brl', v_fx, 'month_start', v_month,
    'demo_limit', app.cfg_int('demo_limit', 10),
    'demo_ip_daily', app.cfg_int('demo_ip_daily', 30),
    'demo_daily_cap', app.cfg_int('demo_daily_cap', 200),
    'tenants_total', (select count(*) from app.tenants where status <> 'deleted'),
    'tenants_active', (select count(*) from app.tenants t where app.effective_status(t) = 'active'),
    'tenants_blocked', (select count(*) from app.tenants t where app.effective_status(t) in ('blocked', 'overdue')),
    'mrr_brl', (select coalesce(sum(price_brl), 0) from app.tenants t where app.effective_status(t) = 'active'),
    'images_month', (select count(*) from app.generations where tenant_id is not null and status in ('ok', 'canceled') and created_at >= v_month),
    'images_today', (select count(*) from app.generations where tenant_id is not null and status in ('ok', 'canceled')
                      and created_at >= app.day_start()),
    'demo_images_month', (select count(*) from app.generations where demo_id is not null and status in ('ok', 'canceled') and created_at >= v_month),
    'demo_images_today', (select count(*) from app.generations where demo_id is not null and status in ('ok', 'pending', 'canceled')
                           and created_at >= app.day_start()),
    'errors_month', (select count(*) from app.generations where status = 'error' and created_at >= v_month),
    'ai_cost_month_usd', (select coalesce(sum(cost_usd), 0) from app.generations where created_at >= v_month),
    'quota_month', (select coalesce(sum(monthly_limit), 0) from app.tenants t where app.effective_status(t) = 'active'),
    'avg_duration_ms', (select coalesce(round(avg(duration_ms)), 0) from app.generations where status = 'ok' and created_at >= v_month),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'images', n, 'errors', e) order by d), '[]'::jsonb) from (
      select (created_at at time zone 'America/Sao_Paulo')::date d,
             count(*) filter (where status in ('ok', 'canceled')) n,
             count(*) filter (where status = 'error') e
      from app.generations where created_at > now() - interval '30 days' group by 1) x),
    'months', (select coalesce(jsonb_agg(jsonb_build_object('month', m, 'images', n, 'cost_usd', c) order by m), '[]'::jsonb) from (
      select to_char(created_at at time zone 'America/Sao_Paulo', 'YYYY-MM') m,
             count(*) filter (where status in ('ok', 'canceled')) n, coalesce(sum(cost_usd), 0) c
      from app.generations where created_at > now() - interval '12 months' group by 1) y)
  ) into r;
  return r;
end $$;

drop function if exists public.bs_admin_settings_save(text, text, numeric, numeric, integer);
create or replace function public.bs_admin_settings_save(
  p_secret text, p_actor text, p_cost_usd numeric, p_usd_brl numeric, p_demo_limit integer,
  p_demo_ip_daily integer default null, p_demo_daily_cap integer default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform app.require_admin(p_secret, p_actor);
  if p_cost_usd is not null then
    update app.config set value = to_jsonb(p_cost_usd), updated_at = now(), updated_by = lower(p_actor) where key = 'cost_per_image_usd';
  end if;
  if p_usd_brl is not null then
    update app.config set value = to_jsonb(p_usd_brl), updated_at = now(), updated_by = lower(p_actor) where key = 'usd_brl';
  end if;
  if p_demo_limit is not null then
    update app.config set value = to_jsonb(greatest(0, least(p_demo_limit, 20))), updated_at = now(), updated_by = lower(p_actor) where key = 'demo_limit';
  end if;
  if p_demo_ip_daily is not null then
    update app.config set value = to_jsonb(greatest(0, least(p_demo_ip_daily, 1000))), updated_at = now(), updated_by = lower(p_actor) where key = 'demo_ip_daily';
  end if;
  if p_demo_daily_cap is not null then
    update app.config set value = to_jsonb(greatest(0, least(p_demo_daily_cap, 100000))), updated_at = now(), updated_by = lower(p_actor) where key = 'demo_daily_cap';
  end if;
  perform app.audit(lower(p_actor), 'settings_update', null,
    jsonb_build_object('cost_per_image_usd', p_cost_usd, 'usd_brl', p_usd_brl, 'demo_limit', p_demo_limit,
                       'demo_ip_daily', p_demo_ip_daily, 'demo_daily_cap', p_demo_daily_cap));
end $$;

-- Permissões (as mesmas regras da 001): internas fechadas; API só com a senha interna
revoke all on all functions in schema app from public, anon, authenticated;
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'bs\_%' loop
    execute format('revoke all on function %s from public, authenticated', f.sig);
    execute format('grant execute on function %s to anon', f.sig);
  end loop;
end $$;
