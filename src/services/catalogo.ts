import { supabase, supabaseConfigurado, RECADO_SEM_CONEXAO, RECADO_SEM_CONFIGURACAO } from '../lib/supabase';
import type { Categoria, DollSpec, Produto } from '../data/types';

/**
 * Apresentação das coleções — fica no código de propósito.
 *
 * O painel é a fonte de verdade do catálogo; o emoji, o subtítulo e a ilustração
 * de capa são identidade visual da loja, e o painel não tem esses campos.
 */
interface ApresentacaoColecao {
  subtitulo: string;
  descricao: string;
  emoji: string;
  capa: DollSpec;
}

const CUIDADOS_PADRAO =
  "Lavar à mão, com sabão neutro e água fria — o tecido é resistente e não desbota. Secar à sombra, sem torcer. Não usar máquina, alvejante nem secadora. O cabelo pode ser penteado com os dedos: os fios são chuleados fio a fio e não soltam.";

const APRESENTACAO_COLECOES: Record<string, ApresentacaoColecao> = {
  "bonecas-de-pano": {
    subtitulo: "As clássicas do ateliê",
    descricao: "Bonecas costuradas à mão, com rostinho bordado, cabelo de lã e vestidinho de algodão. As companheiras de toda a vida.",
    emoji: "🎀",
    capa: {"tipo":"menina","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"chiquinhas","vestido":"#f9b4c6","vestidoDetalhe":"#fff1f5","acessorio":"laco","acessorioCor":"#e0708f","meias":"#fff1f5","sardas":true,"coracao":"#e0708f"},
  },
  "meninos": {
    subtitulo: "Para os meninos também",
    descricao: "Bonecos costurados com o mesmo capricho das bonecas: camisa de botão, bermuda, tênis de cadarço e aquele cabelo que ninguém consegue pentear.",
    emoji: "⚓",
    capa: {"tipo":"menina","pele":"#f7ddc9","cabelo":"#c65a22","cabeloSombra":"#a04516","penteado":"cacheado","vestido":"#d92a3f","vestidoDetalhe":"#fdf6ec","acessorio":"nenhum","acessorioCor":"#3c5a80","meias":"#fdf6ec","olhos":"abertos","roupa":"conjunto","calca":"#c9cfd6","sapatos":"#3c5a80","sardas":true},
  },
  "bailarinas": {
    subtitulo: "Tutus de tule e pontinhas",
    descricao: "Bonecas bailarinas com saia de tule, sapatilhas bordadas e fitinhas de cetim. Um giro de sonho na estante.",
    emoji: "🩰",
    capa: {"tipo":"bailarina","pele":"#e6bb98","cabelo":"#3f2a20","cabeloSombra":"#2a1a13","penteado":"coque","vestido":"#ffd0dc","vestidoDetalhe":"#fffafb","acessorio":"coroa","acessorioCor":"#f1c27a","meias":"#ffe3ea","coracao":"#f191ab"},
  },
  "ursinhos": {
    subtitulo: "Abraço garantido",
    descricao: "Ursinhos, coelhinhas e amigos de pelúcia macia, com laços de cetim e enchimento antialérgico. Feitos para apertar.",
    emoji: "🧸",
    capa: {"tipo":"urso","pele":"#c99a6b","cabelo":"#a97a4e","cabeloSombra":"#8a6039","penteado":"curto","vestido":"#ffe3ea","vestidoDetalhe":"#fffafb","acessorio":"laco","acessorioCor":"#f191ab","meias":"#fdf6ec","coracao":"#e0708f"},
  },
  "naninhas": {
    subtitulo: "Para o soninho do bebê",
    descricao: "Naninhas de plush macio, kits maternidade e enxoval do ateliê. O primeiro amigo de pano do bebê.",
    emoji: "🌙",
    capa: {"tipo":"naninha","pele":"#f7ddc9","cabelo":"#e8c27a","cabeloSombra":"#c9a25c","penteado":"curto","vestido":"#e2dcf6","vestidoDetalhe":"#fffafb","acessorio":"nenhum","acessorioCor":"#cdeee0","meias":"#fffafb","coracao":"#f191ab"},
  },
  "decoracao": {
    subtitulo: "Detalhes que encantam",
    descricao: "Móbiles, bonequinhas de porta-maternidade, mini bonecas de lembrancinha e enfeites para o quartinho.",
    emoji: "🏡",
    capa: {"tipo":"bebe","pele":"#e6bb98","cabelo":"#b5651d","cabeloSombra":"#8f4d13","penteado":"curto","vestido":"#fdf6ec","vestidoDetalhe":"#f9b4c6","acessorio":"flor","acessorioCor":"#f191ab","meias":"#fff1f5","coracao":"#f191ab"},
  },
  "bonecas": {
    subtitulo: "As clássicas do ateliê",
    descricao: "Bonecas costuradas à mão, com rostinho bordado, cabelo de lã e vestidinho de algodão. As companheiras de toda a vida.",
    emoji: "🎀",
    capa: {"tipo":"menina","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"chiquinhas","vestido":"#f9b4c6","vestidoDetalhe":"#fff1f5","acessorio":"laco","acessorioCor":"#e0708f","meias":"#fff1f5","sardas":true,"coracao":"#e0708f"},
  },
  "enxoval": {
    subtitulo: "Enxoval do ateliê",
    descricao: "Kits maternidade, porta-maternidade e peças de enxoval costuradas com o mesmo capricho das bonecas.",
    emoji: "🧺",
    capa: {"tipo":"naninha","pele":"#f7ddc9","cabelo":"#e8c27a","cabeloSombra":"#c9a25c","penteado":"curto","vestido":"#e2dcf6","vestidoDetalhe":"#fffafb","acessorio":"nenhum","acessorioCor":"#cdeee0","meias":"#fffafb","coracao":"#f191ab"},
  },
};

/** Usada quando o painel cria uma coleção que o código ainda não conhece. */
const COLECAO_PADRAO: ApresentacaoColecao = {
  subtitulo: 'Do ateliê para o seu colo',
  descricao: 'Peças costuradas à mão, uma a uma, com tecidos escolhidos a dedo.',
  emoji: '🎀',
  capa: {"tipo":"menina","pele":"#f7ddc9","cabelo":"#c8703f","cabeloSombra":"#a4562c","penteado":"chiquinhas","vestido":"#f9b4c6","vestidoDetalhe":"#fff1f5","acessorio":"laco","acessorioCor":"#e0708f","meias":"#fff1f5","sardas":true,"coracao":"#e0708f"},
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
  'meninos',
  'bailarinas',
  'ursinhos',
  'naninhas',
  'enxoval',
  'decoracao',
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

/**
 * Ilustração 3D mostrada quando a peça ainda não tem foto. A paleta sai do
 * slug — sempre a mesma para o mesmo slug, nunca uma imagem quebrada.
 */
const PELES = ['#f7ddc9', '#e6bb98', '#c58f68', '#8d5a3c'];
const CABELOS: [string, string][] = [
  ['#c8703f', '#a4562c'],
  ['#3f2a20', '#2a1a13'],
  ['#e2c391', '#c2a071'],
  ['#8a5a34', '#6b431f'],
];
const VESTIDOS: [string, string][] = [
  ['#f9b4c6', '#fff1f5'],
  ['#e2dcf6', '#fffafb'],
  ['#cdeee0', '#fffafb'],
  ['#ffd0dc', '#fffafb'],
];
const PENTEADOS = ['chiquinhas', 'coque', 'trancas', 'cacheado', 'longo'] as const;
const ACESSORIOS = ['laco', 'flor', 'coroa', 'tiara'] as const;

function semente(slug: string): number {
  let n = 0;
  for (let i = 0; i < slug.length; i += 1) n = (n * 31 + slug.charCodeAt(i)) % 100000;
  return n;
}

function ilustracao(slug: string): DollSpec {
  const s = semente(slug);
  const [cabelo, cabeloSombra] = CABELOS[s % CABELOS.length];
  const [vestido, vestidoDetalhe] = VESTIDOS[(s >> 2) % VESTIDOS.length];
  return {
    tipo: 'menina',
    pele: PELES[(s >> 3) % PELES.length],
    cabelo,
    cabeloSombra,
    penteado: PENTEADOS[(s >> 4) % PENTEADOS.length],
    vestido,
    vestidoDetalhe,
    acessorio: ACESSORIOS[(s >> 5) % ACESSORIOS.length],
    acessorioCor: '#e0708f',
    meias: '#fffafb',
    coracao: '#e0708f',
  };
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
    spec: ilustracao(linha.slug),
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
    capa: visual.capa,
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
