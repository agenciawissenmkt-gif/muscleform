export type ColorFamily =
  | 'loiro'
  | 'castanho'
  | 'preto'
  | 'ruivo'
  | 'fantasia'
  | 'tecnica';

export interface HairColor {
  id: string;
  name: string;
  aka?: string;
  family: ColorFamily;
  origin: 'Brasil' | 'Internacional' | 'Global';
  description: string;
  /** hex stops used to build the live tint / swatch gradient */
  swatch: string[];
  tags: string[];
}

export const haircolors: HairColor[] = [
  // Loiros
  { id: 'loiro-platinado', name: 'Loiro Platinado', family: 'loiro', origin: 'Global', description: 'Loiro quase branco, super clareado e impactante.', swatch: ['#EDE3D0', '#F5EEDD'], tags: ['claro', 'ousado'] },
  { id: 'loiro-acinzentado', name: 'Loiro Acinzentado', aka: 'Ash Blonde', family: 'loiro', origin: 'Internacional', description: 'Loiro com base fria, neutraliza o amarelado.', swatch: ['#C9C3B8', '#DCD6C8'], tags: ['frio', 'moderno'] },
  { id: 'loiro-dourado', name: 'Loiro Dourado', family: 'loiro', origin: 'Global', description: 'Loiro quente com reflexos dourados.', swatch: ['#D9B36C', '#E7C98A'], tags: ['quente', 'classico'] },
  { id: 'loiro-mel', name: 'Loiro Mel', aka: 'Honey Blonde', family: 'loiro', origin: 'Global', description: 'Tom amendoado, aconchegante e luminoso.', swatch: ['#C9944F', '#E0B77A'], tags: ['quente', 'popular'] },
  { id: 'loiro-california', name: 'Loiro Californiano', family: 'loiro', origin: 'Internacional', description: 'Mechas amplas que imitam o clareamento natural do sol.', swatch: ['#B98A4A', '#EAD3A3'], tags: ['tecnica', 'natural'] },
  { id: 'loiro-nordico', name: 'Loiro Escandinavo', aka: 'Nordic Blonde', family: 'loiro', origin: 'Internacional', description: 'Loiro muito claro e levemente acinzentado.', swatch: ['#E4DCC6', '#F2ECDD'], tags: ['claro', 'frio'] },
  { id: 'loiro-rose', name: 'Loiro Rosé', family: 'loiro', origin: 'Internacional', description: 'Loiro claro com sutil véu rosado.', swatch: ['#E8CFC2', '#F2E0D6'], tags: ['fantasia', 'delicado'] },

  // Castanhos
  { id: 'castanho-claro', name: 'Castanho Claro', family: 'castanho', origin: 'Global', description: 'Marrom suave, versátil para todos os tons de pele.', swatch: ['#8A6244', '#A8815F'], tags: ['classico', 'natural'] },
  { id: 'castanho-chocolate', name: 'Castanho Chocolate', family: 'castanho', origin: 'Global', description: 'Marrom intenso e aveludado.', swatch: ['#4A2E1F', '#6B4630'], tags: ['intenso', 'classico'] },
  { id: 'moreno-iluminado', name: 'Moreno Iluminado', family: 'castanho', origin: 'Brasil', description: 'Base morena com mechas sutis para dar luz ao rosto.', swatch: ['#5B3A24', '#9C7248'], tags: ['tecnica', 'popular'] },
  { id: 'chocolate-avela', name: 'Chocolate com Avelã', family: 'castanho', origin: 'Brasil', description: 'Castanho com reflexos acobreados quentes.', swatch: ['#6B4327', '#A2714A'], tags: ['quente', 'popular'] },
  { id: 'castanho-avermelhado', name: 'Castanho Avermelhado', aka: 'Auburn', family: 'castanho', origin: 'Internacional', description: 'Marrom com toques de vermelho profundo.', swatch: ['#5C2A1E', '#8C4530'], tags: ['quente', 'intenso'] },

  // Pretos
  { id: 'preto-intenso', name: 'Preto Intenso', family: 'preto', origin: 'Global', description: 'Preto uniforme, cheio e marcante.', swatch: ['#0E0C0C', '#1C1917'], tags: ['classico', 'intenso'] },
  { id: 'preto-azulado', name: 'Preto Azulado', aka: 'Blue Black', family: 'preto', origin: 'Internacional', description: 'Preto profundo com reflexo azulado sob luz.', swatch: ['#10121A', '#1D2233'], tags: ['moderno', 'intenso'] },

  // Ruivos
  { id: 'ruivo-cobre', name: 'Ruivo Cobre', aka: 'Copper', family: 'ruivo', origin: 'Global', description: 'Ruivo vibrante e brilhante, cheio de vida.', swatch: ['#B5541F', '#D97A3D'], tags: ['vibrante', 'quente'] },
  { id: 'ruivo-acaju', name: 'Ruivo Acaju', aka: 'Mahogany', family: 'ruivo', origin: 'Brasil', description: 'Vermelho amadeirado com toques arroxeados.', swatch: ['#5E1F1F', '#8C3B33'], tags: ['intenso', 'elegante'] },
  { id: 'ruivo-alaranjado', name: 'Ruivo Alaranjado', aka: 'Ginger', family: 'ruivo', origin: 'Internacional', description: 'Laranja avermelhado, natural e marcante.', swatch: ['#C1591F', '#E2823F'], tags: ['vibrante', 'natural'] },

  // Fantasia
  { id: 'rosa-pastel', name: 'Rosa Pastel', family: 'fantasia', origin: 'Global', description: 'Rosa suave e sonhador.', swatch: ['#F0B8C6', '#F7D3DC'], tags: ['fantasia', 'delicado'] },
  { id: 'lilas', name: 'Lilás / Lavanda', family: 'fantasia', origin: 'Global', description: 'Roxo clarinho, etéreo e criativo.', swatch: ['#C9B3E0', '#DDCBEE'], tags: ['fantasia', 'criativo'] },
  { id: 'azul-petroleo', name: 'Azul Petróleo', family: 'fantasia', origin: 'Global', description: 'Azul escuro e sofisticado.', swatch: ['#1B3B45', '#2C5764'], tags: ['fantasia', 'intenso'] },
  { id: 'verde-menta', name: 'Verde Menta', family: 'fantasia', origin: 'Global', description: 'Verde clarinho e refrescante.', swatch: ['#AEDBC6', '#CBEBDC'], tags: ['fantasia', 'delicado'] },
  { id: 'cinza-prata', name: 'Cinza Prata', aka: 'Silver', family: 'fantasia', origin: 'Global', description: 'Prateado moderno e futurista.', swatch: ['#B9BCC2', '#D6D8DC'], tags: ['fantasia', 'moderno'] },
  { id: 'vinho', name: 'Vinho', aka: 'Burgundy', family: 'fantasia', origin: 'Global', description: 'Vermelho arroxeado profundo, elegante.', swatch: ['#4B121F', '#752033'], tags: ['intenso', 'elegante'] },
  { id: 'rosa-choque', name: 'Rosa Choque', family: 'fantasia', origin: 'Brasil', description: 'Rosa vibrante e cheio de atitude.', swatch: ['#E23E82', '#F06BA0'], tags: ['fantasia', 'vibrante'] },

  // Técnicas (aplicam gradiente/mechas)
  { id: 'balayage', name: 'Balayage', family: 'tecnica', origin: 'Internacional', description: 'Técnica de pintura livre que cria transição natural e iluminada.', swatch: ['#5B3A24', '#D9B36C'], tags: ['tecnica', 'popular'] },
  { id: 'ombre-hair', name: 'Ombré Hair', family: 'tecnica', origin: 'Internacional', description: 'Degradê de escuro para claro das raízes às pontas.', swatch: ['#3B2618', '#E7C98A'], tags: ['tecnica', 'degrade'] },
  { id: 'morena-iluminada-tec', name: 'Sombré', family: 'tecnica', origin: 'Internacional', description: 'Ombré mais suave, com transição quase imperceptível.', swatch: ['#4A2E1F', '#B98A4A'], tags: ['tecnica', 'sutil'] },
  { id: 'money-piece', name: 'Money Piece', family: 'tecnica', origin: 'Internacional', description: 'Mechas claras que emolduram o rosto.', swatch: ['#5B3A24', '#EAD3A3'], tags: ['tecnica', 'moldura'] },
];

export const colorFamilyLabels: Record<ColorFamily, string> = {
  loiro: 'Loiros',
  castanho: 'Castanhos',
  preto: 'Pretos',
  ruivo: 'Ruivos',
  fantasia: 'Fantasia',
  tecnica: 'Técnicas',
};
