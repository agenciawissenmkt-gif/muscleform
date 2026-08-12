import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Doll3D from '../components/Doll3D';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';
import BotaoSonho from '../components/BotaoSonho';
import { produtos } from '../data/produtos';
import { linkWhatsApp, site } from '../config/site';

export default function Sobre() {
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
          <p className="mt-5 leading-relaxed text-sepia-700">
            O {site.nome} nasceu de um presente. Uma boneca costurada de madrugada, com retalhos guardados e muita
            vontade de acertar. Ela foi parar no colo de uma menina que dorme abraçada com ela até hoje — e foi
            assim que a gente entendeu que boneca de pano não é brinquedo, é companhia.
          </p>
          <p className="mt-4 leading-relaxed text-sepia-700">
            Desde então já foram mais de mil bonecas, cada uma com nome, cada uma com história. Continuamos
            fazendo tudo à mão, aqui em {site.cidade}, uma de cada vez, sem pressa.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal efeito="lado">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-rosa-200 via-creme-100 to-rosa-100 sombra-suave"
              animate={{ borderRadius: ['45% 55% 60% 40%', '60% 40% 45% 55%', '45% 55% 60% 40%'] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 p-10">
              <Doll3D spec={produtos[2].spec} profundidade={1.3} className="h-full w-full" />
            </div>
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
                d: 'Uma boneca por vez. Se você pedir duas iguais, elas ainda vão ter sorrisos diferentes.',
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
            A linha do tempo de uma encomenda, do primeiro “oi” no WhatsApp até a caixinha chegando na sua casa.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { e: '💬', t: 'Você conta o sonho', d: 'Manda a ideia, a foto, o nome — o que vier.' },
            { e: '✏️', t: 'A gente desenha', d: 'Envio o esboço e as opções de tecido para aprovar.' },
            { e: '🧵', t: 'Costura à mão', d: `Produção de ${site.prazoProducao}, com fotos do processo.` },
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
                href={linkWhatsApp(`Olá, ${site.nome}! Li a história do ateliê e quero encomendar uma boneca 💕`)}
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
