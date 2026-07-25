export type HairLength = 'curto' | 'medio' | 'longo';
export type HairTexture = 'liso' | 'ondulado' | 'cacheado' | 'crespo';

export interface Haircut {
  id: string;
  name: string;
  aka?: string;
  length: HairLength;
  textures: HairTexture[];
  origin: 'Brasil' | 'Internacional' | 'Global';
  description: string;
  tags: string[];
  /** 0-1, roughly how much shorter than shoulders (0 = very short, 1 = very long) */
  silhouette: {
    lengthRatio: number;
    volume: number; // 0-1
    fringe: boolean;
    curlPattern: 'none' | 'wave' | 'curl' | 'coil';
  };
}

export const haircuts: Haircut[] = [
  {
    id: 'pixie-cut',
    name: 'Pixie Cut',
    length: 'curto',
    textures: ['liso', 'ondulado'],
    origin: 'Internacional',
    description: 'Corte super curto e repicado, ousado e cheio de personalidade.',
    tags: ['curto', 'moderno', 'ousado'],
    silhouette: { lengthRatio: 0.08, volume: 0.35, fringe: true, curlPattern: 'none' },
  },
  {
    id: 'pixie-cacheado',
    name: 'Pixie Cacheado',
    aka: 'Curly Pixie',
    length: 'curto',
    textures: ['cacheado', 'crespo'],
    origin: 'Internacional',
    description: 'Versão curta e cacheada do pixie, valoriza o volume natural dos cachos.',
    tags: ['curto', 'cacheado', 'natural'],
    silhouette: { lengthRatio: 0.1, volume: 0.6, fringe: false, curlPattern: 'curl' },
  },
  {
    id: 'buzz-cut',
    name: 'Buzz Cut',
    aka: 'Corte Raspado',
    length: 'curto',
    textures: ['liso', 'crespo'],
    origin: 'Internacional',
    description: 'Raspado uniforme rente à cabeça, minimalista e prático.',
    tags: ['curto', 'raspado', 'minimalista'],
    silhouette: { lengthRatio: 0.02, volume: 0.05, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'undercut-feminino',
    name: 'Undercut Feminino',
    length: 'curto',
    textures: ['liso', 'ondulado'],
    origin: 'Internacional',
    description: 'Laterais raspadas com topo mais longo, visual moderno e marcante.',
    tags: ['curto', 'moderno', 'alternativo'],
    silhouette: { lengthRatio: 0.15, volume: 0.3, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'chanel-curto',
    name: 'Chanel Curto',
    aka: 'Bob Curto',
    length: 'curto',
    textures: ['liso', 'ondulado'],
    origin: 'Brasil',
    description: 'Clássico corte na altura do queixo, atemporal e elegante.',
    tags: ['curto', 'classico', 'elegante'],
    silhouette: { lengthRatio: 0.18, volume: 0.4, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'bob-assimetrico',
    name: 'Bob Assimétrico',
    length: 'curto',
    textures: ['liso'],
    origin: 'Internacional',
    description: 'Bob com um lado mais longo que o outro, contemporâneo e único.',
    tags: ['curto', 'moderno', 'editorial'],
    silhouette: { lengthRatio: 0.2, volume: 0.35, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'chanel-longo',
    name: 'Chanel Longo',
    aka: 'Long Bob / Lob',
    length: 'medio',
    textures: ['liso', 'ondulado'],
    origin: 'Brasil',
    description: 'Um dos cortes mais pedidos no Brasil: comprimento até os ombros, versátil.',
    tags: ['medio', 'versatil', 'popular'],
    silhouette: { lengthRatio: 0.32, volume: 0.4, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'shag-cut',
    name: 'Shag Cut',
    length: 'medio',
    textures: ['liso', 'ondulado', 'cacheado'],
    origin: 'Internacional',
    description: 'Camadas soltas e despojadas com franja repicada, clima rock anos 70.',
    tags: ['medio', 'despojado', 'retro'],
    silhouette: { lengthRatio: 0.4, volume: 0.55, fringe: true, curlPattern: 'wave' },
  },
  {
    id: 'wolf-cut',
    name: 'Wolf Cut',
    length: 'medio',
    textures: ['liso', 'ondulado', 'cacheado'],
    origin: 'Internacional',
    description: 'Mistura de shag com mullet, muitas camadas e volume no topo.',
    tags: ['medio', 'moderno', 'volume'],
    silhouette: { lengthRatio: 0.42, volume: 0.65, fringe: true, curlPattern: 'wave' },
  },
  {
    id: 'butterfly-cut',
    name: 'Butterfly Cut',
    length: 'medio',
    textures: ['liso', 'ondulado'],
    origin: 'Internacional',
    description: 'Camadas em formato de "borboleta" que emolduram o rosto com muito movimento.',
    tags: ['medio', 'movimento', 'tendencia'],
    silhouette: { lengthRatio: 0.45, volume: 0.5, fringe: false, curlPattern: 'wave' },
  },
  {
    id: 'franja-cortina',
    name: 'Franja Cortina',
    aka: 'Curtain Bangs',
    length: 'medio',
    textures: ['liso', 'ondulado'],
    origin: 'Internacional',
    description: 'Franja repartida ao meio que emoldura o rosto, super queridinha no Brasil.',
    tags: ['medio', 'franja', 'popular'],
    silhouette: { lengthRatio: 0.4, volume: 0.4, fringe: true, curlPattern: 'none' },
  },
  {
    id: 'repicado-medio',
    name: 'Repicado Médio',
    length: 'medio',
    textures: ['liso', 'ondulado', 'cacheado'],
    origin: 'Brasil',
    description: 'Camadas médias para dar leveza e movimento sem perder comprimento.',
    tags: ['medio', 'leveza', 'classico'],
    silhouette: { lengthRatio: 0.38, volume: 0.45, fringe: false, curlPattern: 'wave' },
  },
  {
    id: 'long-layers',
    name: 'Camadas Longas',
    aka: 'Long Layers',
    length: 'longo',
    textures: ['liso', 'ondulado'],
    origin: 'Global',
    description: 'Cabelo longo com camadas que dão fluidez e movimento aos fios.',
    tags: ['longo', 'movimento', 'classico'],
    silhouette: { lengthRatio: 0.75, volume: 0.45, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'liso-reto-longo',
    name: 'Liso Reto Longo',
    aka: 'Blunt Cut',
    length: 'longo',
    textures: ['liso'],
    origin: 'Global',
    description: 'Fios lisos e pontas retas alinhadas, visual clean e sofisticado.',
    tags: ['longo', 'liso', 'sofisticado'],
    silhouette: { lengthRatio: 0.85, volume: 0.3, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'ondulado-longo',
    name: 'Ondulado Longo',
    aka: 'Beach Waves',
    length: 'longo',
    textures: ['ondulado'],
    origin: 'Global',
    description: 'Ondas soltas estilo "praia", romântico e natural.',
    tags: ['longo', 'ondulado', 'romantico'],
    silhouette: { lengthRatio: 0.78, volume: 0.55, fringe: false, curlPattern: 'wave' },
  },
  {
    id: 'cacheado-longo',
    name: 'Cacheado Longo em Camadas',
    length: 'longo',
    textures: ['cacheado'],
    origin: 'Global',
    description: 'Cachos definidos com camadas que reduzem peso e realçam o formato.',
    tags: ['longo', 'cacheado', 'volume'],
    silhouette: { lengthRatio: 0.7, volume: 0.75, fringe: false, curlPattern: 'curl' },
  },
  {
    id: 'crespo-natural',
    name: 'Crespo Natural',
    aka: 'Afro',
    length: 'longo',
    textures: ['crespo'],
    origin: 'Brasil',
    description: 'Cabelo crespo assumido em todo seu volume e potência natural.',
    tags: ['longo', 'crespo', 'natural', 'empoderado'],
    silhouette: { lengthRatio: 0.6, volume: 0.95, fringe: false, curlPattern: 'coil' },
  },
  {
    id: 'box-braids',
    name: 'Box Braids',
    length: 'longo',
    textures: ['crespo', 'cacheado'],
    origin: 'Global',
    description: 'Tranças box braids, estilo protetor clássico e cheio de estilo.',
    tags: ['longo', 'trancas', 'protetor'],
    silhouette: { lengthRatio: 0.8, volume: 0.5, fringe: false, curlPattern: 'coil' },
  },
  {
    id: 'trancas-nago',
    name: 'Tranças Nagô',
    length: 'medio',
    textures: ['crespo', 'cacheado'],
    origin: 'Brasil',
    description: 'Tranças rentes ao couro cabeludo, tradição afro-brasileira e muito estilo.',
    tags: ['medio', 'trancas', 'brasileiro'],
    silhouette: { lengthRatio: 0.3, volume: 0.15, fringe: false, curlPattern: 'none' },
  },
  {
    id: 'mullet',
    name: 'Mullet Moderno',
    length: 'medio',
    textures: ['liso', 'ondulado'],
    origin: 'Internacional',
    description: 'Curto na frente, longo atrás — versão atualizada e estilosa do clássico.',
    tags: ['medio', 'alternativo', 'retro'],
    silhouette: { lengthRatio: 0.5, volume: 0.5, fringe: true, curlPattern: 'none' },
  },
];

export const lengthLabels: Record<HairLength, string> = {
  curto: 'Curto',
  medio: 'Médio',
  longo: 'Longo',
};

export const textureLabels: Record<HairTexture, string> = {
  liso: 'Liso',
  ondulado: 'Ondulado',
  cacheado: 'Cacheado',
  crespo: 'Crespo',
};
