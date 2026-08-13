-- ---------------------------------------------------------------------------
-- Sonhos de Brincar — estrutura do catálogo no Supabase
--
-- Rode este arquivo no SQL Editor do Supabase (uma vez), e depois seed.sql
-- para trazer o catálogo inicial.
--
-- Regra de ouro da segurança: a loja usa a chave anônima e só consegue LER
-- peças ativas. Criar, editar e apagar exige estar logado no painel.
-- ---------------------------------------------------------------------------

-- ------------------------------- categorias --------------------------------
create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  nome        text not null,
  subtitulo   text,
  descricao   text,
  emoji       text default '🎀',
  -- receita da ilustração 3D usada na capa da coleção
  capa_spec   jsonb,
  ordem       integer default 0,
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now(),
  editado_em  timestamptz not null default now()
);

-- -------------------------------- produtos ---------------------------------
create table if not exists public.produtos (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  nome           text not null,
  categoria_slug text not null references public.categorias (slug) on update cascade,

  preco          numeric(10, 2) not null check (preco >= 0),
  preco_de       numeric(10, 2) check (preco_de is null or preco_de >= preco),

  resumo         text,                 -- frase curta do cartão
  historia       text,                 -- "A História Dela"
  presente_avo   text,                 -- "Presente de Vó" (opcional, tem texto padrão)
  materiais      text[] default '{}',  -- "Materiais e Acabamento"
  cuidados       text,
  altura         text,                 -- tamanho, ex.: "42 cm"

  foto           text,                 -- foto principal (URL pública)
  foto_estudio   text,                 -- foto de fundo claro, usada no topo da home
  legenda_foto   text,

  tags           text[] default '{}',
  destaque       boolean not null default false,
  novidade       boolean not null default false,
  mais_vendida   boolean not null default false,

  spec_3d        jsonb,                -- receita da ilustração 3D
  ordem          integer default 0,
  ativo          boolean not null default true,

  criado_em      timestamptz not null default now(),
  editado_em     timestamptz not null default now()
);

-- --------------------------------- índices ---------------------------------
-- deixam as consultas da loja rápidas mesmo com o catálogo crescendo
create index if not exists produtos_ativos_idx      on public.produtos (ativo, ordem);
create index if not exists produtos_categoria_idx   on public.produtos (categoria_slug) where ativo;
create index if not exists produtos_destaque_idx    on public.produtos (destaque)       where ativo and destaque;
create index if not exists produtos_amadas_idx      on public.produtos (mais_vendida)   where ativo and mais_vendida;
create index if not exists categorias_ativas_idx    on public.categorias (ativo, ordem);

-- ------------------------- carimbo de data de edição ------------------------
create or replace function public.marcar_edicao()
returns trigger
language plpgsql
as $$
begin
  new.editado_em = now();
  return new;
end;
$$;

drop trigger if exists produtos_editado_em on public.produtos;
create trigger produtos_editado_em
  before update on public.produtos
  for each row execute function public.marcar_edicao();

drop trigger if exists categorias_editado_em on public.categorias;
create trigger categorias_editado_em
  before update on public.categorias
  for each row execute function public.marcar_edicao();

-- ------------------------------- segurança ---------------------------------
alter table public.produtos   enable row level security;
alter table public.categorias enable row level security;

-- A loja (chave anônima) enxerga apenas o que está ativo.
drop policy if exists "loja lê produtos ativos" on public.produtos;
create policy "loja lê produtos ativos"
  on public.produtos for select
  to anon, authenticated
  using (ativo = true);

drop policy if exists "loja lê categorias ativas" on public.categorias;
create policy "loja lê categorias ativas"
  on public.categorias for select
  to anon, authenticated
  using (ativo = true);

-- O painel (usuário logado) administra tudo.
drop policy if exists "painel administra produtos" on public.produtos;
create policy "painel administra produtos"
  on public.produtos for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "painel administra categorias" on public.categorias;
create policy "painel administra categorias"
  on public.categorias for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------- fotos (Storage do Supabase) ----------------------
-- Balde público só de leitura: a loja mostra as fotos, o painel envia.
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos visíveis para todos" on storage.objects;
create policy "fotos visíveis para todos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'produtos');

drop policy if exists "painel envia fotos" on storage.objects;
create policy "painel envia fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produtos');

drop policy if exists "painel troca fotos" on storage.objects;
create policy "painel troca fotos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produtos');

drop policy if exists "painel apaga fotos" on storage.objects;
create policy "painel apaga fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produtos');
