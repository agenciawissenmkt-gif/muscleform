import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../store/carrinho';
import { formatarPreco, produtoPorId } from '../data/produtos';
import MidiaProduto from './MidiaProduto';
import BotaoSonho from './BotaoSonho';
import { linkWhatsApp } from '../config/site';

/** Sacolinha lateral — some no celular, vira tela cheia. */
export default function GavetaCarrinho() {
  const { itens, total, gavetaAberta, fecharGaveta, alterarQuantidade, remover, mensagemWhatsApp } =
    useCarrinho();

  return (
    <AnimatePresence>
      {gavetaAberta && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-sepia-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fecharGaveta}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-rosa-50 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <header className="flex items-center justify-between border-b border-rosa-200 px-5 py-4">
              <div>
                <p className="font-display text-xl text-sepia-900">Sua sacolinha</p>
                <p className="text-xs text-sepia-500">
                  {itens.length ? `${itens.length} sonho(s) escolhido(s)` : 'ainda vazia por aqui'}
                </p>
              </div>
              <button
                type="button"
                onClick={fecharGaveta}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-rosa-300 text-rosa-700"
                aria-label="Fechar sacolinha"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {itens.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="text-5xl animate-flutuar" aria-hidden="true">
                    🧸
                  </span>
                  <p className="text-sm text-sepia-500">
                    Sua sacolinha está esperando por uma boneca feita à mão.
                  </p>
                  <Link
                    to="/bonecas"
                    onClick={fecharGaveta}
                    className="rounded-full bg-rosa-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
                  >
                    Ver as bonecas
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {itens.map((item) => {
                      const produto = produtoPorId(item.produtoId);
                      if (!produto) return null;
                      return (
                        <motion.li
                          key={item.produtoId}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0 }}
                          className="flex gap-3 rounded-2xl border border-rosa-200 bg-white/80 p-3"
                        >
                          <Link
                            to={`/boneca/${produto.slug}`}
                            onClick={fecharGaveta}
                            className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-rosa-100"
                          >
                            <MidiaProduto produto={produto} />
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <p className="font-display text-base leading-tight text-sepia-900">{produto.nome}</p>
                            <p className="text-sm font-semibold text-rosa-700">
                              {formatarPreco(produto.preco * item.quantidade)}
                            </p>
                            <div className="mt-auto flex items-center gap-2 pt-2">
                              <div className="flex items-center rounded-full border border-rosa-300 bg-rosa-100">
                                <button
                                  type="button"
                                  className="h-7 w-7 text-rosa-700"
                                  onClick={() => alterarQuantidade(item.produtoId, item.quantidade - 1)}
                                  aria-label="Diminuir"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-sm font-semibold">{item.quantidade}</span>
                                <button
                                  type="button"
                                  className="h-7 w-7 text-rosa-700"
                                  onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
                                  aria-label="Aumentar"
                                >
                                  +
                                </button>
                              </div>
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
                </ul>
              )}
            </div>

            {itens.length > 0 && (
              <footer className="border-t border-rosa-200 bg-white/70 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sepia-500">Total</span>
                  <span className="font-display text-2xl text-rosa-700">{formatarPreco(total)}</span>
                </div>
                <p className="mt-1 text-xs text-sepia-500">
                  O pedido é fechado no WhatsApp, com carinho e sem robô do outro lado.
                </p>
                <BotaoSonho href={linkWhatsApp(mensagemWhatsApp())} className="mt-3 w-full" tamanho="lg" />
                <Link
                  to="/carrinho"
                  onClick={fecharGaveta}
                  className="mt-2 block text-center text-xs font-semibold text-sepia-700 underline underline-offset-4 hover:text-rosa-700"
                >
                  ver a sacolinha completa
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
