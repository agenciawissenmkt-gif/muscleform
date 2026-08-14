-- =============================================================================
-- WISSEN CARS — schema multi-tenant (Supabase / PostgreSQL)
-- =============================================================================
-- Isolamento por tenant: toda tabela de negócio carrega tenant_id e as políticas
-- de RLS liberam apenas as linhas cujo tenant pertence ao usuário autenticado
-- (tenants.owner_id = auth.uid()). O agente de IA no N8N acessa os dados pelas
-- RPCs tenant_context() e api_cars(), executadas com a service role key.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

create table if not exists public.tenants (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references auth.users (id) on delete cascade,
  nome               text not null,
  slug               text not null unique,
  cnpj               text,
  contact_phone      text,
  bot_phone          text,
  google_calendar_id text,
  timezone           text not null default 'America/Sao_Paulo',
  chatwoot_base_url  text,
  chatwoot_token     text,
  onboarding_step    smallint not null default 1,
  onboarding_done    boolean not null default false,
  whatsapp_status    text not null default 'desconectado',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists tenants_owner_id_idx on public.tenants (owner_id);

create table if not exists public.tenant_channels (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  account_id    bigint,
  inbox_id      bigint,
  instance_name text,
  status        text not null default 'pendente',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- um canal por loja (uma central + uma instância de WhatsApp)
create unique index if not exists tenant_channels_tenant_id_key on public.tenant_channels (tenant_id);
create unique index if not exists tenant_channels_account_inbox_idx
  on public.tenant_channels (account_id, inbox_id)
  where account_id is not null and inbox_id is not null;

create table if not exists public.tenant_settings (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null unique references public.tenants (id) on delete cascade,
  prompt_descoberta   text,
  prompt_encantamento text,
  prompt_fechamento   text,
  -- regras comerciais da loja (etapa 1 da implementação)
  accepts_consignment boolean not null default false,
  accepts_trade       boolean not null default true,
  auction_cars        boolean not null default false,
  inspection_report   text,
  partner_banks       text[] not null default '{}',
  ai_schedule_mode    text not null default '24h' check (ai_schedule_mode in ('24h', 'custom')),
  ai_start_time       time,
  ai_end_time         time,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.tenant_google_credentials (
  tenant_id     uuid primary key references public.tenants (id) on delete cascade,
  email         text,
  calendar_id   text not null default 'primary',
  access_token  text,
  refresh_token text,
  scope         text,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.salespeople (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  name              text not null,
  email             text not null,
  role              text not null default 'agent' check (role in ('administrator', 'agent')),
  chatwoot_user_id  bigint,
  created_at        timestamptz not null default now(),
  unique (tenant_id, email)
);

create index if not exists salespeople_tenant_id_idx on public.salespeople (tenant_id);

create table if not exists public.cars (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  brand         text not null,
  model         text not null,
  version       text,
  year          int,
  model_year    int,
  color         text,
  doors         int,
  transmission  text,
  body_type     text,
  fuel          text,
  mileage_km    int,
  price_brl     numeric(12, 2),
  engine        text,
  horsepower    int,
  accepts_trade boolean not null default false,
  description   text,
  status        text not null default 'ativo' check (status in ('ativo', 'reservado', 'vendido')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists cars_tenant_id_idx on public.cars (tenant_id);
create index if not exists cars_status_idx on public.cars (tenant_id, status);

create table if not exists public.car_photos (
  id           uuid primary key default gen_random_uuid(),
  car_id       uuid not null references public.cars (id) on delete cascade,
  url          text not null,
  storage_path text,
  position     int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists car_photos_car_id_idx on public.car_photos (car_id, position);

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'tenants', 'tenant_channels', 'tenant_settings', 'tenant_google_credentials', 'cars'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.touch_updated_at()', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

create or replace function public.owns_tenant(p_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenants t
    where t.id = p_tenant and t.owner_id = auth.uid()
  );
$$;

alter table public.tenants                    enable row level security;
alter table public.tenant_channels            enable row level security;
alter table public.tenant_settings            enable row level security;
alter table public.tenant_google_credentials  enable row level security;
alter table public.salespeople                enable row level security;
alter table public.cars                       enable row level security;
alter table public.car_photos                 enable row level security;

drop policy if exists tenants_owner_all on public.tenants;
create policy tenants_owner_all on public.tenants
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

do $$
declare
  t text;
begin
  foreach t in array array[
    'tenant_channels', 'tenant_settings', 'tenant_google_credentials', 'salespeople', 'cars'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_tenant_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.owns_tenant(tenant_id))
         with check (public.owns_tenant(tenant_id))',
      t || '_tenant_all', t);
  end loop;
end;
$$;

drop policy if exists car_photos_tenant_all on public.car_photos;
create policy car_photos_tenant_all on public.car_photos
  for all to authenticated
  using (exists (select 1 from public.cars c where c.id = car_id and public.owns_tenant(c.tenant_id)))
  with check (exists (select 1 from public.cars c where c.id = car_id and public.owns_tenant(c.tenant_id)));

-- -----------------------------------------------------------------------------
-- Storage: bucket público de fotos dos veículos
-- Caminho dos arquivos: <tenant_id>/<car_id>/<uuid>.<ext>
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('car-photos', 'car-photos', true)
on conflict (id) do update set public = true;

drop policy if exists car_photos_read on storage.objects;
create policy car_photos_read on storage.objects
  for select to public
  using (bucket_id = 'car-photos');

drop policy if exists car_photos_write on storage.objects;
create policy car_photos_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'car-photos'
    and public.owns_tenant(nullif((storage.foldername(name))[1], '')::uuid)
  );

drop policy if exists car_photos_delete on storage.objects;
create policy car_photos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'car-photos'
    and public.owns_tenant(nullif((storage.foldername(name))[1], '')::uuid)
  );

-- -----------------------------------------------------------------------------
-- RPC: tenant_context(account_id, inbox_id)
-- Consumida pelo N8N a cada mensagem recebida para saber de qual loja se trata,
-- com tokens de integração e prompts do agente.
-- -----------------------------------------------------------------------------

create or replace function public.tenant_context(p_account_id bigint, p_inbox_id bigint)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'tenant_id',          t.id,
    'nome',               t.nome,
    'slug',               t.slug,
    'bot_phone',          t.bot_phone,
    'google_calendar_id', coalesce(g.calendar_id, t.google_calendar_id),
    'timezone',           t.timezone,
    'chatwoot_base_url',  t.chatwoot_base_url,
    'chatwoot_token',     t.chatwoot_token,
    'account_id',         c.account_id,
    'inbox_id',           c.inbox_id,
    'prompt_descoberta',  s.prompt_descoberta,
    'prompt_encantamento', s.prompt_encantamento,
    'prompt_fechamento',  s.prompt_fechamento,
    'regras', jsonb_build_object(
      'aceita_consignacao', coalesce(s.accepts_consignment, false),
      'aceita_troca',       coalesce(s.accepts_trade, false),
      'carro_de_leilao',    coalesce(s.auction_cars, false),
      'laudo_cautelar',     s.inspection_report,
      'bancos_parceiros',   coalesce(s.partner_banks, '{}')
    ),
    'horario_ia', jsonb_build_object(
      'modo',  coalesce(s.ai_schedule_mode, '24h'),
      'inicio', s.ai_start_time,
      'fim',    s.ai_end_time
    ),
    'vendedores', coalesce(
      (select jsonb_agg(jsonb_build_object('name', sp.name, 'email', sp.email, 'role', sp.role)
                        order by sp.created_at)
       from public.salespeople sp where sp.tenant_id = t.id),
      '[]'::jsonb)
  )
  from public.tenant_channels c
  join public.tenants t on t.id = c.tenant_id
  left join public.tenant_settings s on s.tenant_id = t.id
  left join public.tenant_google_credentials g on g.tenant_id = t.id
  where c.account_id = p_account_id and c.inbox_id = p_inbox_id
  limit 1;
$$;

-- -----------------------------------------------------------------------------
-- RPC: api_cars(tenant, model, status)
-- Retorna { "cars": [ { ...ficha técnica, "photos": [urls ordenadas] } ] }
-- p_tenant aceita o UUID ou o slug da loja. p_model faz busca parcial em
-- marca/modelo/versão. p_status filtra pelo status (default: 'ativo').
-- -----------------------------------------------------------------------------

create or replace function public.api_cars(
  p_tenant text,
  p_model  text default null,
  p_status text default 'ativo'
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with tenant as (
    select t.id from public.tenants t
    where t.slug = p_tenant
       or (p_tenant ~ '^[0-9a-fA-F-]{36}$' and t.id = p_tenant::uuid)
    limit 1
  )
  select jsonb_build_object('cars', coalesce(jsonb_agg(car order by car->>'created_at' desc), '[]'::jsonb))
  from (
    select jsonb_build_object(
      'id',            c.id,
      'brand',         c.brand,
      'model',         c.model,
      'version',       c.version,
      'year',          c.year,
      'model_year',    c.model_year,
      'color',         c.color,
      'doors',         c.doors,
      'transmission',  c.transmission,
      'body_type',     c.body_type,
      'fuel',          c.fuel,
      'mileage_km',    c.mileage_km,
      'price_brl',     c.price_brl,
      'engine',        c.engine,
      'horsepower',    c.horsepower,
      'accepts_trade', c.accepts_trade,
      'description',   c.description,
      'status',        c.status,
      'created_at',    c.created_at,
      'photos', coalesce(
        (select jsonb_agg(p.url order by p.position, p.created_at)
         from public.car_photos p where p.car_id = c.id),
        '[]'::jsonb)
    ) as car
    from public.cars c
    where c.tenant_id = (select id from tenant)
      and (p_status is null or c.status = p_status)
      and (
        p_model is null or p_model = '' or
        (c.brand || ' ' || c.model || ' ' || coalesce(c.version, '')) ilike '%' || p_model || '%'
      )
  ) s;
$$;

revoke all on function public.tenant_context(bigint, bigint) from public, anon;
revoke all on function public.api_cars(text, text, text) from public, anon;
grant execute on function public.tenant_context(bigint, bigint) to service_role, authenticated;
grant execute on function public.api_cars(text, text, text) to service_role, authenticated;
