import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import BotaoSonho from '../components/BotaoSonho';
import { linkWhatsApp, site } from '../config/site';

/**
 * Página de conteúdo — o olhar pedagógico do ateliê sobre o brincar.
 * O texto é das pedagogas do Sonhos de Brincar; as referências ficam à vista
 * no fim, porque é conteúdo sobre desenvolvimento infantil.
 */

const RESUMOS = [
  {
    e: '💭',
    t: 'Estimula a imaginação',
    d: 'A criança cria histórias, personagens, aventuras e mundos próprios.',
  },
  {
    e: '💗',
    t: 'Favorece a expressão das emoções',
    d: 'Muitas vezes a criança conversa com o boneco e reproduz situações que está vivendo, encontrando uma maneira segura de expressar sentimentos.',
  },
  {
    e: '🗣️',
    t: 'Desenvolve a linguagem',
    d: 'Ao conversar, cantar e inventar histórias para o boneco, amplia vocabulário e capacidade de comunicação.',
  },
  {
    e: '🤲',
    t: 'Estimula o cuidado e a empatia',
    d: 'Alimentar, colocar para dormir, dar colo ou cuidar de um bonequinho ajuda a experimentar atitudes de carinho e responsabilidade.',
  },
];

const FONTES = [
  'American Academy of Pediatrics',
  'Instituto Psicanalítico de Chicago',
  'Centro da Criança em Desenvolvimento',
  'Zero to Three',
];

export default function Beneficios() {
  return (
    <div className="pb-16">
      {/* topo */}
      <section className="mx-auto max-w-4xl px-4 pt-10 text-center sm:px-6">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Um olhar pedagógico</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-sepia-900 sm:text-5xl">
            Benefícios de brincar com
            <span className="font-script text-rosa-600"> bonecos de pano</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-sepia-700">
            Brincar com bonecos de pano vai muito além de uma brincadeira gostosa. Para a criança, eles podem ser
            companheiros de imaginação, afeto e descoberta. 💗
          </p>
        </Reveal>
      </section>

      {/* os quatro benefícios em cartão */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {RESUMOS.map((item, i) => (
            <Reveal key={item.t} delay={i * 0.07} efeito="zoom">
              <div className="flex h-full items-start gap-4 rounded-[1.5rem] border border-rosa-200 bg-white/80 p-5 transition-transform hover:-translate-y-1 sombra-suave">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rosa-200 text-xl">
                  {item.e}
                </span>
                <span>
                  <span className="block font-display text-lg text-sepia-900">{item.t}</span>
                  <span className="block text-sm leading-relaxed text-sepia-500">{item.d}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* texto longo */}
      <section className="relative overflow-hidden bg-white/60 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal className="text-center">
            <h2 className="font-display text-3xl leading-tight text-sepia-900 sm:text-4xl">
              O boneco de pano como companheiro do
              <span className="font-script text-rosa-600"> desenvolvimento emocional</span>
            </h2>
          </Reveal>

          <Bloco titulo="Segurança afetiva e conforto emocional" delay={0.05}>
            <p>
              Alguns bonecos tornam-se aquilo que a psicologia chama de{' '}
              <em>objeto de apego ou objeto transicional</em>. Esse conceito, desenvolvido pelo pediatra e
              psicanalista Donald Winnicott, descreve objetos especiais — como uma naninha, um ursinho ou um
              boneco macio — que ajudam a criança a lidar gradualmente com a separação dos pais e com momentos de
              transição.
            </p>
            <p>
              É importante compreender que o boneco <em>não substitui o vínculo com os cuidadores</em>. Ele
              funciona como uma ponte emocional: um objeto familiar que pode transmitir sensação de continuidade e
              conforto quando a mãe, o pai ou outra figura de referência não está presente. Estudos e orientações
              sobre desenvolvimento infantil reconhecem que objetos afetivos podem ajudar crianças pequenas em
              despedidas, adaptação à escola e outras mudanças da rotina.
            </p>
          </Bloco>

          <Bloco titulo="Brincar simbólico: quando a criança conta sua própria história" delay={0.05}>
            <p>
              Na infância, especialmente a partir do surgimento do faz-de-conta, a criança usa os brinquedos para
              representar o mundo que conhece.
            </p>
            <p>
              Quando ela dá comida ao boneco, coloca-o para dormir ou diz: “Não chore, eu estou aqui”, ela não
              está apenas imitando um adulto. Está organizando mentalmente experiências, compreendendo relações e
              experimentando diferentes formas de agir diante das situações da vida.
            </p>
            <p>
              O brincar simbólico é considerado uma das formas mais importantes de desenvolvimento cognitivo,
              social e emocional, porque permite que a criança imagine, interprete e recrie experiências em um
              ambiente seguro.
            </p>
          </Bloco>

          <Bloco titulo="Expressão dos sentimentos" delay={0.05}>
            <p>
              Muitas crianças conseguem falar de suas emoções com mais facilidade quando projetam esses
              sentimentos no boneco.
            </p>
            <Fala>
              Em vez de dizer “Estou com medo”, podem dizer: <strong>“Meu ursinho está com medo.”</strong>
              <br />
              Em vez de confessar tristeza, dizem: <strong>“A boneca está chorando.”</strong>
            </Fala>
            <p>
              Esse fenômeno é muito comum no desenvolvimento infantil e oferece aos adultos uma oportunidade
              delicada de conversar com a criança sobre aquilo que ela está vivendo. O boneco pode funcionar como
              um mediador da comunicação emocional, sem que isso signifique que ele tenha um efeito terapêutico
              por si só.
            </p>
          </Bloco>

          <Bloco titulo="Desenvolvimento da empatia" delay={0.05}>
            <p>Ao cuidar de um boneco, a criança ensaia comportamentos de cuidado.</p>
            <ul className="flex flex-wrap gap-2">
              {['Oferece colo', 'Cobre com uma manta', 'Faz carinho', 'Consola', 'Protege'].map((acao) => (
                <li
                  key={acao}
                  className="rounded-full border border-rosa-200 bg-rosa-100/70 px-4 py-1.5 text-sm font-semibold text-rosa-700"
                >
                  {acao}
                </li>
              ))}
            </ul>
            <p>
              Essas brincadeiras não criam empatia automaticamente, mas oferecem oportunidades para praticar
              atitudes relacionadas ao cuidado e à compreensão do outro. É um verdadeiro laboratório das relações
              humanas, vivido de maneira lúdica.
            </p>
          </Bloco>

          <Bloco titulo="Construção da linguagem e das habilidades sociais" delay={0.05}>
            <p>Um boneco convida ao diálogo.</p>
            <p>
              A criança cria vozes, inventa conversas, negocia papéis e constrói narrativas. Quando brinca
              sozinha, desenvolve a capacidade de organizar pensamentos; quando brinca com outras crianças ou com
              adultos, exercita turnos de fala, cooperação e imaginação compartilhada.
            </p>
            <p>
              Pesquisas sobre desenvolvimento destacam que o brincar e as interações responsivas entre crianças e
              adultos contribuem para a linguagem, as habilidades sociais e a construção de competências
              emocionais.
            </p>
          </Bloco>

          <Bloco titulo="Autonomia e autorregulação" delay={0.05}>
            <p>
              Existe um momento muito interessante no desenvolvimento em que a criança começa a reproduzir no
              boneco aquilo que os adultos fazem com ela.
            </p>
            <Fala>
              “Agora vamos respirar.”
              <br />
              “Está tudo bem.”
              <br />
              “Vou cuidar de você.”
            </Fala>
            <p>
              Esse tipo de brincadeira pode refletir experiências de cuidado recebidas e ajuda a criança a ensaiar
              estratégias de organização emocional. Novamente, o boneco não é quem regula a emoção; ele é um
              recurso dentro da brincadeira e da relação afetiva que a criança estabelece com seu ambiente.
            </p>
          </Bloco>
        </div>
      </section>

      {/* encanto do pano */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal efeito="zoom">
          <div className="rounded-[2.5rem] border border-creme-200 bg-creme-100 p-6 sombra-suave sm:p-10">
            <h2 className="font-display text-3xl leading-tight text-sepia-900 sm:text-4xl">
              Por que os bonecos de pano têm um
              <span className="font-script text-rosa-600"> encanto especial?</span>
            </h2>
            <p className="mt-5 leading-relaxed text-sepia-700">
              Embora muitos desses benefícios possam acontecer com diferentes tipos de bonecos, os bonecos de pano
              possuem características que favorecem uma relação muito afetiva: são macios, aconchegantes, leves,
              agradáveis ao toque e convidativos ao abraço. Para muitas crianças, essa experiência sensorial
              transforma o boneco em um companheiro constante nas brincadeiras e nos momentos de descanso.
            </p>
            <p className="mt-4 leading-relaxed text-sepia-700">
              É justamente essa combinação entre toque, afeto e imaginação que faz do boneco de pano um brinquedo
              tão rico. Ele não acende luzes, não dita regras e não conduz a brincadeira.
            </p>
            <p className="mt-6 text-center font-script text-3xl leading-snug text-rosa-600 sm:text-4xl">
              Quem dá vida a ele é a criança.
            </p>
            <p className="mt-4 leading-relaxed text-sepia-700">
              E, ao dar vida ao boneco, ela exercita também a própria capacidade de imaginar, sentir, comunicar e
              compreender o mundo.
            </p>
          </div>
        </Reveal>
      </section>

      {/* olhar do ateliê */}
      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl leading-tight text-sepia-900 sm:text-4xl">
            Um olhar pedagógico para a
            <span className="font-script text-rosa-600"> {site.nome}</span>
          </h2>
          <p className="mt-5 leading-relaxed text-sepia-700">
            Para uma marca como a {site.nome}, há uma mensagem muito bonita e verdadeira a ser transmitida: um
            boneco de pano não é apenas um presente ou um objeto de decoração. Ele pode se tornar um companheiro
            de infância, participando das primeiras histórias inventadas, dos abraços antes de dormir, das
            conversas imaginárias e das brincadeiras em que a criança aprende, pouco a pouco, a cuidar também do
            outro.
          </p>
        </Reveal>
      </section>

      {/* referências */}
      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
        <Reveal>
          <div className="rounded-[1.5rem] border border-rosa-200 bg-white/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rosa-600">Referências</p>
            <p className="mt-2 text-sm leading-relaxed text-sepia-500">
              O conteúdo desta página se apoia em orientações sobre desenvolvimento infantil de{' '}
              {FONTES.join(', ')}, além do conceito de objeto transicional de Donald Winnicott.
            </p>
          </div>
        </Reveal>
      </section>

      {/* chamada final */}
      <section className="mx-auto max-w-4xl px-4 pb-8 text-center sm:px-6">
        <Reveal efeito="zoom">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-rosa-300 bg-gradient-to-br from-white via-rosa-100 to-rosa-200 px-6 py-12 sombra-suave sm:px-12">
            <motion.div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rosa-300/35 blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 9, repeat: Infinity }}
            />
            <p className="font-script text-3xl text-rosa-600 sm:text-4xl">{site.slogan}</p>
            <p className="mx-auto mt-4 max-w-lg leading-relaxed text-sepia-700">
              Escolha o companheiro que vai participar das histórias da sua criança.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BotaoSonho
                tamanho="lg"
                href={linkWhatsApp(
                  `Olá, ${site.nome}! Li sobre os benefícios de brincar com bonecos de pano e quero escolher um 💕`,
                )}
              />
              <Link
                to="/bonecas"
                className="inline-flex items-center gap-2 rounded-full border-2 border-rosa-400 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-white"
              >
                ver o catálogo
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/** Um trecho do texto: título e parágrafos, com o respiro certo entre eles. */
function Bloco({
  titulo,
  delay = 0,
  children,
}: {
  titulo: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal delay={delay} className="mt-10">
      <h3 className="font-display text-2xl leading-snug text-sepia-900">{titulo}</h3>
      <div className="mt-4 flex flex-col gap-4 leading-relaxed text-sepia-700">{children}</div>
    </Reveal>
  );
}

/** Falas da criança — destacadas do corpo do texto. */
function Fala({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border-l-4 border-rosa-400 bg-rosa-100/60 px-5 py-4 leading-relaxed text-sepia-800">
      {children}
    </p>
  );
}
