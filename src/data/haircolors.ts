import { generateTechnicalColors } from '../lib/colorLevelSystem';

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

/** The full professional depth/reflect numbering system (levels 1-10 ×
 * reflects, plus popular double-reflect shades) — generated programmatically
 * from the real International Colour Chart scale used by colorists
 * worldwide, so the catalog covers the natural-tone range exhaustively
 * instead of a hand-picked handful. See src/lib/colorLevelSystem.ts. */
const technicalColors = generateTechnicalColors();

const fantasyColors: HairColor[] = [
  { id: 'rosa-pastel', name: 'Rosa Pastel', family: 'fantasia', origin: 'Global', description: 'Rosa suave e sonhador.', swatch: ['#F0B8C6', '#F7D3DC'], tags: ['fantasia', 'delicado', 'pastel'] },
  { id: 'rosa-choque', name: 'Rosa Choque', family: 'fantasia', origin: 'Brasil', description: 'Rosa vibrante e cheio de atitude.', swatch: ['#E23E82', '#F06BA0'], tags: ['fantasia', 'vibrante', 'neon'] },
  { id: 'rosa-nude', name: 'Rosa Nude', family: 'fantasia', origin: 'Global', description: 'Rosa acinzentado bem suave, quase natural.', swatch: ['#D9BEB8', '#E9D6D1'], tags: ['fantasia', 'delicado'] },
  { id: 'lilas', name: 'Lilás', family: 'fantasia', origin: 'Global', description: 'Roxo clarinho, etéreo e criativo.', swatch: ['#C9B3E0', '#DDCBEE'], tags: ['fantasia', 'criativo', 'pastel'] },
  { id: 'lavanda-cinza', name: 'Lavanda Acinzentada', family: 'fantasia', origin: 'Internacional', description: 'Lilás suave puxado para o cinza, discreto e elegante.', swatch: ['#B7ADC2', '#CFC6DA'], tags: ['fantasia', 'sutil'] },
  { id: 'roxo-intenso', name: 'Roxo Intenso', family: 'fantasia', origin: 'Global', description: 'Violeta profundo e dramático.', swatch: ['#4B2E83', '#6C46A8'], tags: ['fantasia', 'vibrante'] },
  { id: 'azul-petroleo', name: 'Azul Petróleo', family: 'fantasia', origin: 'Global', description: 'Azul escuro e sofisticado.', swatch: ['#1B3B45', '#2C5764'], tags: ['fantasia', 'intenso'] },
  { id: 'azul-royal', name: 'Azul Royal', family: 'fantasia', origin: 'Global', description: 'Azul vibrante e chamativo.', swatch: ['#1B3FA0', '#3358C9'], tags: ['fantasia', 'vibrante'] },
  { id: 'azul-pastel', name: 'Azul Pastel', family: 'fantasia', origin: 'Global', description: 'Azul serenidade, bem clarinho.', swatch: ['#B7D6E8', '#D3E9F3'], tags: ['fantasia', 'pastel'] },
  { id: 'verde-menta', name: 'Verde Menta', family: 'fantasia', origin: 'Global', description: 'Verde clarinho e refrescante.', swatch: ['#AEDBC6', '#CBEBDC'], tags: ['fantasia', 'delicado', 'pastel'] },
  { id: 'verde-esmeralda', name: 'Verde Esmeralda', family: 'fantasia', origin: 'Global', description: 'Verde profundo e joia.', swatch: ['#0F5C42', '#1B7F5C'], tags: ['fantasia', 'intenso'] },
  { id: 'cinza-prata', name: 'Cinza Prata', aka: 'Silver', family: 'fantasia', origin: 'Global', description: 'Prateado moderno e futurista.', swatch: ['#B9BCC2', '#D6D8DC'], tags: ['fantasia', 'moderno'] },
  { id: 'cinza-grafite', name: 'Cinza Grafite', family: 'fantasia', origin: 'Global', description: 'Cinza escuro, elegante e discreto.', swatch: ['#4A4C52', '#6A6D74'], tags: ['fantasia', 'moderno'] },
  { id: 'branco-platinado', name: 'Branco Platinado', family: 'fantasia', origin: 'Global', description: 'Quase branco, visual de impacto máximo.', swatch: ['#F1EFEA', '#FBFAF7'], tags: ['fantasia', 'ousado'] },
  { id: 'vinho', name: 'Vinho', aka: 'Burgundy', family: 'fantasia', origin: 'Global', description: 'Vermelho arroxeado profundo, elegante.', swatch: ['#4B121F', '#752033'], tags: ['fantasia', 'intenso', 'elegante'] },
  { id: 'vermelho-cereja', name: 'Vermelho Cereja', family: 'fantasia', origin: 'Global', description: 'Vermelho vivo e brilhante.', swatch: ['#8C1424', '#B82438'], tags: ['fantasia', 'vibrante'] },
  { id: 'laranja-vivido', name: 'Laranja Vívido', family: 'fantasia', origin: 'Internacional', description: 'Laranja intenso, para quem não tem medo de ousar.', swatch: ['#C24A17', '#E56A2C'], tags: ['fantasia', 'vibrante'] },
  { id: 'amarelo-canario', name: 'Amarelo Canário', family: 'fantasia', origin: 'Internacional', description: 'Amarelo vibrante e solar.', swatch: ['#E8C93A', '#F3DE6E'], tags: ['fantasia', 'vibrante'] },
  { id: 'preto-violeta', name: 'Preto Violeta', family: 'fantasia', origin: 'Global', description: 'Preto com reflexo violeta profundo sob luz.', swatch: ['#160C22', '#2A1938'], tags: ['fantasia', 'intenso'] },
  { id: 'turquesa', name: 'Turquesa', family: 'fantasia', origin: 'Global', description: 'Azul-esverdeado tropical e chamativo.', swatch: ['#1E8C93', '#37B0B8'], tags: ['fantasia', 'vibrante'] },
  { id: 'coral', name: 'Coral', family: 'fantasia', origin: 'Global', description: 'Rosa-alaranjado vibrante e alegre.', swatch: ['#E56E63', '#F09589'], tags: ['fantasia', 'vibrante'] },
  { id: 'pastel-arco-iris', name: 'Pastel Multicolor', aka: 'Unicorn Hair', family: 'fantasia', origin: 'Internacional', description: 'Mescla de tons pastel — rosa, lilás e azul — para um efeito unicórnio.', swatch: ['#F0B8C6', '#C9B3E0', '#B7D6E8'], tags: ['fantasia', 'criativo', 'multicolor'] },
  { id: 'preto-azulado', name: 'Preto Azulado', aka: 'Blue Black', family: 'preto', origin: 'Internacional', description: 'Preto profundo com reflexo azulado sob luz.', swatch: ['#10121A', '#1D2233'], tags: ['moderno', 'intenso'] },
  { id: 'neon-verde', name: 'Verde Neon', family: 'fantasia', origin: 'Internacional', description: 'Verde fluorescente extremo, altamente pigmentado.', swatch: ['#7FE817', '#A8F04E'], tags: ['fantasia', 'neon', 'ousado'] },
  { id: 'neon-rosa', name: 'Rosa Neon', family: 'fantasia', origin: 'Internacional', description: 'Rosa fluorescente extremo, altamente pigmentado.', swatch: ['#FF3D8F', '#FF6FAE'], tags: ['fantasia', 'neon', 'ousado'] },
];

const techniqueColors: HairColor[] = [
  { id: 'balayage-loiro', name: 'Balayage Loiro', family: 'tecnica', origin: 'Internacional', description: 'Pintura livre que cria transição natural do castanho para o loiro.', swatch: ['#5B3A24', '#D9B36C'], tags: ['tecnica', 'popular'] },
  { id: 'balayage-caramelo', name: 'Balayage Caramelo', family: 'tecnica', origin: 'Internacional', description: 'Balayage em tons de caramelo, quente e iluminado.', swatch: ['#4A2E1F', '#C08544'], tags: ['tecnica', 'quente'] },
  { id: 'balayage-acinzentado', name: 'Balayage Acinzentado', family: 'tecnica', origin: 'Internacional', description: 'Balayage com pontas em tom cinza suave.', swatch: ['#3B2E28', '#B4AFA8'], tags: ['tecnica', 'moderno'] },
  { id: 'ombre-classico', name: 'Ombré Hair', family: 'tecnica', origin: 'Internacional', description: 'Degradê de escuro para claro das raízes às pontas.', swatch: ['#3B2618', '#E7C98A'], tags: ['tecnica', 'degrade'] },
  { id: 'ombre-ruivo', name: 'Ombré Ruivo', family: 'tecnica', origin: 'Internacional', description: 'Degradê de castanho para tons acobreados nas pontas.', swatch: ['#3B2618', '#C1591F'], tags: ['tecnica', 'degrade'] },
  { id: 'sombre', name: 'Sombré', family: 'tecnica', origin: 'Internacional', description: 'Ombré mais suave, com transição quase imperceptível.', swatch: ['#4A2E1F', '#B98A4A'], tags: ['tecnica', 'sutil'] },
  { id: 'money-piece', name: 'Money Piece', family: 'tecnica', origin: 'Internacional', description: 'Mechas claras que emolduram o rosto.', swatch: ['#5B3A24', '#EAD3A3'], tags: ['tecnica', 'moldura'] },
  { id: 'babylights', name: 'Babylights', family: 'tecnica', origin: 'Internacional', description: 'Mechas finíssimas que imitam clareamento natural de infância.', swatch: ['#6B4327', '#E4CB98'], tags: ['tecnica', 'sutil', 'natural'] },
  { id: 'luzes-tradicionais', name: 'Luzes', family: 'tecnica', origin: 'Brasil', description: 'Mechas clássicas com papel alumínio, bem marcadas.', swatch: ['#5B3A24', '#F0DDB0'], tags: ['tecnica', 'classico'] },
  { id: 'morena-iluminada-tec', name: 'Morena Iluminada', family: 'tecnica', origin: 'Brasil', description: 'Base morena com mechas sutis para dar luz ao rosto.', swatch: ['#5B3A24', '#9C7248'], tags: ['tecnica', 'popular'] },
  { id: 'loiro-california', name: 'Loiro Californiano', family: 'tecnica', origin: 'Internacional', description: 'Mechas amplas que imitam o clareamento natural do sol.', swatch: ['#B98A4A', '#EAD3A3'], tags: ['tecnica', 'natural'] },
  { id: 'flamboyage', name: 'Flamboyage', family: 'tecnica', origin: 'Internacional', description: 'Mistura de balayage com mechas para um resultado bem dimensionado.', swatch: ['#4A2E1F', '#DDBB80'], tags: ['tecnica', 'dimensao'] },
  { id: 'tie-dye-hair', name: 'Tie-Dye Hair', family: 'tecnica', origin: 'Internacional', description: 'Mescla de cores vivas aplicadas de forma livre e artística.', swatch: ['#E23E82', '#3358C9'], tags: ['tecnica', 'fantasia', 'criativo'] },
  { id: 'splash-lights', name: 'Splash Lights', family: 'tecnica', origin: 'Internacional', description: 'Mechas coloridas pontuais em meio à cor natural.', swatch: ['#5B3A24', '#37B0B8'], tags: ['tecnica', 'fantasia'] },
  { id: 'matizado-perolado', name: 'Matizado Perolado', family: 'tecnica', origin: 'Brasil', description: 'Matização para neutralizar o amarelado e deixar o loiro perolado.', swatch: ['#DCD6C8', '#EDE6DD'], tags: ['tecnica', 'manutencao'] },
];

export const haircolors: HairColor[] = [...technicalColors, ...fantasyColors, ...techniqueColors];

export const colorFamilyLabels: Record<ColorFamily, string> = {
  loiro: 'Loiros',
  castanho: 'Castanhos',
  preto: 'Pretos',
  ruivo: 'Ruivos',
  fantasia: 'Fantasia',
  tecnica: 'Técnicas',
};
