-- Beauty and self — banco do app e do painel empresarial.
-- As tabelas ficam no schema "app" (fora da API pública do Supabase). O servidor
-- do app só acessa por funções que exigem a senha interna (BS_SECRET): o
-- navegador nunca fala direto com o banco.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists app;
revoke all on schema app from public, anon, authenticated;

-- ---------- Configuração ----------

create table app.config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- Senha interna: guardamos só o hash (sha256) da senha que está na Vercel.
insert into app.config (key, value) values
  ('server_secret_sha256', '"8ef078cf1766a22a2c213dcb8ac2c00a7d8eb6f712b34b4900614ec8e2d1aa43"'),
  ('cost_per_image_usd', '0.01'),
  ('usd_brl', '5.6'),
  ('demo_limit', '2'),
  ('default_grace_days', '5');

create table app.admins (
  email text primary key check (email = lower(email)),
  name text,
  created_at timestamptz not null default now()
);
insert into app.admins (email, name) values
  ('charneskitiago123@gmail.com', 'Thiago'),
  ('agenciawissenmkt@gmail.com', 'Agência Wissen');

-- ---------- Clientes (salões) ----------

create table app.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 120),
  owner_name text,
  phone text,
  city text,
  notes text,
  plan text not null default '500' check (plan in ('500', '1000', 'custom')),
  monthly_limit integer not null default 500 check (monthly_limit between 0 and 1000000),
  price_brl numeric(10, 2) not null default 0 check (price_brl >= 0),
  status text not null default 'active' check (status in ('active', 'blocked', 'deleted')),
  status_reason text,
  due_day smallint check (due_day between 1 and 28),
  paid_until date,
  auto_block boolean not null default false,
  grace_days smallint not null default 5 check (grace_days between 0 and 60),
  created_at timestamptz not null default now(),
  created_by text,
  updated_at timestamptz not null default now()
);

-- Contas Google liberadas (cada e-mail pertence a um salão)
create table app.tenant_users (
  email text primary key check (email = lower(email) and email like '%@%'),
  tenant_id uuid not null references app.tenants (id) on delete cascade,
  name text,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  first_login_at timestamptz,
  last_login_at timestamptz
);
create index on app.tenant_users (tenant_id);

-- ---------- Uso ----------

create table app.generations (
  id bigint generated always as identity primary key,
  tenant_id uuid references app.tenants (id) on delete set null,
  email text,
  demo_id text,
  ip_hash text,
  mode text not null check (mode in ('cut', 'color', 'both')),
  cut_id text,
  color_id text,
  status text not null default 'pending' check (status in ('pending', 'ok', 'error', 'canceled')),
  error text,
  duration_ms integer,
  cost_usd numeric(10, 4),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index on app.generations (tenant_id, created_at);
create index on app.generations (demo_id);
create index on app.generations (ip_hash, created_at) where demo_id is not null;
create index on app.generations (status, created_at);

create table app.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null,
  tenant_id uuid,
  details jsonb
);

create table app.auth_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  email text,
  outcome text not null,
  ip_hash text
);

alter table app.config enable row level security;
alter table app.admins enable row level security;
alter table app.tenants enable row level security;
alter table app.tenant_users enable row level security;
alter table app.generations enable row level security;
alter table app.audit_log enable row level security;
alter table app.auth_events enable row level security;

-- ---------- Funções internas ----------

create or replace function app.cfg(p_key text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select value from app.config where key = p_key
$$;

create or replace function app.check_secret(p_secret text) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_secret is null or encode(extensions.digest(p_secret, 'sha256'), 'hex') <> (app.cfg('server_secret_sha256') #>> '{}') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;

-- Início do mês atual no horário de Brasília
create or replace function app.month_start(p_at timestamptz default now()) returns timestamptz
language sql stable set search_path = '' as $$
  select (date_trunc('month', p_at at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo'
$$;

-- Imagens que contam no plano: geradas, em andamento e canceladas no meio (já custaram)
create or replace function app.used_this_month(p_tenant uuid) returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::int from app.generations
  where tenant_id = p_tenant and status in ('ok', 'pending', 'canceled') and created_at >= app.month_start()
$$;

-- Bloqueio automático por falta de pagamento (quando ligado no cliente)
create or replace function app.effective_status(t app.tenants) returns text
language sql stable set search_path = '' as $$
  select case
    when t.status <> 'active' then t.status
    when t.auto_block and t.paid_until is not null
      and (now() at time zone 'America/Sao_Paulo')::date > t.paid_until + t.grace_days then 'overdue'
    else 'active'
  end
$$;

create or replace function app.tenant_json(t app.tenants) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', t.id, 'name', t.name, 'owner_name', t.owner_name, 'phone', t.phone, 'city', t.city, 'notes', t.notes,
    'plan', t.plan, 'monthly_limit', t.monthly_limit, 'price_brl', t.price_brl,
    'status', t.status, 'effective_status', app.effective_status(t), 'status_reason', t.status_reason,
    'due_day', t.due_day, 'paid_until', t.paid_until, 'auto_block', t.auto_block, 'grace_days', t.grace_days,
    'created_at', t.created_at, 'updated_at', t.updated_at,
    'used_month', app.used_this_month(t.id),
    'emails', coalesce((select jsonb_agg(jsonb_build_object('email', u.email, 'role', u.role, 'last_login_at', u.last_login_at) order by u.created_at)
                        from app.tenant_users u where u.tenant_id = t.id), '[]'::jsonb)
  )
$$;

create or replace function app.audit(p_actor text, p_action text, p_tenant uuid, p_details jsonb) returns void
language sql security definer set search_path = '' as $$
  insert into app.audit_log (actor, action, tenant_id, details) values (p_actor, p_action, p_tenant, p_details)
$$;

-- ---------- API do servidor do app (todas exigem a senha interna) ----------

-- Quem é este e-mail? (administrador e/ou usuário de um salão)
create or replace function public.bs_whoami(p_secret text, p_email text, p_login boolean default false, p_ip_hash text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(p_email));
  v_admin boolean;
  v_user app.tenant_users;
  v_tenant app.tenants;
  v_outcome text;
begin
  perform app.check_secret(p_secret);
  v_admin := exists (select 1 from app.admins where email = v_email);
  select * into v_user from app.tenant_users where email = v_email;
  if found then
    select * into v_tenant from app.tenants where id = v_user.tenant_id;
  end if;
  if p_login then
    v_outcome := case
      when v_tenant.id is not null and v_tenant.status <> 'deleted' then 'ok'
      when v_admin then 'admin'
      else 'denied' end;
    insert into app.auth_events (email, outcome, ip_hash) values (v_email, v_outcome, p_ip_hash);
    if v_tenant.id is not null then
      update app.tenant_users set last_login_at = now(), first_login_at = coalesce(first_login_at, now()) where email = v_email;
    end if;
  end if;
  return jsonb_build_object(
    'email', v_email,
    'is_admin', v_admin,
    'tenant', case when v_tenant.id is null or v_tenant.status = 'deleted' then null else jsonb_build_object(
      'id', v_tenant.id, 'name', v_tenant.name, 'status', app.effective_status(v_tenant),
      'monthly_limit', v_tenant.monthly_limit, 'used_month', app.used_this_month(v_tenant.id)) end
  );
end $$;

-- Reserva uma geração (confere bloqueio e limite do plano; trava o salão para não estourar o limite)
create or replace function public.bs_gen_begin(p_secret text, p_email text, p_mode text, p_cut text, p_color text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user app.tenant_users;
  v_tenant app.tenants;
  v_used int;
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
  insert into app.generations (tenant_id, email, mode, cut_id, color_id)
  values (v_tenant.id, v_user.email, p_mode, nullif(p_cut, ''), nullif(p_color, ''))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'limit', v_tenant.monthly_limit, 'used', v_used + 1);
end $$;

-- Demonstração: até N imagens por aparelho e por internet (IP) a cada 30 dias
create or replace function public.bs_demo_begin(p_secret text, p_demo_id text, p_ip_hash text, p_mode text, p_cut text, p_color text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_limit int := (app.cfg('demo_limit') #>> '{}')::int;
  v_used int;
  v_id bigint;
begin
  perform app.check_secret(p_secret);
  if p_demo_id is null or length(p_demo_id) < 16 then return jsonb_build_object('ok', false, 'code', 'not_allowed'); end if;
  perform pg_advisory_xact_lock(hashtext('demo:' || coalesce(p_ip_hash, p_demo_id)));
  select greatest(
    (select count(*) from app.generations where demo_id = p_demo_id and status in ('ok', 'pending', 'canceled')),
    (select count(*) from app.generations where demo_id is not null and ip_hash = p_ip_hash
       and status in ('ok', 'pending', 'canceled') and created_at > now() - interval '30 days')
  )::int into v_used;
  if v_used >= v_limit then return jsonb_build_object('ok', false, 'code', 'demo_used', 'limit', v_limit); end if;
  insert into app.generations (demo_id, ip_hash, mode, cut_id, color_id)
  values (p_demo_id, p_ip_hash, p_mode, nullif(p_cut, ''), nullif(p_color, ''))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'limit', v_limit, 'used', v_used + 1);
end $$;

create or replace function public.bs_demo_status(p_secret text, p_demo_id text, p_ip_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_limit int := (app.cfg('demo_limit') #>> '{}')::int; v_used int;
begin
  perform app.check_secret(p_secret);
  select greatest(
    (select count(*) from app.generations where demo_id = p_demo_id and status in ('ok', 'pending', 'canceled')),
    (select count(*) from app.generations where demo_id is not null and ip_hash = p_ip_hash
       and status in ('ok', 'pending', 'canceled') and created_at > now() - interval '30 days')
  )::int into v_used;
  return jsonb_build_object('limit', v_limit, 'used', least(v_used, v_limit));
end $$;

-- Fecha a geração (ok / erro / cancelada)
create or replace function public.bs_gen_finish(p_secret text, p_id bigint, p_status text, p_error text, p_duration_ms integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform app.check_secret(p_secret);
  update app.generations set
    status = p_status,
    error = left(p_error, 500),
    duration_ms = p_duration_ms,
    cost_usd = case when p_status in ('ok', 'canceled') then (app.cfg('cost_per_image_usd') #>> '{}')::numeric else 0 end,
    finished_at = now()
  where id = p_id and status = 'pending';
end $$;

-- ---------- API do painel empresarial (o servidor confere que é administrador) ----------

create or replace function app.require_admin(p_secret text, p_actor text) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  perform app.check_secret(p_secret);
  if not exists (select 1 from app.admins where email = lower(trim(p_actor))) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;

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
    'demo_limit', (app.cfg('demo_limit') #>> '{}')::int,
    'tenants_total', (select count(*) from app.tenants where status <> 'deleted'),
    'tenants_active', (select count(*) from app.tenants t where app.effective_status(t) = 'active'),
    'tenants_blocked', (select count(*) from app.tenants t where app.effective_status(t) in ('blocked', 'overdue')),
    'mrr_brl', (select coalesce(sum(price_brl), 0) from app.tenants t where app.effective_status(t) = 'active'),
    'images_month', (select count(*) from app.generations where tenant_id is not null and status in ('ok', 'canceled') and created_at >= v_month),
    'images_today', (select count(*) from app.generations where tenant_id is not null and status in ('ok', 'canceled')
                      and created_at >= (date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')),
    'demo_images_month', (select count(*) from app.generations where demo_id is not null and status in ('ok', 'canceled') and created_at >= v_month),
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

create or replace function public.bs_admin_tenants(p_secret text, p_actor text)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform app.require_admin(p_secret, p_actor);
  return coalesce((select jsonb_agg(app.tenant_json(t) order by t.created_at desc) from app.tenants t where t.status <> 'deleted'), '[]'::jsonb);
end $$;

-- Cria ou atualiza um salão e as contas Google liberadas
create or replace function public.bs_admin_tenant_save(p_secret text, p_actor text, p_data jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := nullif(p_data ->> 'id', '')::uuid;
  v_plan text := coalesce(p_data ->> 'plan', '500');
  v_limit int := case v_plan when '500' then 500 when '1000' then 1000 else (p_data ->> 'monthly_limit')::int end;
  v_emails text[];
  v_email text;
  v_conflict text;
  t app.tenants;
begin
  perform app.require_admin(p_secret, p_actor);
  if coalesce(trim(p_data ->> 'name'), '') = '' then raise exception 'Informe o nome do salão.'; end if;
  if v_limit is null or v_limit < 0 then raise exception 'Informe o limite de imagens por mês.'; end if;
  select array_agg(distinct lower(trim(e))) into v_emails
  from jsonb_array_elements_text(coalesce(p_data -> 'emails', '[]'::jsonb)) e where trim(e) <> '';
  if v_emails is null or cardinality(v_emails) = 0 then raise exception 'Informe pelo menos um e-mail Google.'; end if;
  foreach v_email in array v_emails loop
    if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail inválido: %', v_email; end if;
  end loop;
  select u.email into v_conflict from app.tenant_users u
  where u.email = any (v_emails) and (v_id is null or u.tenant_id <> v_id) limit 1;
  if v_conflict is not null then raise exception 'O e-mail % já está em outro salão.', v_conflict; end if;

  if v_id is null then
    insert into app.tenants (name, owner_name, phone, city, notes, plan, monthly_limit, price_brl, due_day, paid_until, auto_block, grace_days, created_by)
    values (trim(p_data ->> 'name'), p_data ->> 'owner_name', p_data ->> 'phone', p_data ->> 'city', p_data ->> 'notes',
            v_plan, v_limit, coalesce((p_data ->> 'price_brl')::numeric, 0), nullif(p_data ->> 'due_day', '')::smallint,
            nullif(p_data ->> 'paid_until', '')::date, coalesce((p_data ->> 'auto_block')::boolean, false),
            coalesce(nullif(p_data ->> 'grace_days', '')::smallint, (app.cfg('default_grace_days') #>> '{}')::smallint), lower(p_actor))
    returning * into t;
    perform app.audit(lower(p_actor), 'tenant_create', t.id, p_data);
  else
    update app.tenants set
      name = trim(p_data ->> 'name'), owner_name = p_data ->> 'owner_name', phone = p_data ->> 'phone',
      city = p_data ->> 'city', notes = p_data ->> 'notes', plan = v_plan, monthly_limit = v_limit,
      price_brl = coalesce((p_data ->> 'price_brl')::numeric, 0), due_day = nullif(p_data ->> 'due_day', '')::smallint,
      paid_until = nullif(p_data ->> 'paid_until', '')::date, auto_block = coalesce((p_data ->> 'auto_block')::boolean, false),
      grace_days = coalesce(nullif(p_data ->> 'grace_days', '')::smallint, grace_days), updated_at = now()
    where id = v_id and status <> 'deleted'
    returning * into t;
    if not found then raise exception 'Salão não encontrado.'; end if;
    perform app.audit(lower(p_actor), 'tenant_update', t.id, p_data);
  end if;
  delete from app.tenant_users where tenant_id = t.id and email <> all (v_emails);
  insert into app.tenant_users (email, tenant_id) select unnest(v_emails), t.id on conflict (email) do nothing;
  return app.tenant_json(t);
end $$;

-- Bloquear / desbloquear / apagar (apagado = ninguém daquele salão entra mais)
create or replace function public.bs_admin_tenant_status(p_secret text, p_actor text, p_id uuid, p_status text, p_reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare t app.tenants;
begin
  perform app.require_admin(p_secret, p_actor);
  if p_status not in ('active', 'blocked', 'deleted') then raise exception 'Status inválido.'; end if;
  update app.tenants set status = p_status, status_reason = nullif(trim(p_reason), ''), updated_at = now()
  where id = p_id and status <> 'deleted' returning * into t;
  if not found then raise exception 'Salão não encontrado.'; end if;
  if p_status = 'deleted' then
    delete from app.tenant_users where tenant_id = p_id;
  end if;
  perform app.audit(lower(p_actor), 'tenant_' || p_status, p_id, jsonb_build_object('reason', p_reason));
  return app.tenant_json(t);
end $$;

-- Registrar pagamento: estende o "pago até" em 1 mês (e desbloqueia se estava em atraso)
create or replace function public.bs_admin_tenant_paid(p_secret text, p_actor text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare t app.tenants; v_today date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  perform app.require_admin(p_secret, p_actor);
  update app.tenants set
    paid_until = (greatest(coalesce(paid_until, v_today), v_today) + interval '1 month')::date, updated_at = now()
  where id = p_id and status <> 'deleted' returning * into t;
  if not found then raise exception 'Salão não encontrado.'; end if;
  perform app.audit(lower(p_actor), 'tenant_paid', p_id, jsonb_build_object('paid_until', t.paid_until));
  return app.tenant_json(t);
end $$;

-- Detalhe de um salão: uso por mês, cortes/cores mais usados, erros recentes
create or replace function public.bs_admin_tenant_detail(p_secret text, p_actor text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare t app.tenants;
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
    'by_user', (select coalesce(jsonb_agg(jsonb_build_object('email', email, 'images', n) order by n desc), '[]'::jsonb) from (
      select email, count(*) n from app.generations where tenant_id = p_id and status in ('ok', 'canceled')
        and created_at >= app.month_start() group by 1) u),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object('at', created_at, 'email', email, 'mode', mode, 'cut_id', cut_id,
                 'color_id', color_id, 'status', status, 'error', error, 'duration_ms', duration_ms) order by created_at desc), '[]'::jsonb)
               from (select * from app.generations where tenant_id = p_id order by created_at desc limit 50) r)
  );
end $$;

-- Rankings: cortes, cores e combinações mais usados (todos os salões ou um salão)
create or replace function public.bs_admin_rankings(p_secret text, p_actor text, p_tenant uuid, p_days integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_from timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 3650)));
begin
  perform app.require_admin(p_secret, p_actor);
  return jsonb_build_object(
    'cuts', (select coalesce(jsonb_agg(jsonb_build_object('id', cut_id, 'n', n) order by n desc), '[]'::jsonb) from (
      select cut_id, count(*) n from app.generations where cut_id is not null and status = 'ok' and created_at >= v_from
        and (p_tenant is null or tenant_id = p_tenant) group by 1 order by 2 desc limit 30) a),
    'colors', (select coalesce(jsonb_agg(jsonb_build_object('id', color_id, 'n', n) order by n desc), '[]'::jsonb) from (
      select color_id, count(*) n from app.generations where color_id is not null and status = 'ok' and created_at >= v_from
        and (p_tenant is null or tenant_id = p_tenant) group by 1 order by 2 desc limit 30) b),
    'combos', (select coalesce(jsonb_agg(jsonb_build_object('cut', cut_id, 'color', color_id, 'n', n) order by n desc), '[]'::jsonb) from (
      select cut_id, color_id, count(*) n from app.generations where cut_id is not null and color_id is not null and status = 'ok'
        and created_at >= v_from and (p_tenant is null or tenant_id = p_tenant) group by 1, 2 order by 3 desc limit 30) c),
    'modes', (select coalesce(jsonb_object_agg(mode, n), '{}'::jsonb) from (
      select mode, count(*) n from app.generations where status = 'ok' and created_at >= v_from
        and (p_tenant is null or tenant_id = p_tenant) group by 1) d),
    'tenants', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'n', n) order by n desc), '[]'::jsonb) from (
      select t.id, t.name, count(g.id) n from app.tenants t join app.generations g on g.tenant_id = t.id
      where g.status in ('ok', 'canceled') and g.created_at >= v_from group by 1, 2 order by 3 desc limit 30) e)
  );
end $$;

-- Falhas na geração de imagens
create or replace function public.bs_admin_errors(p_secret text, p_actor text, p_limit integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform app.require_admin(p_secret, p_actor);
  return jsonb_build_object(
    'recent', (select coalesce(jsonb_agg(jsonb_build_object('at', g.created_at, 'tenant', t.name, 'email', g.email, 'demo', g.demo_id is not null,
                 'mode', g.mode, 'cut_id', g.cut_id, 'color_id', g.color_id, 'error', g.error, 'duration_ms', g.duration_ms) order by g.created_at desc), '[]'::jsonb)
               from (select * from app.generations where status = 'error' order by created_at desc limit greatest(1, least(coalesce(p_limit, 100), 500))) g
               left join app.tenants t on t.id = g.tenant_id),
    'by_message', (select coalesce(jsonb_agg(jsonb_build_object('error', error, 'n', n) order by n desc), '[]'::jsonb) from (
      select error, count(*) n from app.generations where status = 'error' and created_at > now() - interval '30 days' group by 1 order by 2 desc limit 20) m)
  );
end $$;

create or replace function public.bs_admin_audit(p_secret text, p_actor text, p_limit integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform app.require_admin(p_secret, p_actor);
  return jsonb_build_object(
    'actions', (select coalesce(jsonb_agg(jsonb_build_object('at', a.at, 'actor', a.actor, 'action', a.action, 'tenant', t.name, 'details', a.details) order by a.at desc), '[]'::jsonb)
                from (select * from app.audit_log order by at desc limit greatest(1, least(coalesce(p_limit, 100), 500))) a
                left join app.tenants t on t.id = a.tenant_id),
    'logins', (select coalesce(jsonb_agg(jsonb_build_object('at', at, 'email', email, 'outcome', outcome) order by at desc), '[]'::jsonb)
               from (select * from app.auth_events order by at desc limit 100) l)
  );
end $$;

create or replace function public.bs_admin_settings_save(p_secret text, p_actor text, p_cost_usd numeric, p_usd_brl numeric, p_demo_limit integer)
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
  perform app.audit(lower(p_actor), 'settings_update', null,
    jsonb_build_object('cost_per_image_usd', p_cost_usd, 'usd_brl', p_usd_brl, 'demo_limit', p_demo_limit));
end $$;

-- Permissões: funções internas fechadas; as da API só funcionam com a senha interna
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
