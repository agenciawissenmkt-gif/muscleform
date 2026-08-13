import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { buscarCategorias, buscarProdutos, ErroCatalogo } from '../services/catalogo';
import { RECADO_SEM_CONEXAO, supabaseConfigurado } from '../lib/supabase';
import type { Categoria, Produto } from '../data/types';

/**
 * O catálogo é buscado uma vez, quando o site abre (duas consultas em
 * paralelo), e fica disponível para todas as páginas. Assim a navegação entre
 * catálogo, produto e carrinho é instantânea, sem ficar batendo no banco.
 */
interface CatalogoContexto {
  produtos: Produto[];
  categorias: Categoria[];
  carregando: boolean;
  erro: string | null;
  /** true enquanto a primeira carga não terminou. */
  primeiraCarga: boolean;
  recarregar: () => void;
  produtoPorId: (id: string) => Produto | undefined;
  produtoPorSlug: (slug: string) => Produto | undefined;
  categoriaPorSlug: (slug: string) => Categoria | undefined;
  produtosDaCategoria: (slug: string) => Produto[];
  destaques: Produto[];
  maisAmadas: Produto[];
  comFotoEstudio: Produto[];
  relacionados: (produto: Produto, quantidade?: number) => Produto[];
}

const Contexto = createContext<CatalogoContexto | null>(null);

export function ProvedorCatalogo({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [primeiraCarga, setPrimeiraCarga] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    Promise.all([buscarCategorias(), buscarProdutos()])
      .then(([cats, prods]) => {
        if (!ativo) return;
        setCategorias(cats);
        setProdutos(prods);
      })
      .catch((e: unknown) => {
        if (!ativo) return;
        setErro(e instanceof ErroCatalogo ? e.message : RECADO_SEM_CONEXAO);
      })
      .finally(() => {
        if (!ativo) return;
        setCarregando(false);
        setPrimeiraCarga(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  const valor = useMemo<CatalogoContexto>(() => {
    const porId = new Map(produtos.map((p) => [p.id, p]));
    const porSlug = new Map(produtos.map((p) => [p.slug, p]));

    return {
      produtos,
      categorias,
      carregando,
      erro,
      primeiraCarga,
      recarregar,
      produtoPorId: (id) => porId.get(id),
      produtoPorSlug: (slug) => porSlug.get(slug),
      categoriaPorSlug: (slug) => categorias.find((c) => c.slug === slug),
      produtosDaCategoria: (slug) => produtos.filter((p) => p.categoria === slug),
      destaques: produtos.filter((p) => p.destaque),
      maisAmadas: produtos.filter((p) => p.maisVendida),
      comFotoEstudio: produtos.filter((p) => p.fotoEstudio),
      relacionados: (produto, quantidade = 4) => {
        const mesma = produtos.filter((p) => p.categoria === produto.categoria && p.id !== produto.id);
        const outros = produtos.filter((p) => p.categoria !== produto.categoria && p.id !== produto.id);
        return [...mesma, ...outros].slice(0, quantidade);
      },
    };
  }, [produtos, categorias, carregando, erro, primeiraCarga, recarregar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCatalogo(): CatalogoContexto {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useCatalogo precisa estar dentro de <ProvedorCatalogo>');
  return contexto;
}

/** Avisa se o site nem tem credenciais configuradas (útil no aviso de erro). */
export const catalogoConfigurado = supabaseConfigurado;
