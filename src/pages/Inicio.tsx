import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Doll3D from '../components/Doll3D';
import DollArt, { CAMADAS } from '../components/DollArt';
import CardProduto from '../components/CardProduto';
import BotaoSonho from '../components/BotaoSonho';
import Reveal from '../components/Reveal';
import { categorias, produtos } from '../data/produtos';
import { linkWhatsApp, site } from '../config/site';

const destaques = produtos.filter((p) => p.destaque);
const amadas = produtos.filter((p) => p.maisVendida);

export default function Inicio() {
  return (
    <>
      <Hero />
      <FaixaCorrendo />
      <Categorias />
      <Destaques />
      <ComoNasce />
      <MaisAmadas />
      <Depoimentos />
      <ChamadaPersonalizada />
    </>
  );
}

/* ----------------------------------- Hero ----------------------------------- */

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 90]);
  const y2 = useTransform(scrollY, [0, 600], [0, -60]);
  const opacidade = useTransform(scrollY, [0, 420], [1, 0]);

  const [indice, setIndice] = useState(0);
  const vitrine = destaques.length ? destaques : produtos;

  useEffect(() => {
    const t = setInterval(() => setIndice((i) => (i + 1) % vitrine.length), 5200);
    return () => clearInterval(t);
  }, [vitrine.length]);

  const atual = vitrine[indice];

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <motion.div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-rosa-300/50 blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-creme-200/70 blur-3xl"
        style={{ y: y2 }}
      />
      <CoracoesFlutuantes />

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 text-center lg:order-1 lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-rosa-300 bg-white/70 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-rosa-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-neon-500" />
            Ateliê artesanal • {site.cidade}
          </span>

          <h1 className="mt-5 font-display text-4xl leading-[1.08] text-sepia-900 sm:text-5xl lg:text-6xl">
            Bonecas de pano
            <br />
            <span className="font-script text-5xl text-rosa-600 sm:text-6xl lg:text-7xl">feitas com amor</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-sepia-700 lg:mx-0">
            Cada boneca do <strong className="font-semibold">{site.nome}</strong> nasce à mão: tecido escolhido a
            dedo, rostinho bordado ponto a ponto e um coração costurado por dentro. Escolha a sua e leve um
            abraço para casa.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <BotaoSonho
              tamanho="lg"
              href={linkWhatsApp(
                `Olá, ${site.nome}! 💕 Vim pelo site e quero realizar meu sonho com uma boneca feita à mão.`,
              )}
            />
            <Link
              to="/bonecas"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-rosa-400 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-rosa-200 hover:shadow-lg sm:text-base"
            >
              Ver o catálogo
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-rosa-300/60 pt-6 text-center lg:text-left">
            {[
              { n: '+1.200', r: 'bonecas costuradas' },
              { n: '100%', r: 'feito à mão' },
              { n: '7 a 12', r: 'dias de produção' },
            ].map((item) => (
              <div key={item.r}>
                <dt className="font-display text-2xl text-rosa-700 sm:text-3xl">{item.n}</dt>
                <dd className="text-[0.7rem] uppercase tracking-wider text-sepia-500">{item.r}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div style={{ opacity: opacidade }} className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-lg">
            <motion.div
              className="absolute inset-4 rounded-[3rem] border-2 border-dashed border-rosa-300"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-8 rounded-[2.5rem] bg-gradient-to-br from-white/80 via-rosa-100 to-rosa-200 sombra-suave" />

            <motion.div
              key={atual.id}
              initial={{ opacity: 0, scale: 0.86, rotateY: -40 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 p-10"
            >
              <Doll3D spec={atual.spec} profundidade={1.5} className="h-full w-full" />
            </motion.div>

            <motion.div
              className="absolute -bottom-2 left-1/2 w-max -translate-x-1/2 rounded-full border border-rosa-200 bg-white/90 px-5 py-2 text-center shadow-lg backdrop-blur"
              key={`${atual.id}-nome`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Link to={`/boneca/${atual.slug}`} className="font-display text-sm text-sepia-900 sm:text-base">
                {atual.nome}
              </Link>
              <span className="ml-2 text-xs font-semibold text-rosa-700">✦ toque e gire</span>
            </motion.div>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {vitrine.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIndice(i)}
                aria-label={`Ver ${p.nome}`}
                className={`h-2 rounded-full transition-all ${
                  i === indice ? 'w-8 bg-rosa-600' : 'w-2 bg-rosa-300 hover:bg-rosa-400'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CoracoesFlutuantes() {
  const coracoes = [
    { left: '8%', top: '18%', d: 0, s: 22 },
    { left: '92%', top: '12%', d: 1.5, s: 16 },
    { left: '78%', top: '76%', d: 2.4, s: 20 },
    { left: '14%', top: '68%', d: 3.2, s: 14 },
    { left: '46%', top: '6%', d: 4, s: 12 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {coracoes.map((c, i) => (
        <motion.span
          key={i}
          className="absolute text-rosa-400/70"
          style={{ left: c.left, top: c.top, fontSize: c.s }}
          animate={{ y: [0, -26, 0], rotate: [-8, 8, -8], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 7 + i, repeat: Infinity, delay: c.d, ease: 'easeInOut' }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  );
}

/* -------------------------------- Faixa ------------------------------------- */

function FaixaCorrendo() {
  const itens = [
    'Feito à mão, um por vez',
    'Tecidos escolhidos a dedo',
    'Enchimento antialérgico',
    'Personalize com o nome',
    'Enviamos para todo o Brasil',
    'Embalagem de presente',
  ];
  const lista = [...itens, ...itens];

  return (
    <div className="relative overflow-hidden border-y border-rosa-300/60 bg-white/50 py-3">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {lista.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-sepia-700 sm:text-sm"
          >
            <span className="text-rosa-500" aria-hidden="true">
              ✿
            </span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Categorias ---------------------------------- */

function Categorias() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Escolha por coleção</p>
        <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">
          Cada cantinho do ateliê tem uma
          <span className="font-script text-rosa-600"> história</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.07} efeito="zoom">
            <Link
              to={`/categoria/${c.slug}`}
              className="group relative flex h-full items-center gap-4 overflow-hidden rounded-[1.75rem] border border-rosa-200 bg-white/75 p-5 transition-all duration-300 sombra-suave hover:-translate-y-1.5 hover:border-rosa-400"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-rosa-100 transition-transform duration-500 group-hover:scale-110">
                {CAMADAS.map(({ camada }) => (
                  <DollArt
                    key={camada}
                    spec={c.capa}
                    camada={camada}
                    className="absolute inset-0 h-full w-full"
                  />
                ))}
              </div>
              <div>
                <span className="text-xl" aria-hidden="true">
                  {c.emoji}
                </span>
                <h3 className="font-display text-xl text-sepia-900 transition-colors group-hover:text-rosa-700">
                  {c.nome}
                </h3>
                <p className="mt-1 text-sm leading-snug text-sepia-500">{c.subtitulo}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rosa-600">
                  ver coleção
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Destaques ---------------------------------- */

function Destaques() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Recém-saídas do ateliê</p>
            <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">Nossos destaques</h2>
          </div>
          <Link
            to="/bonecas"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rosa-700"
          >
            ver todas
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {destaques.slice(0, 8).map((p, i) => (
            <CardProduto key={p.id} produto={p} indice={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Como nasce ---------------------------------- */

function ComoNasce() {
  const passos = [
    { emoji: '✂️', titulo: 'Escolha do tecido', texto: 'Algodões e plush selecionados um a um, pensando no toque.' },
    { emoji: '🧵', titulo: 'Corte e costura', texto: 'Molde desenhado à mão, costurado devagar, sem pressa.' },
    { emoji: '🪡', titulo: 'Rostinho bordado', texto: 'Olhinhos e sorriso bordados ponto a ponto — sem peças soltas.' },
    { emoji: '🎁', titulo: 'Embalagem de presente', texto: 'Sai daqui com laço, tag e um bilhetinho escrito à mão.' },
  ];

  return (
    <section className="relative overflow-hidden bg-white/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal efeito="lado">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Feito com amor</p>
            <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">
              Como nasce uma boneca <span className="font-script text-rosa-600">de pano</span>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-sepia-700">
              Não existe linha de produção aqui. Cada boneca leva horas de trabalho, e é por isso que nenhuma sai
              exatamente igual à outra — é isso que faz dela sua.
            </p>

            <ol className="mt-8 flex flex-col gap-4">
              {passos.map((p, i) => (
                <motion.li
                  key={p.titulo}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="flex items-start gap-4 rounded-2xl border border-rosa-200 bg-white/80 p-4 transition-transform hover:translate-x-1.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rosa-200 text-xl">
                    {p.emoji}
                  </span>
                  <span>
                    <span className="block font-display text-lg text-sepia-900">{p.titulo}</span>
                    <span className="block text-sm text-sepia-500">{p.texto}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
          </Reveal>

          <Reveal efeito="zoom" delay={0.15}>
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <motion.div
                className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-rosa-200 via-creme-100 to-rosa-100 sombra-suave"
                animate={{ borderRadius: ['40% 60% 55% 45%', '55% 45% 40% 60%', '40% 60% 55% 45%'] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 p-10">
                <Doll3D spec={produtos[0].spec} profundidade={1.3} className="h-full w-full" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Mais amadas --------------------------------- */

function MaisAmadas() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Escolhidas por muitas mães</p>
        <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">As mais amadas do ateliê</h2>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {amadas.map((p, i) => (
          <CardProduto key={p.id} produto={p} indice={i} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Depoimentos --------------------------------- */

function Depoimentos() {
  const falas = [
    {
      nome: 'Juliana M.',
      texto:
        'A boneca chegou mais linda do que nas fotos. Minha filha não larga desde o primeiro dia, dorme abraçada.',
      cidade: 'Curitiba — PR',
    },
    {
      nome: 'Patrícia S.',
      texto:
        'Encomendei a personalizada com a carinha da minha sobrinha. Minha irmã chorou quando abriu o presente.',
      cidade: 'São José dos Pinhais — PR',
    },
    {
      nome: 'Renata L.',
      texto: 'Comprei o kit maternidade e virou o xodó do quarto. Acabamento impecável, dá pra ver o carinho.',
      cidade: 'Florianópolis — SC',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-rosa-200/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-700">Quem já levou um sonho</p>
          <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">Recadinhos que a gente guarda</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {falas.map((f, i) => (
            <Reveal key={f.nome} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-[1.75rem] border border-white/70 bg-white/80 p-6 sombra-suave">
                <div className="text-lg text-rosa-500" aria-hidden="true">
                  ★★★★★
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-sepia-700">“{f.texto}”</blockquote>
                <figcaption className="mt-4 border-t border-rosa-200 pt-3">
                  <span className="block font-display text-base text-sepia-900">{f.nome}</span>
                  <span className="block text-xs text-sepia-500">{f.cidade}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Chamada personalizada --------------------------- */

function ChamadaPersonalizada() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal efeito="zoom">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-rosa-300 bg-gradient-to-br from-white via-rosa-100 to-rosa-200 px-6 py-14 text-center sombra-suave sm:px-12">
          <motion.div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-rosa-300/50 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 9, repeat: Infinity }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-700">Boneca personalizada</p>
          <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl lg:text-5xl">
            Me manda a foto que eu costuro
            <br />
            <span className="font-script text-rosa-600">a versão de pano</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-sepia-700">
            Mesmo tom de pele, mesmo cabelo, a roupinha favorita e o nome bordado na barra do vestido. O presente
            que ninguém esquece.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BotaoSonho
              tamanho="lg"
              href={linkWhatsApp(
                `Olá, ${site.nome}! 💕 Quero encomendar uma boneca personalizada. Posso mandar a foto?`,
              )}
            />
            <Link
              to="/categoria/personalizadas"
              className="inline-flex items-center gap-2 rounded-full border-2 border-rosa-400 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-white"
            >
              ver exemplos
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
