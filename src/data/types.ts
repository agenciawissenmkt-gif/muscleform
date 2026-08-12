export type TipoBoneca = 'menina' | 'bailarina' | 'urso' | 'coelha' | 'bebe' | 'naninha';

export type Penteado = 'chiquinhas' | 'coque' | 'trancas' | 'cacheado' | 'curto' | 'longo';

export type Acessorio = 'laco' | 'flor' | 'coroa' | 'chapeu' | 'tiara' | 'nenhum';

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
  personalizacao?: {
    nomeBordado?: string;
    corVestido?: string;
    observacao?: string;
  };
}
