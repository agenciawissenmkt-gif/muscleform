import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DollPlana } from '../components/Doll3D';
import BotaoSonho from '../components/BotaoSonho';
import Reveal from '../components/Reveal';
import { formatarPreco, parcelamento, produtoPorId } from '../data/produtos';
import { useCarrinho } from '../store/carrinho';
import { linkWhatsApp, site } from '../config/site';

export default function Carrinho() {
  const { itens, total, alterarQuantidade, remover, limpar, mensagemWhatsApp } = useCarrinho();
  const { vezes, valor } = parcelamento(total);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <Reveal className="pt-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Quase lá</p>
        <h1 className="mt-3 font-display text-4xl text-sepia-900 sm:text-5xl">Sua sacolinha</h1>
        <p className="mx-auto mt-3 max-w-lg text-sepia-700">
          Confira as escolhidas e finalize no WhatsApp — do outro lado tem gente de verdade esperando você.
        </p>
      </Reveal>

      {itens.length === 0 ? (
        <Reveal className="mt-16 text-center" efeito="zoom">
          <span className="inline-block animate-flutuar text-6xl" aria-hidden="true">
            🎀
          </span>
          <p className="mt-6 font-display text-2xl text-sepia-900">Ainda não tem nenhum sonho aqui</p>
          <p className="mt-2 text-sepia-500">Vá até o catálogo e escolha a boneca que te chamou primeiro.</p>
          <Link
            to="/bonecas"
            className="mt-6 inline-block rounded-full bg-rosa-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-105"
          >
            ver as bonecas
          </Link>
        </Reveal>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <ul className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {itens.map((item) => {
                const produto = produtoPorId(item.produtoId);
                if (!produto) return null;
                return (
                  <motion.li
                    key={item.produtoId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0 }}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-rosa-200 bg-white/75 p-4 sm:flex-row sm:items-center"
                  >
                    <Link
                      to={`/boneca/${produto.slug}`}
                      className="relative h-36 w-28 shrink-0 self-center overflow-hidden rounded-2xl bg-rosa-100 transition-transform hover:scale-105"
                    >
                      <DollPlana spec={produto.spec} className="h-full w-full" />
                    </Link>

                    <div className="flex-1">
                      <Link
                        to={`/boneca/${produto.slug}`}
                        className="font-display text-xl text-sepia-900 hover:text-rosa-700"
                      >
                        {produto.nome}
                      </Link>
                      <p className="mt-1 text-sm text-sepia-500">{produto.resumo}</p>
                      {item.personalizacao?.corVestido && (
                        <p className="mt-2 text-xs text-sepia-500">
                          Vestido: <strong className="text-sepia-800">{item.personalizacao.corVestido}</strong>
                        </p>
                      )}
                      {item.personalizacao?.nomeBordado && (
                        <p className="text-xs text-sepia-500">
                          Nome bordado:{' '}
                          <strong className="font-script text-base text-rosa-700">
                            {item.personalizacao.nomeBordado}
                          </strong>
                        </p>
                      )}
                      {item.personalizacao?.observacao && (
                        <p className="mt-1 text-xs italic text-sepia-500">“{item.personalizacao.observacao}”</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center rounded-full border border-rosa-300 bg-rosa-50">
                          <button
                            type="button"
                            onClick={() => alterarQuantidade(item.produtoId, item.quantidade - 1)}
                            className="h-9 w-9 text-rosa-700"
                            aria-label="Diminuir"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">{item.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
                            className="h-9 w-9 text-rosa-700"
                            aria-label="Aumentar"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-display text-xl text-rosa-700">
                          {formatarPreco(produto.preco * item.quantidade)}
                        </span>
                        <button
                          type="button"
                          onClick={() => remover(item.produtoId)}
                          className="text-xs text-sepia-500 underline underline-offset-2 hover:text-rosa-700"
                        >
                          remover
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>

            <button
              type="button"
              onClick={limpar}
              className="self-start text-xs text-sepia-500 underline underline-offset-4 hover:text-rosa-700"
            >
              esvaziar sacolinha
            </button>
          </ul>

          <motion.aside
            layout
            className="rounded-[1.75rem] border border-rosa-200 bg-white/85 p-6 sombra-suave lg:sticky lg:top-28"
          >
            <p className="font-display text-2xl text-sepia-900">Resumo</p>

            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-sepia-700">
                <dt>Subtotal</dt>
                <dd>{formatarPreco(total)}</dd>
              </div>
              <div className="flex justify-between text-sepia-700">
                <dt>Frete</dt>
                <dd className="text-neon-600">calculado no WhatsApp</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-rosa-200 pt-3">
                <dt className="font-semibold text-sepia-900">Total</dt>
                <dd className="font-display text-2xl text-rosa-700">{formatarPreco(total)}</dd>
              </div>
            </dl>

            <p className="mt-2 text-xs text-sepia-500">
              ou {vezes}x de {formatarPreco(valor)} sem juros no cartão
            </p>

            <BotaoSonho href={linkWhatsApp(mensagemWhatsApp())} tamanho="lg" className="mt-5 w-full" />

            <p className="mt-3 text-center text-xs leading-relaxed text-sepia-500">
              Ao tocar, abre o WhatsApp {site.whatsappExibicao} com seu pedido já escrito.
            </p>

            <Link
              to="/bonecas"
              className="mt-4 block text-center text-xs font-semibold text-sepia-700 underline underline-offset-4 hover:text-rosa-700"
            >
              continuar escolhendo
            </Link>
          </motion.aside>
        </div>
      )}
    </div>
  );
}
