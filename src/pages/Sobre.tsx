import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FotoBoneca from '../components/FotoBoneca';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';
import BotaoSonho from '../components/BotaoSonho';
import { useCatalogo } from '../store/catalogo';
import { linkWhatsApp, site } from '../config/site';

export default function Sobre() {
  const { produtos } = useCatalogo();
  const bonecaDaVitrine = produtos.find((p) => p.foto ?? p.fotoEstudio);

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6">
        <Reveal efeito="zoom">
          <Logo variante="grande" className="mx-auto" />
        </Reveal>
        <Reveal delay={0.15}>
          <h1 className="mt-8 font-display text-4xl leading-tight text-sepia-900 sm:text-5xl">
            Um ateliê que começou com
            <span className="font-script text-rosa-600"> uma boneca só</span>
          </h1>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mx-auto mt-8 max-w-2xl text-left">
            <p className="text-lg leading-relaxed text-sepia-800">
              “{site.nome}” nasceu da crença de que um mundo mais doce é possível.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Somos duas pedagogas que dedicaram mais de 30 anos de suas vidas à infância. Ao longo dessa
              caminhada, aprendemos que cuidar de uma criança vai muito além de atender às suas necessidades. É
              preciso olhar com atenção, acolher com carinho, respeitar seu tempo e, sobretudo, compreender a
              delicadeza e a importância de cada experiência vivida nos primeiros anos.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Foi desse olhar que nasceu a {site.nome}.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Sentimos que poderíamos continuar cuidando da infância de uma maneira diferente: criando
              personagens, histórias e companheiros de brincadeira capazes de despertar sentimentos, alimentar a
              imaginação e oferecer aquela sensação gostosa de colo e segurança.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Assim nasceram nossas bonecas, bichinhos e naninhas — feitos para abraçar o coração e acalentar a
              alma.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Cada criação carrega um pouco da nossa história e da nossa experiência com crianças. Uma boneca
              pode se transformar em amiga, confidente ou personagem de uma aventura. Um bichinho pode ganhar
              vida nas mãos de uma criança e habitar para sempre suas histórias. E uma naninha pode se tornar
              aquele companheiro especial que acompanha o sono, o aconchego e os primeiros momentos de descoberta
              do mundo.
            </p>

            <p className="my-8 text-center font-script text-3xl leading-snug text-rosa-600 sm:text-4xl">
              Porque brincar é muito mais do que brincar.
            </p>

            <p className="leading-relaxed text-sepia-700">
              É imaginar. É experimentar. É criar histórias. É desenvolver sentimentos. É construir memórias que
              permanecem.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              E talvez seja justamente por isso que, mesmo depois de adultos, todos nós carregamos uma criança
              sonhadora dentro do coração — uma criança que guarda lembranças de cheiros, texturas, histórias,
              abraços e pequenos objetos que um dia fizeram o mundo parecer mais seguro e mais bonito.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">É esse sentimento que queremos despertar.</p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Nossas criações nascem para fazer parte do universo mágico do imaginário infantil, mas também para
              tocar a memória afetiva dos adultos que um dia foram crianças e que agora desejam oferecer aos
              pequenos aquilo que há de mais precioso: tempo, carinho, segurança e liberdade para sonhar.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Na {site.nome}, cada peça é criada artesanalmente, com atenção aos detalhes e, principalmente, com
              respeito à infância. Não criamos simplesmente bonecas ou bichinhos.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-800">
              <strong className="font-semibold">Criamos companheiros de histórias.</strong>
              <br />
              <strong className="font-semibold">
                Criamos pequenos pedaços de afeto que podem atravessar gerações.
              </strong>
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Por isso, {site.nome} não é uma fábrica de bonecas.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              É um ateliê onde tecidos, linhas, cores e imaginação se encontram para materializar uma missão que
              nos acompanha há décadas: cuidar da infância, despertar o imaginário e espalhar carinho.
            </p>

            <p className="mt-5 leading-relaxed text-sepia-700">
              Porque acreditamos que uma infância cercada de afeto pode deixar o mundo um pouquinho mais doce.
            </p>

            <p className="mt-8 text-center font-script text-3xl leading-snug text-rosa-600 sm:text-4xl">
              E é por isso que continuamos sonhando.
              <br />
              Para que as crianças continuem brincando.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal efeito="lado">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-rosa-200 via-creme-100 to-rosa-100 sombra-suave"
              style={{ borderRadius: '48% 52% 56% 44%' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
            />
            {bonecaDaVitrine && (
              <div className="absolute inset-6 overflow-hidden rounded-[2rem] sombra-suave">
                <FotoBoneca produto={bonecaDaVitrine} />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Nosso jeito</p>
          <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">O que a gente promete</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {[
              {
                t: 'Segurança em primeiro lugar',
                d: 'Rostinho bordado, sem olhos de plástico nem peças pequenas. Seguro desde o berço.',
              },
              {
                t: 'Tecido bom de verdade',
                d: 'Algodão e plush antialérgico, pré-lavados. Aguentam abraço apertado e lavagem à mão.',
              },
              {
                t: 'Nada de produção em série',
                d: 'Uma boneca por vez, criada aqui no ateliê. Cada peça sai única — não existem duas iguais.',
              },
              {
                t: 'Conversa de gente',
                d: 'Quem responde no WhatsApp é a mesma pessoa que costura. Sempre.',
              },
            ].map((item, i) => (
              <motion.li
                key={item.t}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-2xl border border-rosa-200 bg-white/70 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rosa-200 font-display text-rosa-700">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display text-lg text-sepia-900">{item.t}</span>
                  <span className="block text-sm text-sepia-500">{item.d}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl text-sepia-900 sm:text-4xl">Do retalho ao colo</h2>
          <p className="mx-auto mt-3 max-w-xl text-sepia-700">
            A linha do tempo do seu pedido, do primeiro “oi” no WhatsApp até a caixinha chegando na sua casa.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { e: '💬', t: 'Você escolhe a sua', d: 'Chama no WhatsApp e diz qual boneca te conquistou.' },
            { e: '📷', t: 'A gente confere', d: 'Mando fotos da peça pronta, de todos os ângulos, antes de fechar.' },
            { e: '🎀', t: 'Preparo com carinho', d: 'A boneca é revisada ponto a ponto e embalada para presente.' },
            { e: '📦', t: 'Chega em casa', d: 'Embalada para presente, com rastreio no WhatsApp.' },
          ].map((p, i) => (
            <Reveal key={p.t} delay={i * 0.08} efeito="zoom">
              <li className="relative flex h-full flex-col items-center gap-2 rounded-[1.5rem] border border-rosa-200 bg-white/75 p-6 text-center sombra-suave">
                <span className="text-3xl" aria-hidden="true">
                  {p.e}
                </span>
                <span className="font-display text-lg text-sepia-900">{p.t}</span>
                <span className="text-sm text-sepia-500">{p.d}</span>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rosa-600 px-3 py-0.5 text-[0.65rem] font-bold text-white">
                  {i + 1}
                </span>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <Reveal efeito="zoom">
          <div className="rounded-[2.5rem] border border-rosa-300 bg-white/70 px-6 py-12 sombra-suave">
            <p className="font-script text-3xl text-rosa-600 sm:text-4xl">{site.slogan}</p>
            <p className="mx-auto mt-4 max-w-lg text-sepia-700">
              Se você chegou até aqui, já dá para sentir o carinho. Vamos escolher a sua boneca?
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BotaoSonho
                tamanho="lg"
                href={linkWhatsApp(`Olá, ${site.nome}! Li a história do ateliê e quero levar uma boneca para casa 💕`)}
              />
              <Link
                to="/bonecas"
                className="rounded-full border-2 border-rosa-400 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-rosa-200"
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
