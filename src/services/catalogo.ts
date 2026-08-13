import { supabase, supabaseConfigurado, RECADO_SEM_CONEXAO, RECADO_SEM_CONFIGURACAO } from '../lib/supabase';
import type { Categoria, DollSpec, Produto } from '../data/types';

/**
 * Camada de serviços do catálogo.
 *
 * É o único lugar do site que conversa com o Supabase. As páginas e os
 * componentes só chamam estas funções — se um dia a fonte dos dados mudar,
 * muda aqui e mais nada.
 */

/** Colunas do produto — pedimos só o que a loja usa, para a consulta ser leve. */
const COLUNAS_PRODUTO = `
  id, slug, nome, categoria_slug, preco, preco_de, resumo, historia, presente_avo,
  foto, foto_estudio, legenda_foto, altura, materiais, cuidados, tags,
  destaque, novidade, mais_vendida, spec_3d, ordem
`;

const COLUNAS_CATEGORIA = `slug, nome, subtitulo, descricao, emoji, capa_spec, ordem`;

/** Como as linhas chegam do banco (nomes em snake_case). */
interface LinhaProduto {
  id: string;
  slug: string;
  nome: string;
  categoria_slug: string;
  preco: number | string;
  preco_de: number | string | null;
  resumo: string | null;
  historia: string | null;
  presente_avo: string | null;
  foto: string | null;
  foto_estudio: string | null;
  legenda_foto: string | null;
  altura: string | null;
  materiais: string[] | null;
  cuidados: string | null;
  tags: string[] | null;
  destaque: boolean | null;
  novidade: boolean | null;
  mais_vendida: boolean | null;
  spec_3d: DollSpec | null;
  ordem: number | null;
}

interface LinhaCategoria {
  slug: string;
  nome: string;
  subtitulo: string | null;
  descricao: string | null;
  emoji: string | null;
  capa_spec: DollSpec | null;
  ordem: number | null;
}

/** Ilustração de reserva, caso a peça ainda não tenha a receita 3D preenchida. */
const SPEC_PADRAO: DollSpec = {
  tipo: 'menina',
  pele: '#f7ddc9',
  cabelo: '#c8703f',
  cabeloSombra: '#a4562c',
  penteado: 'chiquinhas',
  vestido: '#f9b4c6',
  vestidoDetalhe: '#fff1f5',
  acessorio: 'laco',
  acessorioCor: '#e0708f',
  meias: '#fff1f5',
  coracao: '#e0708f',
};

function numero(valor: number | string | null): number | undefined {
  if (valor === null || valor === '') return undefined;
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

function paraProduto(linha: LinhaProduto): Produto {
  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.nome,
    categoria: linha.categoria_slug,
    preco: numero(linha.preco) ?? 0,
    precoDe: numero(linha.preco_de),
    resumo: linha.resumo ?? '',
    historia: linha.historia ?? '',
    presenteAvo: linha.presente_avo ?? undefined,
    foto: linha.foto ?? undefined,
    fotoEstudio: linha.foto_estudio ?? undefined,
    legendaFoto: linha.legenda_foto ?? undefined,
    altura: linha.altura ?? '',
    materiais: linha.materiais ?? [],
    cuidados: linha.cuidados ?? '',
    tags: linha.tags ?? [],
    destaque: linha.destaque ?? false,
    novidade: linha.novidade ?? false,
    maisVendida: linha.mais_vendida ?? false,
    spec: linha.spec_3d ?? SPEC_PADRAO,
  };
}

function paraCategoria(linha: LinhaCategoria): Categoria {
  return {
    slug: linha.slug,
    nome: linha.nome,
    subtitulo: linha.subtitulo ?? '',
    descricao: linha.descricao ?? '',
    emoji: linha.emoji ?? '🎀',
    capa: linha.capa_spec ?? SPEC_PADRAO,
  };
}

/** Erro com mensagem em português, pronta para mostrar na tela. */
export class ErroCatalogo extends Error {
  readonly causa?: unknown;

  constructor(mensagem: string, causa?: unknown) {
    super(mensagem);
    this.name = 'ErroCatalogo';
    this.causa = causa;
  }
}

function exigirCliente() {
  if (!supabaseConfigurado || !supabase) {
    throw new ErroCatalogo(RECADO_SEM_CONFIGURACAO);
  }
  return supabase;
}

function tratar(erro: unknown): never {
  console.error('[catálogo]', erro);
  throw new ErroCatalogo(RECADO_SEM_CONEXAO, erro);
}

/* --------------------------------- Consultas -------------------------------- */

/** Todas as categorias ativas, na ordem definida no painel. */
export async function buscarCategorias(): Promise<Categoria[]> {
  const cliente = exigirCliente();
  const { data, error } = await cliente
    .from('categorias')
    .select(COLUNAS_CATEGORIA)
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true });

  if (error) tratar(error);
  return (data as LinhaCategoria[]).map(paraCategoria);
}

/** Todos os produtos ativos — é o que alimenta o catálogo inteiro. */
export async function buscarProdutos(): Promise<Produto[]> {
  const cliente = exigirCliente();
  const { data, error } = await cliente
    .from('produtos')
    .select(COLUNAS_PRODUTO)
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true });

  if (error) tratar(error);
  return (data as LinhaProduto[]).map(paraProduto);
}

/** Só os destaques — para a vitrine da home. */
export async function buscarDestaques(limite = 12): Promise<Produto[]> {
  const cliente = exigirCliente();
  const { data, error } = await cliente
    .from('produtos')
    .select(COLUNAS_PRODUTO)
    .eq('ativo', true)
    .eq('destaque', true)
    .order('ordem', { ascending: true })
    .limit(limite);

  if (error) tratar(error);
  return (data as LinhaProduto[]).map(paraProduto);
}

/** As mais amadas do ateliê. */
export async function buscarMaisAmadas(limite = 12): Promise<Produto[]> {
  const cliente = exigirCliente();
  const { data, error } = await cliente
    .from('produtos')
    .select(COLUNAS_PRODUTO)
    .eq('ativo', true)
    .eq('mais_vendida', true)
    .order('ordem', { ascending: true })
    .limit(limite);

  if (error) tratar(error);
  return (data as LinhaProduto[]).map(paraProduto);
}

/** Uma boneca pelo endereço dela. Devolve null quando não existe. */
export async function buscarProdutoPorSlug(slug: string): Promise<Produto | null> {
  const cliente = exigirCliente();
  const { data, error } = await cliente
    .from('produtos')
    .select(COLUNAS_PRODUTO)
    .eq('ativo', true)
    .eq('slug', slug)
    .maybeSingle();

  if (error) tratar(error);
  return data ? paraProduto(data as LinhaProduto) : null;
}

/** Peças de uma coleção. */
export async function buscarPorCategoria(slug: string): Promise<Produto[]> {
  const cliente = exigirCliente();
  const { data, error } = await cliente
    .from('produtos')
    .select(COLUNAS_PRODUTO)
    .eq('ativo', true)
    .eq('categoria_slug', slug)
    .order('ordem', { ascending: true });

  if (error) tratar(error);
  return (data as LinhaProduto[]).map(paraProduto);
}
