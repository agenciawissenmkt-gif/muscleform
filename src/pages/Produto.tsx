import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import VisualizadorProduto from '../components/VisualizadorProduto';
import CardProduto from '../components/CardProduto';
import BotaoSonho from '../components/BotaoSonho';
import Reveal from '../components/Reveal';
import { formatarPreco, parcelamento } from '../lib/formato';
import { useCatalogo } from '../store/catalogo';
import { AvisoCatalogo, ProdutoFantasma } from '../components/EstadoCatalogo';
import { useCarrinho } from '../store/carrinho';
import { linkWhatsApp, site } from '../config/site';
import NaoEncontrada from './NaoEncontrada';


export default function Produto() {
  const { slug } = useParams();
  const { produtoPorSlug, categoriaPorSlug, relacionados, carregando, erro, recarregar } = useCatalogo();
  const produto = slug ? produtoPorSlug(slug) : undefined;

  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { adicionar } = useCarrinho();

  // enquanto o botão de compra estiver na tela, a barra fixa do celular sai da frente
  const areaCompra = useRef<HTMLDivElement>(null);
  const compraNaTela = useInView(areaCompra, { margin: '-90px 0px -140px 0px' });

  if (carregando) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProdutoFantasma />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AvisoCatalogo mensagem={erro} aoTentarDeNovo={recarregar} />
      </div>
    );
  }

  if (!produto) return <NaoEncontrada />;

  const categoria = categoriaPorSlug(produto.categoria);
  const { vezes, valor } = parcelamento(produto.preco);
  const total = produto.preco * quantidade;

  const mensagem = [
    `Olá, ${site.nome}! 💕`,
    '',
    `Quero realizar meu sonho com a *${produto.nome}*.`,
    `• Quantidade: ${quantidade}`,
    `• Valor: ${formatarPreco(total)}`,
    '',
    'Como faço para fechar o pedido?',
  ]
    .filter(Boolean)
    .join('\n');

  function paraSacolinha() {
    if (!produto) return;
    adicionar({ produtoId: produto.id, quantidade });
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
            <VisualizadorProduto
              spec={produto.spec}
              nome={produto.nome}
              foto={produto.foto}
              legendaFoto={produto.legendaFoto}
            />
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

            {/* segurança — o que mais tranquiliza quem está comprando */}
            <Reveal className="mt-7" delay={0.1}>
              <SeloSeguranca />
            </Reveal>

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

              <div ref={areaCompra}>
                <BotaoSonho href={linkWhatsApp(mensagem)} tamanho="lg" className="w-full" />
              </div>

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

            <Reveal className="mt-5">
              <PresenteDeAvo nome={produto.nome} texto={produto.presenteAvo} />
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
              <Sanfona titulo="Segurança para bebês e crianças pequenas">
                <p>
                  Esta peça pode ir para o berço desde o primeiro dia, inclusive de bebês prematuros. Todo o
                  rostinho é bordado à mão — <strong>não existe olho de plástico, botão, miçanga ou aplique
                  colado</strong> que possa soltar e ir parar na boquinha. O cabelo é preso fio a fio e o tecido
                  é fechado com costura dupla: <strong>não solta pelinho, não solta fiapo e não desfia</strong>.
                  O enchimento é de fibra siliconada antialérgica, atóxica, sem cheiro e sem tratamento químico —
                  o mesmo usado em travesseiro de bebê.
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
        initial={{ y: 120 }}
        animate={{ y: compraNaTela ? 120 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
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

/** Bloco de segurança — é a informação que mais tranquiliza quem compra para bebê. */
function SeloSeguranca() {
  const itens = [
    {
      i: '🌿',
      t: 'Tecido antialérgico',
      d: 'Algodão hipoalergênico pré-lavado e enchimento de fibra siliconada atóxica, sem cheiro e sem tratamento químico.',
    },
    {
      i: '🧵',
      t: 'Não solta pelinho nem fiapo',
      d: 'O cabelo é costurado fio a fio e o tecido não desfia — nada solta, nada vai parar na boquinha ou no narizinho.',
    },
    {
      i: '👀',
      t: 'Nenhuma peça que possa soltar',
      d: 'O rostinho é todo bordado à mão: sem olho de plástico, botão, miçanga ou aplique colado.',
    },
    {
      i: '💪',
      t: 'Costura dupla — não rasga',
      d: 'Reforçada ponto a ponto: aguenta puxão, arrasto pela casa e abraço apertado por muitos anos.',
    },
    {
      i: '👶',
      t: 'Segura desde o primeiro dia',
      d: 'Pode ir para o berço de recém-nascidos e de bebês prematuros, e para a mão de crianças pequenas, sem preocupação nenhuma.',
    },
  ];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border-2 border-neon-400/60 bg-white/85">
      <div className="flex items-center gap-2.5 border-b border-neon-400/40 bg-neon-400/15 px-5 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neon-400 text-neon-900">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="font-display text-lg leading-tight text-sepia-900">
          Feita para bebê brincar sem susto
        </p>
      </div>

      <ul className="flex flex-col gap-3 p-5">
        {itens.map((item, i) => (
          <motion.li
            key={item.t}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5 text-lg" aria-hidden="true">
              {item.i}
            </span>
            <span>
              <span className="block text-sm font-bold text-sepia-900">{item.t}</span>
              <span className="block text-sm leading-relaxed text-sepia-500">{item.d}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Recadinho para avós — o painel pode escrever um texto próprio por peça. */
function PresenteDeAvo({ nome, texto }: { nome: string; texto?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-creme-200 bg-creme-100 p-6">
      <span className="absolute -right-4 -top-4 text-7xl opacity-20" aria-hidden="true">
        👵
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rosa-600">Presente de avó</p>
      <p className="mt-3 leading-relaxed text-sepia-700">
        {texto ??
          `A ${nome} é daquelas lembranças que ficam. Vó e vô que dão uma boneca de pano não estão dando um brinquedo de moda — estão dando o abraço que fica no quarto quando eles não estão. É segura para o neto pequeno, aguenta anos de uso e volta em foto de aniversário, um ano atrás do outro.`}
      </p>
      <p className="mt-3 text-sm text-sepia-500">
        Se for presente, a gente embala com laço e escreve o seu recadinho à mão no cartão — é só avisar no
        WhatsApp.
      </p>
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
