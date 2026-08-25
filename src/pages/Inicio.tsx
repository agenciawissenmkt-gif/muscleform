import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import FotoBoneca, { SemFoto } from '../components/FotoBoneca';
import CardProduto from '../components/CardProduto';
import BotaoSonho from '../components/BotaoSonho';
import Reveal from '../components/Reveal';
import { useCatalogo } from '../store/catalogo';
import { AvisoCatalogo, CartoesFantasma } from '../components/EstadoCatalogo';
import type { Categoria, Produto } from '../data/types';
import { linkWhatsApp, site } from '../config/site';

interface ListaProps {
  destaques: Produto[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

export default function Inicio() {
  const { produtos, categorias, destaques, maisAmadas, comFotoEstudio, carregando, erro, recarregar } =
    useCatalogo();

  // no topo entram as bonecas fotografadas em estúdio; sem elas, qualquer peça com foto
  const comQualquerFoto = produtos.filter((p) => p.foto ?? p.fotoEstudio);
  const vitrine = comFotoEstudio.length ? comFotoEstudio : comQualquerFoto;

  // uma foto de cada coleção, para a capa das categorias
  const capas: Record<string, Produto | undefined> = {};
  for (const c of categorias) {
    capas[c.slug] = comQualquerFoto.find((p) => p.categoria === c.slug);
  }

  return (
    <>
      <Hero vitrine={vitrine} />
      <FaixaCorrendo />
      {categorias.length > 0 && <Categorias categorias={categorias} capas={capas} />}
      <Destaques destaques={destaques} carregando={carregando} erro={erro} recarregar={recarregar} />
      <ComoNasce boneca={comQualquerFoto[0]} />
      <Seguranca />
      {maisAmadas.length > 0 && <MaisAmadas amadas={maisAmadas} />}
      <ParaOsAvos boneca={comQualquerFoto[1] ?? comQualquerFoto[0]} />
      <Depoimentos />
      <ChamadaFinal />
    </>
  );
}

/* ----------------------------------- Hero ----------------------------------- */

function Hero({ vitrine }: { vitrine: Produto[] }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 90]);
  const y2 = useTransform(scrollY, [0, 600], [0, -60]);
  const opacidade = useTransform(scrollY, [0, 420], [1, 0]);

  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (vitrine.length < 2) return;
    const t = setInterval(() => setIndice((i) => (i + 1) % vitrine.length), 5200);
    return () => clearInterval(t);
  }, [vitrine.length]);

  const atual = vitrine[Math.min(indice, Math.max(vitrine.length - 1, 0))];

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <motion.div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-rosa-300/30 blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-creme-200/45 blur-3xl"
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
            dedo, rostinho feito com capricho e um coração costurado por dentro. Escolha a sua e leve um
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

          <dl className="mt-10 grid grid-cols-2 gap-3 border-t border-rosa-300/60 pt-6 text-center lg:text-left">
            {[
              { n: '7 a 12', r: 'dias de produção' },
              { n: 'Única', r: 'nenhuma sai igual' },
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

            {atual ? (
              <FotoHero
                key={atual.id}
                foto={(atual.fotoEstudio ?? atual.foto)!}
                nome={atual.nome}
              />
            ) : (
              <div className="absolute inset-8 animate-pulse rounded-[2.5rem] bg-rosa-200/60" />
            )}

            {atual && (
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
              <span className="ml-2 text-xs font-semibold text-rosa-700">✦ ver detalhes</span>
            </motion.div>
            )}
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

/** Foto da boneca no topo da home: flutua de leve e inclina junto com o mouse. */
function FotoHero({ foto, nome }: { foto: string; nome: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const giroX = useSpring(useMotionValue(0), { stiffness: 90, damping: 16 });
  const giroY = useSpring(useMotionValue(0), { stiffness: 90, damping: 16 });

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return;
    const caixa = ref.current?.getBoundingClientRect();
    if (!caixa) return;
    giroY.set(((e.clientX - caixa.left) / caixa.width - 0.5) * 16);
    giroX.set(-((e.clientY - caixa.top) / caixa.height - 0.5) * 12);
  }

  return (
    <div
      ref={ref}
      className="cena-3d absolute inset-8"
      onPointerMove={mover}
      onPointerLeave={() => {
        giroX.set(0);
        giroY.set(0);
      }}
    >
      <motion.div
        className="h-full w-full overflow-hidden rounded-[2.5rem] border border-white/60 sombra-suave"
        style={{ rotateX: giroX, rotateY: giroY }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={foto}
          alt={`${nome} — boneca de pano feita à mão`}
          className="h-full w-full object-cover"
          decoding="async"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}

function CoracoesFlutuantes() {
  const coracoes = [
    { left: '8%', top: '18%', d: 0, s: 22 },
    { left: '92%', top: '12%', d: 1.5, s: 16 },
    { left: '78%', top: '76%', d: 2.4, s: 20 },
    { left: '14%', top: '68%', d: 3.2, s: 14 },
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
    'Cada peça é única',
    'Enviamos para todo o Brasil',
    'Sacola kraft personalizada',
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

function Categorias({
  categorias,
  capas,
}: {
  categorias: Categoria[];
  capas: Record<string, Produto | undefined>;
}) {
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
        {categorias.map((c: Categoria, i: number) => (
          <Reveal key={c.slug} delay={i * 0.07} efeito="zoom">
            <Link
              to={`/categoria/${c.slug}`}
              className="group relative flex h-full items-center gap-4 overflow-hidden rounded-[1.75rem] border border-rosa-200 bg-white/75 p-5 transition-all duration-300 sombra-suave hover:-translate-y-1.5 hover:border-rosa-400"
            >
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-rosa-100 transition-transform duration-500 group-hover:scale-110">
                {capas[c.slug] ? <FotoBoneca produto={capas[c.slug]!} /> : <SemFoto />}
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

function Destaques({ destaques, carregando, erro, recarregar }: ListaProps) {
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

        {carregando && <CartoesFantasma quantidade={4} />}

        {erro && !carregando && <AvisoCatalogo mensagem={erro} aoTentarDeNovo={recarregar} />}

        {!carregando && !erro && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destaques.slice(0, 8).map((p, i) => (
              <CardProduto key={p.id} produto={p} indice={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ Como nasce ---------------------------------- */

function ComoNasce({ boneca }: { boneca?: Produto }) {
  const passos = [
    { emoji: '✂️', titulo: 'Escolha do tecido', texto: 'Tecidos selecionados um a um, pensando no toque e na durabilidade.' },
    { emoji: '🧵', titulo: 'Corte e costura', texto: 'Molde desenhado à mão, costurado devagar, sem pressa.' },
    {
      emoji: '🪡',
      titulo: 'Rostinho caprichado',
      texto: 'Nos brinquedos para bebê, olhinhos e sorriso bordados ponto a ponto.',
    },
    {
      emoji: '🎁',
      titulo: 'Embalagem do ateliê',
      texto: 'Papel de seda personalizado, sacola kraft e lacre de segurança com a nossa etiqueta.',
    },
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
              {/* girar é de graça para o navegador; animar a borda repinta tudo a cada quadro */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-rosa-200 via-creme-100 to-rosa-100 sombra-suave"
                style={{ borderRadius: '46% 54% 58% 42%' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
              />
              {boneca && (
                <div className="absolute inset-8 overflow-hidden rounded-[2rem] sombra-suave">
                  <FotoBoneca produto={boneca} />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Segurança ---------------------------------- */

function Seguranca() {
  const itens = [
    {
      e: '🌿',
      t: 'Tudo antialérgico',
      d: 'Tecidos antialérgicos e enchimento atóxico, sem cheiro e sem tratamento químico.',
    },
    {
      e: '🧵',
      t: 'Não solta pelinho',
      d: 'Tecido que não desfia e acabamento firme: nada solta e nada vai parar na boquinha.',
    },
    {
      e: '👀',
      t: 'Rostinho seguro',
      d: 'Nos brinquedos para bebê, olhos, fuça e boquinha bordados. Nos demais, plástico com trava interna ou costurado com fio de poliamida super reforçado.',
    },
    {
      e: '💪',
      t: 'Costura dupla',
      d: 'Reforçada ponto a ponto. Aguenta puxão, arrasto pela casa e abraço apertado por anos.',
    },
    {
      e: '👶',
      t: 'Feitos para o berço',
      d: 'Os brinquedos para bebê são pensados para recém-nascidos: rostinho todo bordado, sem peça pequena para soltar.',
    },
    {
      e: '🫧',
      t: 'Cuidado orientado',
      d: 'Cada peça pede um cuidado. A gente explica no WhatsApp como limpar a sua sem estragar.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Pode entregar na mãozinha</p>
          <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">
            Segura para bebê, <span className="font-script text-rosa-600">de verdade</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-sepia-700">
            Boneca de pano bem feita não solta pelo e não rasga. A nossa é costurada pensando em quem ainda leva
            tudo à boca — e a linha para bebê vai com o rostinho todo bordado.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((item, i) => (
            <Reveal key={item.t} delay={i * 0.06} efeito="zoom">
              <div className="flex h-full items-start gap-4 rounded-[1.5rem] border border-rosa-200 bg-white/80 p-5 transition-transform hover:-translate-y-1 sombra-suave">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neon-400/25 text-xl">
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
      </div>
    </section>
  );
}

/* -------------------------------- Avós -------------------------------------- */

function ParaOsAvos({ boneca }: { boneca?: Produto }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal efeito="zoom">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2.5rem] border border-creme-200 bg-creme-100 p-6 sombra-suave sm:p-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Para vó e vô</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-sepia-900 sm:text-4xl">
              O presente que o neto
              <br />
              <span className="font-script text-rosa-600">guarda a vida inteira</span>
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-sepia-700">
              Brinquedo de moda dura uma estação. Boneca de pano dura a infância toda — e depois vai para a
              estante do quarto de adulto. Quando a vó dá uma, ela está deixando um abraço que fica no quarto
              mesmo quando ela não está lá.
            </p>

            <ul className="mt-6 flex flex-col gap-2.5">
              {[
                'Segura para neto pequeno, recém-nascido e prematuro',
                'Aguenta anos de uso — não rasga e não desbota',
                'Vai na sacola kraft do ateliê, em papel de seda e com lacre de segurança',
                'A gente ajuda a escolher pelo WhatsApp, sem pressa',
              ].map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2.5 text-sepia-700"
                >
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neon-400 text-[0.6rem] text-neon-900">
                    ✓
                  </span>
                  {t}
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BotaoSonho
                href={linkWhatsApp(
                  `Olá, ${site.nome}! 💕 Quero dar uma boneca de presente para meu neto(a). Pode me ajudar a escolher?`,
                )}
              >
                Realize seu sonho
              </BotaoSonho>
              <Link
                to="/bonecas"
                className="inline-flex items-center justify-center rounded-full border-2 border-rosa-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-rosa-200"
              >
                ver as bonecas
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-xs">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rosa-200 to-creme-50" />
            {boneca && (
              <div className="absolute inset-4 overflow-hidden rounded-full sombra-suave">
                <FotoBoneca produto={boneca} />
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------ Mais amadas --------------------------------- */

function MaisAmadas({ amadas }: { amadas: Produto[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Escolhidas por muitas mães</p>
        <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl">As mais amadas do ateliê</h2>
      </Reveal>

      {amadas.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {amadas.map((p, i) => (
            <CardProduto key={p.id} produto={p} indice={i} />
          ))}
        </div>
      )}
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
        'Comprei de presente para minha sobrinha e minha irmã chorou quando abriu a caixa. O acabamento é de outro mundo.',
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

/* ------------------------------ Chamada final -------------------------------- */

function ChamadaFinal() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal efeito="zoom">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-rosa-300 bg-gradient-to-br from-white via-rosa-100 to-rosa-200 px-6 py-14 text-center sombra-suave sm:px-12">
          <motion.div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-rosa-300/35 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 9, repeat: Infinity }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-700">Peças únicas</p>
          <h2 className="mt-3 font-display text-3xl text-sepia-900 sm:text-4xl lg:text-5xl">
            Cada boneca é feita uma vez só
            <br />
            <span className="font-script text-rosa-600">e vai embora do jeitinho que você vê</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-sepia-700">
            As bonecas nascem aqui no ateliê, uma de cada vez, e são fotografadas exatamente como chegam na sua
            casa: mesmo tecido, mesmo cabelo, mesma roupinha. Quando uma vai embora, ela não se repete.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BotaoSonho
              tamanho="lg"
              href={linkWhatsApp(
                `Olá, ${site.nome}! 💕 Vi as bonecas no site e quero saber quais estão disponíveis.`,
              )}
            />
            <Link
              to="/bonecas"
              className="inline-flex items-center gap-2 rounded-full border-2 border-rosa-400 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-white"
            >
              ver quem está no ateliê
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
