import { supabase, supabaseConfigurado, RECADO_SEM_CONEXAO, RECADO_SEM_CONFIGURACAO } from '../lib/supabase';
import type { Categoria, Produto } from '../data/types';

/**
 * Apresentação das coleções — fica no código de propósito.
 *
 * O painel é a fonte de verdade do catálogo; o emoji e o subtítulo são
 * identidade visual da loja, e o painel não tem esses campos.
 */
interface ApresentacaoColecao {
  subtitulo: string;
  descricao: string;
  emoji: string;
}

const CUIDADOS_PADRAO =
  "Os brinquedos de berço podem ser lavados com sabão neutro ou limpos com um pano úmido, sem nenhum problema. Os demais devem ser limpos apenas com pano úmido, sem muito atrito. Em nenhum dos casos use máquina de lavar, centrífuga ou secadora. E nunca use alvejante: além de ser tóxico para as crianças, estragaria o brinquedo.";

const BONECAS: ApresentacaoColecao = {
  subtitulo: "As clássicas do ateliê",
  descricao:
    "Bonecas costuradas uma a uma, com cabelo de lã e roupinha feita aqui no ateliê. As companheiras de toda a vida.",
  emoji: "🎀",
};

const BERCO: ApresentacaoColecao = {
  subtitulo: "Para o soninho do bebê",
  descricao:
    "Naninhas macias e brinquedos de berço, com o rostinho todo bordado. O primeiro amigo de pano do bebê.",
  emoji: "🌙",
};

const DECORACAO: ApresentacaoColecao = {
  subtitulo: "Detalhes que encantam",
  descricao:
    "Bonecos de decoração para o quartinho: enfeites, lembrancinhas e peças que ficam na estante.",
  emoji: "🏡",
};

/**
 * As três coleções do ateliê. Cada uma aparece aqui sob os slugs que o painel
 * pode usar, para o subtítulo e o emoji continuarem certos se o nome mudar por lá.
 */
const APRESENTACAO_COLECOES: Record<string, ApresentacaoColecao> = {
  "bonecas": BONECAS,
  "bonecas-de-pano": BONECAS,
  "naninhas": BERCO,
  "naninhas-e-brinquedos-de-berco": BERCO,
  "brinquedos-de-berco": BERCO,
  "berco": BERCO,
  "enxoval": BERCO,
  "decoracao": DECORACAO,
  "bonecos-de-decoracao": DECORACAO,
};

/** Usada quando o painel cria uma coleção que o código ainda não conhece. */
const COLECAO_PADRAO: ApresentacaoColecao = {
  subtitulo: 'Do ateliê para o seu colo',
  descricao: 'Peças costuradas à mão, uma a uma, com tecidos escolhidos a dedo.',
  emoji: '🎀',
};


/**
 * Camada de serviços do catálogo.
 *
 * É o único lugar do site que conversa com o Supabase, e ele lê exatamente as
 * tabelas que o painel administrativo escreve — `public.products` e
 * `public.categories`. Nomes de colunas em inglês, como estão no banco; a
 * tradução para o vocabulário da loja acontece aqui, para que nenhuma página
 * precise saber como o banco é por dentro.
 */

/**
 * Pedimos a linha inteira de propósito.
 *
 * O painel ainda está crescendo, e listar coluna por coluna faria a loja quebrar
 * inteira toda vez que um campo fosse renomeado ou criado por lá — o Postgres
 * recusa a consulta com "column does not exist". Com `*`, campo novo aparece
 * sozinho e campo que sai simplesmente fica vazio.
 */
const COLUNAS_PRODUTO = '*';
const COLUNAS_CATEGORIA = 'id, name, slug';

/** Ordem das coleções na loja; as que o código não conhece entram depois. */
const ORDEM_COLECOES = [
  'bonecas',
  'bonecas-de-pano',
  'naninhas',
  'naninhas-e-brinquedos-de-berco',
  'brinquedos-de-berco',
  'berco',
  'enxoval',
  'decoracao',
  'bonecos-de-decoracao',
];

/** Uma peça recém-cadastrada ganha o selo "Novidade" por este tempo. */
const DIAS_DE_NOVIDADE = 45;

/** Como as linhas chegam do banco. Só id, name e slug são tratados como certos. */
interface LinhaProduto {
  id: string;
  name: string;
  slug: string;
  category_id?: string | null;
  sku?: string | null;
  price?: number | string | null;
  sale_price?: number | string | null;
  images?: string[] | null;
  description?: string | null;
  story?: string | null;
  grandma_gift?: string | null;
  materials?: string[] | null;
  size_mini?: string | null;
  size_medio?: string | null;
  size_grande?: string | null;
  is_featured?: boolean | null;
  is_most_loved?: boolean | null;
  created_at?: string | null;
}

interface LinhaCategoria {
  id: string;
  name: string;
  slug: string;
}

/* ------------------------------- conversões ------------------------------- */

function numero(valor: number | string | null | undefined): number | undefined {
  if (valor === null || valor === undefined || valor === '') return undefined;
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

function texto(valor: string | null | undefined): string | undefined {
  const limpo = valor?.trim();
  return limpo ? limpo : undefined;
}

/**
 * Frase curta para o cartão da vitrine. O painel tem um campo só de descrição,
 * então o resumo é a primeira frase dela — o cartão continua com duas linhas.
 */
function resumir(descricao: string | null | undefined): string {
  const inteiro = descricao?.trim().replace(/\s+/g, ' ');
  if (!inteiro) return '';
  if (inteiro.length <= 150) return inteiro;

  const corte = inteiro.slice(0, 150);
  const fim = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('! '), corte.lastIndexOf('? '));
  if (fim > 60) return corte.slice(0, fim + 1);
  return `${corte.slice(0, corte.lastIndexOf(' '))}…`;
}

function ehNova(criadaEm: string | null | undefined): boolean {
  if (!criadaEm) return false;
  const dias = (Date.now() - new Date(criadaEm).getTime()) / 86_400_000;
  return Number.isFinite(dias) && dias >= 0 && dias <= DIAS_DE_NOVIDADE;
}

/** Junta os tamanhos que o painel preencher numa frase só, para o bloco "Medidas". */
function medidas(linha: LinhaProduto): string {
  const partes = [
    texto(linha.size_mini) && `Mini ${texto(linha.size_mini)}`,
    texto(linha.size_medio) && `Médio ${texto(linha.size_medio)}`,
    texto(linha.size_grande) && `Grande ${texto(linha.size_grande)}`,
  ].filter((p): p is string => Boolean(p));

  if (!partes.length) return '';
  if (partes.length === 1) return partes[0].replace(/^(Mini|Médio|Grande) /, '');
  return partes.join(' · ');
}

function paraProduto(linha: LinhaProduto, colecaoPorId: Map<string, string>): Produto {
  const imagens = (linha.images ?? []).filter((url) => typeof url === 'string' && url.trim() !== '');

  // No painel, `price` é o preço cheio e `sale_price` é a promoção. Na loja, o
  // preço em destaque é o que a cliente paga, e o cheio aparece riscado ao lado.
  const cheio = numero(linha.price);
  const promocional = numero(linha.sale_price);
  const preco = promocional ?? cheio ?? 0;
  const precoDe = promocional !== undefined && cheio !== undefined && cheio > promocional ? cheio : undefined;

  const sku = texto(linha.sku);
  const categoria = (linha.category_id && colecaoPorId.get(linha.category_id)) || '';

  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.name,
    categoria,
    preco,
    precoDe,
    resumo: resumir(linha.description),
    historia: texto(linha.story) ?? '',
    presenteAvo: texto(linha.grandma_gift),
    foto: imagens[0],
    // a segunda foto, quando existe, é a que abre a home
    fotoEstudio: imagens[1],
    altura: medidas(linha),
    materiais: (linha.materials ?? []).filter((m) => typeof m === 'string' && m.trim() !== ''),
    cuidados: CUIDADOS_PADRAO,
    // busca do catálogo: dá para procurar pelo código da peça e pela coleção
    tags: [sku, categoria].filter((t): t is string => Boolean(t)),
    destaque: linha.is_featured ?? false,
    novidade: ehNova(linha.created_at),
    maisVendida: linha.is_most_loved ?? false,
  };
}

function paraCategoria(linha: LinhaCategoria): Categoria {
  const visual = APRESENTACAO_COLECOES[linha.slug] ?? COLECAO_PADRAO;
  return {
    slug: linha.slug,
    nome: linha.name,
    subtitulo: visual.subtitulo,
    descricao: visual.descricao,
    emoji: visual.emoji,
  };
}

function ordenarColecoes(a: Categoria, b: Categoria): number {
  const ia = ORDEM_COLECOES.indexOf(a.slug);
  const ib = ORDEM_COLECOES.indexOf(b.slug);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.nome.localeCompare(b.nome, 'pt-BR');
}

/* --------------------------------- erros ---------------------------------- */

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

/* -------------------------------- consultas -------------------------------- */

/** Linhas cruas das coleções — base do menu e do mapa de ids. */
async function lerColecoes(): Promise<LinhaCategoria[]> {
  const cliente = exigirCliente();
  const { data, error } = await cliente.from('categories').select(COLUNAS_CATEGORIA);
  if (error) tratar(error);
  return (data ?? []) as LinhaCategoria[];
}

function mapaDeColecoes(linhas: LinhaCategoria[]): Map<string, string> {
  return new Map(linhas.map((l) => [l.id, l.slug]));
}

function montarConsulta() {
  const cliente = exigirCliente();
  return cliente.from('products').select(COLUNAS_PRODUTO).eq('is_active', true);
}

/** Todas as coleções cadastradas no painel, na ordem da loja. */
export async function buscarCategorias(): Promise<Categoria[]> {
  return (await lerColecoes()).map(paraCategoria).sort(ordenarColecoes);
}

/** Todas as peças ativas — é o que alimenta o catálogo inteiro. */
export async function buscarProdutos(): Promise<Produto[]> {
  const colecoes = await lerColecoes();
  const { data, error } = await montarConsulta().order('created_at', { ascending: false });

  if (error) tratar(error);
  return ((data ?? []) as LinhaProduto[]).map((l) => paraProduto(l, mapaDeColecoes(colecoes)));
}

/** Só os destaques — para a vitrine da home. */
export async function buscarDestaques(limite = 12): Promise<Produto[]> {
  const colecoes = await lerColecoes();
  const { data, error } = await montarConsulta()
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) tratar(error);
  return ((data ?? []) as LinhaProduto[]).map((l) => paraProduto(l, mapaDeColecoes(colecoes)));
}

/** As mais amadas do ateliê. */
export async function buscarMaisAmadas(limite = 12): Promise<Produto[]> {
  const colecoes = await lerColecoes();
  const { data, error } = await montarConsulta()
    .eq('is_most_loved', true)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) tratar(error);
  return ((data ?? []) as LinhaProduto[]).map((l) => paraProduto(l, mapaDeColecoes(colecoes)));
}

/** Uma peça pelo endereço dela. Devolve null quando não existe ou está inativa. */
export async function buscarProdutoPorSlug(slug: string): Promise<Produto | null> {
  const colecoes = await lerColecoes();
  const { data, error } = await montarConsulta().eq('slug', slug).maybeSingle();

  if (error) tratar(error);
  return data ? paraProduto(data as LinhaProduto, mapaDeColecoes(colecoes)) : null;
}

/** Peças de uma coleção, pelo slug da coleção. */
export async function buscarPorCategoria(slug: string): Promise<Produto[]> {
  const colecoes = await lerColecoes();
  const id = colecoes.find((c) => c.slug === slug)?.id;
  if (!id) return [];

  const { data, error } = await montarConsulta()
    .eq('category_id', id)
    .order('created_at', { ascending: false });

  if (error) tratar(error);
  return ((data ?? []) as LinhaProduto[]).map((l) => paraProduto(l, mapaDeColecoes(colecoes)));
}
