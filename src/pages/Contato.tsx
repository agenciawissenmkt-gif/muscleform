import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import BotaoSonho from '../components/BotaoSonho';
import { IconeWhats } from '../components/Rodape';
import { linkWhatsApp, site } from '../config/site';

const perguntas = [
  {
    p: 'Quanto tempo demora para ficar pronta?',
    r: `A produção leva ${site.prazoProducao} depois da confirmação do pedido, porque tudo é costurado à mão. Peças personalizadas podem levar alguns dias a mais — a gente sempre combina o prazo antes.`,
  },
  {
    p: 'A boneca é segura para bebê?',
    r: 'Sim. O rostinho é bordado, sem olhos de plástico, botões ou peças pequenas que possam soltar. O enchimento é de fibra siliconada antialérgica.',
  },
  {
    p: 'Posso pedir com a carinha da minha filha?',
    r: 'Pode! É a nossa boneca personalizada: você manda a foto pelo WhatsApp e a gente reproduz o tom de pele, o cabelo, a roupinha favorita e borda o nome.',
  },
  {
    p: 'Vocês enviam para todo o Brasil?',
    r: 'Sim, enviamos por Correios ou transportadora, com código de rastreio enviado no WhatsApp. Em Curitiba e região dá para combinar retirada ou entrega.',
  },
  {
    p: 'Como faço para pagar?',
    r: 'Pix (com desconto), cartão em até 3x sem juros ou transferência. Tudo combinado direto na conversa, sem cadastro nem formulário chato.',
  },
  {
    p: 'Posso lavar a boneca?',
    r: 'Pode, à mão, com sabão neutro e água fria, secando à sombra. Nada de máquina, alvejante ou secadora — assim ela dura anos bonita.',
  },
];

export default function Contato() {
  const [nome, setNome] = useState('');
  const [assunto, setAssunto] = useState('Quero encomendar uma boneca');
  const [mensagem, setMensagem] = useState('');

  const textoWhats = [
    `Olá, ${site.nome}! 💕`,
    nome.trim() ? `Meu nome é ${nome.trim()}.` : '',
    `Assunto: ${assunto}`,
    mensagem.trim() ? `\n${mensagem.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <Reveal className="pt-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Fale com o ateliê</p>
        <h1 className="mt-3 font-display text-4xl text-sepia-900 sm:text-5xl">
          A gente adora <span className="font-script text-rosa-600">conversar</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-sepia-700">
          Quem responde é a mesma pessoa que costura. Conte sua ideia, tire dúvidas ou só venha dizer oi.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <form
            className="rounded-[2rem] border border-rosa-200 bg-white/75 p-6 sombra-suave sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              window.open(linkWhatsApp(textoWhats), '_blank', 'noopener');
            }}
          >
            <p className="font-display text-2xl text-sepia-900">Monte sua mensagem</p>
            <p className="mt-1 text-sm text-sepia-500">
              Ao enviar, abre o WhatsApp já com tudo escrito — é só apertar o enviar.
            </p>

            <label className="mt-6 block text-sm font-semibold text-sepia-700">
              Seu nome
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como te chamamos?"
                className="mt-1.5 w-full rounded-full border border-rosa-200 bg-rosa-50 px-4 py-2.5 text-sm font-normal outline-none transition-all placeholder:text-sepia-300 focus:border-rosa-400 focus:bg-white"
              />
            </label>

            <p className="mt-5 text-sm font-semibold text-sepia-700">Sobre o que quer falar?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                'Quero encomendar uma boneca',
                'Boneca personalizada',
                'Lembrancinhas para festa',
                'Dúvida sobre prazo e envio',
              ].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAssunto(a)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    assunto === a
                      ? 'border-rosa-500 bg-rosa-200 text-rosa-700'
                      : 'border-rosa-200 bg-white text-sepia-700 hover:border-rosa-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-sm font-semibold text-sepia-700">
              Conte sua ideia
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={4}
                placeholder="Ex.: queria uma boneca de 38 cm, cabelo cacheado, vestido lilás, com o nome Cecília bordado."
                className="mt-1.5 w-full resize-none rounded-2xl border border-rosa-200 bg-rosa-50 px-4 py-3 text-sm font-normal outline-none transition-all placeholder:text-sepia-300 focus:border-rosa-400 focus:bg-white"
              />
            </label>

            <BotaoSonho tamanho="lg" className="mt-6 w-full">
              Realize seu sonho
            </BotaoSonho>
            <p className="mt-3 text-center text-xs text-sepia-500">
              Respondemos de segunda a sábado, das 9h às 19h 💕
            </p>
          </form>
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal delay={0.1}>
            <a
              href={linkWhatsApp(`Olá, ${site.nome}! Vim pelo site 💕`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-[1.5rem] border border-rosa-200 bg-white/75 p-5 transition-all hover:-translate-y-1 sombra-suave"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neon-400 text-neon-900">
                <IconeWhats className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-display text-lg text-sepia-900">WhatsApp</span>
                <span className="block text-sm text-sepia-500">{site.whatsappExibicao}</span>
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.16}>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-[1.5rem] border border-rosa-200 bg-white/75 p-5 transition-all hover:-translate-y-1 sombra-suave"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rosa-200 text-xl">
                📸
              </span>
              <span>
                <span className="block font-display text-lg text-sepia-900">Instagram</span>
                <span className="block text-sm text-sepia-500">{site.instagramUser}</span>
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.22}>
            <div className="rounded-[1.5rem] border border-rosa-200 bg-white/75 p-5 sombra-suave">
              <p className="font-display text-lg text-sepia-900">Onde a gente costura</p>
              <p className="mt-1 text-sm text-sepia-500">
                {site.cidade} — atendimento com hora marcada para provar as bonecas pessoalmente.
              </p>
              <p className="mt-3 text-sm text-sepia-500">
                <strong className="text-sepia-800">E-mail:</strong> {site.email}
              </p>
              <p className="mt-1 text-sm text-sepia-500">
                <strong className="text-sepia-800">Produção:</strong> {site.prazoProducao}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <section className="mt-20">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl text-sepia-900 sm:text-4xl">Dúvidas frequentes</h2>
        </Reveal>
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-2">
          {perguntas.map((q, i) => (
            <Pergunta key={q.p} pergunta={q.p} resposta={q.r} indice={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Pergunta({ pergunta, resposta, indice }: { pergunta: string; resposta: string; indice: number }) {
  const [aberta, setAberta] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: indice * 0.05 }}
      className="overflow-hidden rounded-2xl border border-rosa-200 bg-white/75"
    >
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-sepia-900"
      >
        {pergunta}
        <motion.span animate={{ rotate: aberta ? 45 : 0 }} className="text-xl text-rosa-600">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {aberta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-sepia-700">{resposta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
