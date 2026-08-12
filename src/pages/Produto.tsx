import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import VisualizadorProduto from '../components/VisualizadorProduto';
import CardProduto from '../components/CardProduto';
import BotaoSonho from '../components/BotaoSonho';
import Reveal from '../components/Reveal';
import { categoriaPorSlug, formatarPreco, parcelamento, produtoPorSlug, relacionados } from '../data/produtos';
import { useCarrinho } from '../store/carrinho';
import { linkWhatsApp, site } from '../config/site';
import NaoEncontrada from './NaoEncontrada';

const coresVestido = [
  { nome: 'Rosa bebê', cor: '#f9b4c6' },
  { nome: 'Rosa antigo', cor: '#ffd0dc' },
  { nome: 'Creme', cor: '#fdf6ec' },
  { nome: 'Lavanda', cor: '#e2dcf6' },
  { nome: 'Verde menta', cor: '#cdeee0' },
  { nome: 'Branco', cor: '#fffafb' },
];

export default function Produto() {
  const { slug } = useParams();
  const produto = slug ? produtoPorSlug(slug) : undefined;

  const [nomeBordado, setNomeBordado] = useState('');
  const [corEscolhida, setCorEscolhida] = useState(coresVestido[0].nome);
  const [observacao, setObservacao] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { adicionar } = useCarrinho();

  const spec = useMemo(() => {
    if (!produto) return undefined;
    const cor = coresVestido.find((c) => c.nome === corEscolhida)?.cor;
    return cor ? { ...produto.spec, vestido: cor } : produto.spec;
  }, [produto, corEscolhida]);

  if (!produto || !spec) return <NaoEncontrada />;

  const categoria = categoriaPorSlug(produto.categoria);
  const { vezes, valor } = parcelamento(produto.preco);
  const total = produto.preco * quantidade;

  const mensagem = [
    `Olá, ${site.nome}! 💕`,
    '',
    `Quero realizar meu sonho com a *${produto.nome}*.`,
    `• Quantidade: ${quantidade}`,
    produto.personalizavel ? `• Cor do vestidinho: ${corEscolhida}` : '',
    nomeBordado.trim() ? `• Nome bordado: ${nomeBordado.trim()}` : '',
    observacao.trim() ? `• Observação: ${observacao.trim()}` : '',
    `• Valor: ${formatarPreco(total)}`,
    '',
    'Como faço para fechar o pedido?',
  ]
    .filter(Boolean)
    .join('\n');

  function paraSacolinha() {
    if (!produto) return;
    adicionar({
      produtoId: produto.id,
      quantidade,
      personalizacao: {
        nomeBordado: nomeBordado.trim() || undefined,
        corVestido: produto.personalizavel ? corEscolhida : undefined,
        observacao: observacao.trim() || undefined,
      },
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2600);
  }

  return (
    <div className="pb-28 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 py-5 text-xs text-sepia-500">
          <Link to="/" className="hover:text-rosa-700">
            Início
          </Link>
          <span aria-hidden="true">›</span>
          <Link to="/bonecas" className="hover:text-rosa-700">
            Bonecas
          </Link>
          {categoria && (
            <>
              <span aria-hidden="true">›</span>
              <Link to={`/categoria/${categoria.slug}`} className="hover:text-rosa-700">
                {categoria.nome}
              </Link>
            </>
          )}
          <span aria-hidden="true">›</span>
          <span className="text-sepia-800">{produto.nome}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* palco 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <VisualizadorProduto spec={spec} nome={produto.nome} />
          </motion.div>

          {/* informações e compra */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex flex-wrap items-center gap-2">
                {produto.novidade && <Selo classe="bg-lavanda-300 text-sepia-800">Novidade</Selo>}
                {produto.maisVendida && <Selo classe="bg-rosa-600 text-white">Mais amada</Selo>}
                <Selo classe="bg-creme-200 text-sepia-800">★★★★★ 4,9 · 128 avaliações</Selo>
              </div>

              <h1 className="mt-4 font-display text-4xl leading-tight text-sepia-900 sm:text-5xl">
                {produto.nome}
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-sepia-700">{produto.resumo}</p>

              <div className="mt-6 rounded-[1.5rem] border border-rosa-200 bg-white/70 p-5">
                <div className="flex flex-wrap items-end gap-3">
                  {produto.precoDe && (
                    <span className="text-lg text-sepia-300 line-through">{formatarPreco(produto.precoDe)}</span>
                  )}
                  <span className="font-display text-4xl text-rosa-700">{formatarPreco(produto.preco)}</span>
                  {produto.precoDe && (
                    <span className="rounded-full bg-neon-400 px-2.5 py-1 text-xs font-bold text-neon-900">
                      -{Math.round((1 - produto.preco / produto.precoDe) * 100)}%
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-sepia-500">
                  em até {vezes}x de <strong className="text-sepia-800">{formatarPreco(valor)}</strong> sem juros ·
                  ou no Pix com carinho
                </p>
              </div>
            </motion.div>

            {/* personalização */}
            {produto.personalizavel && (
              <Reveal className="mt-7" delay={0.1}>
                <div className="rounded-[1.5rem] border border-rosa-200 bg-rosa-50/80 p-5">
                  <p className="flex items-center gap-2 font-display text-lg text-sepia-900">
                    <span aria-hidden="true">🪡</span> Deixe do jeitinho de vocês
                  </p>

                  <label className="mt-4 block text-sm font-semibold text-sepia-700">
                    Nome para bordar
                    <input
                      type="text"
                      value={nomeBordado}
                      maxLength={18}
                      onChange={(e) => setNomeBordado(e.target.value)}
                      placeholder="Ex.: Manuela"
                      className="mt-1.5 w-full rounded-full border border-rosa-200 bg-white px-4 py-2.5 text-sm font-normal text-sepia-900 outline-none transition-all placeholder:text-sepia-300 focus:border-rosa-400"
                    />
                  </label>
                  <AnimatePresence>
                    {nomeBordado.trim() && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 font-script text-2xl text-rosa-700"
                      >
                        {nomeBordado}
                        <span className="ml-2 align-middle text-xs font-sans uppercase tracking-wider text-sepia-500">
                          ficará bordado assim ♥
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="mt-5 text-sm font-semibold text-sepia-700">Cor do vestidinho</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coresVestido.map((c) => (
                      <button
                        key={c.nome}
                        type="button"
                        onClick={() => setCorEscolhida(c.nome)}
                        title={c.nome}
                        className={`group relative h-11 w-11 rounded-full border-2 transition-all ${
                          corEscolhida === c.nome
                            ? 'scale-110 border-rosa-600 shadow-md'
                            : 'border-white hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.cor }}
                        aria-label={`Vestido ${c.nome}`}
                      >
                        {corEscolhida === c.nome && (
                          <motion.span
                            layoutId="cor-escolhida"
                            className="absolute -inset-1.5 rounded-full border-2 border-rosa-500"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-sepia-500">
                    Escolhida: <strong className="text-sepia-800">{corEscolhida}</strong> — a boneca ao lado já
                    mudou de vestido ✨
                  </p>

                  <label className="mt-5 block text-sm font-semibold text-sepia-700">
                    Algum pedido especial?
                    <textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows={2}
                      placeholder="Ex.: quero o cabelo cacheado e uma fitinha azul"
                      className="mt-1.5 w-full resize-none rounded-2xl border border-rosa-200 bg-white px-4 py-2.5 text-sm font-normal text-sepia-900 outline-none transition-all placeholder:text-sepia-300 focus:border-rosa-400"
                    />
                  </label>
                </div>
              </Reveal>
            )}

            {/* quantidade + compra */}
            <div className="mt-7 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-rosa-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    className="h-11 w-11 text-lg text-rosa-700"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{quantidade}</span>
                  <button
                    type="button"
                    onClick={() => setQuantidade((q) => Math.min(20, q + 1))}
                    className="h-11 w-11 text-lg text-rosa-700"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-sepia-500">
                  Total: <strong className="font-display text-xl text-rosa-700">{formatarPreco(total)}</strong>
                </span>
              </div>

              <BotaoSonho href={linkWhatsApp(mensagem)} tamanho="lg" className="w-full" />

              <button
                type="button"
                onClick={paraSacolinha}
                className="relative w-full rounded-full border-2 border-rosa-400 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-rosa-200 sm:text-base"
              >
                <AnimatePresence mode="wait">
                  {adicionado ? (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center justify-center gap-2"
                    >
                      ♥ guardada na sacolinha
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center justify-center gap-2"
                    >
                      guardar na sacolinha
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { i: '🪡', t: 'Feito à mão' },
                  { i: '🚚', t: 'Envio p/ todo Brasil' },
                  { i: '🎁', t: 'Embalagem presente' },
                  { i: '💬', t: 'Atendimento humano' },
                ].map((b) => (
                  <div
                    key={b.t}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-rosa-200 bg-white/60 px-2 py-3 text-center transition-transform hover:-translate-y-0.5"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {b.i}
                    </span>
                    <span className="text-[0.68rem] font-semibold leading-tight text-sepia-700">{b.t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* história */}
            <Reveal className="mt-9">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-rosa-200 bg-gradient-to-br from-white to-rosa-100 p-6">
                <span className="absolute -right-3 -top-3 text-7xl text-rosa-200" aria-hidden="true">
                  ❝
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rosa-600">A história dela</p>
                <p className="relative mt-3 leading-relaxed text-sepia-700">{produto.historia}</p>
                <p className="mt-4 font-script text-2xl text-rosa-700">{site.frase}</p>
              </div>
            </Reveal>

            {/* detalhes */}
            <div className="mt-8 flex flex-col gap-2">
              <Sanfona titulo="Materiais e acabamento" aberto>
                <ul className="flex flex-col gap-1.5">
                  {produto.materiais.map((m) => (
                    <li key={m} className="flex items-start gap-2">
                      <span className="mt-1 text-rosa-500" aria-hidden="true">
                        ✿
                      </span>
                      {m}
                    </li>
                  ))}
                </ul>
              </Sanfona>
              <Sanfona titulo="Medidas">
                <p>
                  Altura aproximada: <strong>{produto.altura}</strong>. Por serem feitas à mão, pode haver
                  variação de 1 a 2 cm — cada boneca tem seu próprio jeitinho.
                </p>
              </Sanfona>
              <Sanfona titulo="Como cuidar">
                <p>{produto.cuidados}</p>
              </Sanfona>
              <Sanfona titulo="Prazo e envio">
                <p>
                  Produção artesanal de <strong>{site.prazoProducao}</strong> após a confirmação do pedido. Depois
                  disso, enviamos por Correios ou transportadora para todo o Brasil, e você recebe o código de
                  rastreio no WhatsApp. Retirada combinada em {site.cidade}.
                </p>
              </Sanfona>
              <Sanfona titulo="Pagamento">
                <p>
                  Pix (com desconto especial), cartão em até {vezes}x sem juros ou transferência. Tudo combinado
                  direto no WhatsApp <strong>{site.whatsappExibicao}</strong> — sem robô, sem cadastro.
                </p>
              </Sanfona>
            </div>
          </div>
        </div>

        {/* relacionados */}
        <section className="mt-20">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Combina com</p>
            <h2 className="mt-3 font-display text-3xl text-sepia-900">Quem levou a {produto.nome} também amou</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relacionados(produto).map((p, i) => (
              <CardProduto key={p.id} produto={p} indice={i} />
            ))}
          </div>
        </section>
      </div>

      {/* barra fixa de compra no celular */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 220, damping: 26 }}
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-rosa-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-[0.65rem] uppercase tracking-wider text-sepia-500">Total</p>
            <p className="font-display text-xl leading-none text-rosa-700">{formatarPreco(total)}</p>
          </div>
          <BotaoSonho href={linkWhatsApp(mensagem)} className="flex-1" />
        </div>
      </motion.div>
    </div>
  );
}

function Selo({ children, classe }: { children: React.ReactNode; classe: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] ${classe}`}>
      {children}
    </span>
  );
}

function Sanfona({
  titulo,
  children,
  aberto = false,
}: {
  titulo: string;
  children: React.ReactNode;
  aberto?: boolean;
}) {
  const [visivel, setVisivel] = useState(aberto);
  return (
    <div className="overflow-hidden rounded-2xl border border-rosa-200 bg-white/70">
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-display text-lg text-sepia-900"
      >
        {titulo}
        <motion.span animate={{ rotate: visivel ? 45 : 0 }} className="text-xl text-rosa-600">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {visivel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-5 text-sm leading-relaxed text-sepia-700">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
