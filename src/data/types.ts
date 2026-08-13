export interface Categoria {
  slug: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  emoji: string;
}

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  preco: number;
  precoDe?: number;
  resumo: string;
  /** "A História Dela" */
  historia: string;
  /** "Presente de Vó" — texto próprio da peça; sem ele, entra o texto padrão. */
  presenteAvo?: string;
  /**
   * Foto da boneca (URL pública do Storage do Supabase ou de outro serviço).
   * Sem foto, o site mostra um espaço reservado ("foto a caminho").
   */
  foto?: string;
  /** Frase curta do cenário da foto, usada como legenda. */
  legendaFoto?: string;
  /** Foto de estúdio, com fundo claro — é a que aparece no topo da home. */
  fotoEstudio?: string;
  /** Tamanho da peça, como "42 cm". */
  altura: string;
  /** "Materiais e Acabamento" */
  materiais: string[];
  cuidados: string;
  tags: string[];
  destaque?: boolean;
  novidade?: boolean;
  maisVendida?: boolean;
}

export interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
}
