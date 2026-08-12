import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { formatarPreco, produtoPorId } from '../data/produtos';
import type { ItemCarrinho } from '../data/types';
import { site } from '../config/site';

const CHAVE = 'sonhos-de-brincar:carrinho';

interface CarrinhoContexto {
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  total: number;
  adicionar: (item: ItemCarrinho) => void;
  remover: (produtoId: string) => void;
  alterarQuantidade: (produtoId: string, quantidade: number) => void;
  limpar: () => void;
  mensagemWhatsApp: () => string;
  gavetaAberta: boolean;
  abrirGaveta: () => void;
  fecharGaveta: () => void;
}

const Contexto = createContext<CarrinhoContexto | null>(null);

function carregar(): ItemCarrinho[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const dados = JSON.parse(bruto) as ItemCarrinho[];
    return Array.isArray(dados) ? dados.filter((i) => produtoPorId(i.produtoId)) : [];
  } catch {
    return [];
  }
}

export function ProvedorCarrinho({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>(carregar);
  const [gavetaAberta, setGavetaAberta] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      /* espaço cheio ou modo privado — o carrinho segue só na memória */
    }
  }, [itens]);

  const adicionar = useCallback((item: ItemCarrinho) => {
    setItens((atuais) => {
      const existente = atuais.find(
        (i) => i.produtoId === item.produtoId && i.corVestido === item.corVestido,
      );
      if (existente) {
        return atuais.map((i) =>
          i === existente ? { ...i, quantidade: i.quantidade + item.quantidade } : i,
        );
      }
      return [...atuais, item];
    });
    setGavetaAberta(true);
  }, []);

  const remover = useCallback((produtoId: string) => {
    setItens((atuais) => atuais.filter((i) => i.produtoId !== produtoId));
  }, []);

  const alterarQuantidade = useCallback((produtoId: string, quantidade: number) => {
    setItens((atuais) =>
      quantidade <= 0
        ? atuais.filter((i) => i.produtoId !== produtoId)
        : atuais.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i)),
    );
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const total = useMemo(
    () =>
      itens.reduce((soma, item) => {
        const produto = produtoPorId(item.produtoId);
        return soma + (produto ? produto.preco * item.quantidade : 0);
      }, 0),
    [itens],
  );

  const quantidadeTotal = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade, 0),
    [itens],
  );

  const mensagemWhatsApp = useCallback(() => {
    const linhas = itens.map((item) => {
      const produto = produtoPorId(item.produtoId);
      if (!produto) return '';
      const detalhe = item.corVestido ? ` (vestido ${item.corVestido})` : '';
      return `• ${item.quantidade}x ${produto.nome}${detalhe} — ${formatarPreco(produto.preco * item.quantidade)}`;
    });

    return [
      `Olá, ${site.nome}! 💕`,
      '',
      'Quero realizar meu sonho com estas peças:',
      ...linhas.filter(Boolean),
      '',
      `Total: ${formatarPreco(total)}`,
      '',
      'Pode me passar as formas de pagamento e o prazo de entrega?',
    ].join('\n');
  }, [itens, total]);

  const valor = useMemo(
    () => ({
      itens,
      quantidadeTotal,
      total,
      adicionar,
      remover,
      alterarQuantidade,
      limpar,
      mensagemWhatsApp,
      gavetaAberta,
      abrirGaveta: () => setGavetaAberta(true),
      fecharGaveta: () => setGavetaAberta(false),
    }),
    [itens, quantidadeTotal, total, adicionar, remover, alterarQuantidade, limpar, mensagemWhatsApp, gavetaAberta],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrinho(): CarrinhoContexto {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useCarrinho precisa estar dentro de <ProvedorCarrinho>');
  return contexto;
}
