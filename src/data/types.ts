export type TipoBoneca = 'menina' | 'bailarina' | 'urso' | 'coelha' | 'bebe' | 'naninha';

export type Penteado = 'chiquinhas' | 'coque' | 'trancas' | 'cacheado' | 'curto' | 'longo';

export type Acessorio = 'laco' | 'flor' | 'coroa' | 'chapeu' | 'tiara' | 'boina' | 'nenhum';

/** Vestido, ou conjunto de camisa com bermuda/calça (os bonecos). */
export type Roupa = 'vestido' | 'conjunto';

/** Receita da ilustração 3D de cada boneca — cores e formas geradas em SVG. */
export interface DollSpec {
  tipo: TipoBoneca;
  pele: string;
  cabelo: string;
  cabeloSombra: string;
  penteado: Penteado;
  vestido: string;
  vestidoDetalhe: string;
  acessorio: Acessorio;
  acessorioCor: string;
  meias: string;
  sardas?: boolean;
  coracao?: string;
  /** Olhinhos bordados fechados (padrão) ou redondos e abertos. */
  olhos?: 'fechados' | 'abertos';
  roupa?: Roupa;
  /** Cor da bermuda/calça, quando a roupa é conjunto. */
  calca?: string;
  /** Cor do sapatinho — se não vier, usa a cor do acessório. */
  sapatos?: string;
}

export interface Categoria {
  slug: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  emoji: string;
  capa: DollSpec;
}

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  preco: number;
  precoDe?: number;
  resumo: string;
  historia: string;
  /**
   * Foto real da boneca, em public/produtos/.
   * Se o arquivo não existir, o site mostra a ilustração 3D no lugar.
   */
  foto?: string;
  /** Frase curta do cenário da foto, usada como legenda. */
  legendaFoto?: string;
  altura: string;
  materiais: string[];
  cuidados: string;
  tags: string[];
  destaque?: boolean;
  novidade?: boolean;
  maisVendida?: boolean;
  personalizavel: boolean;
  spec: DollSpec;
}

export interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
  /** Cor do vestidinho escolhida (só para as peças ilustradas). */
  corVestido?: string;
}
