import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CardProduto from '../components/CardProduto';
import Reveal from '../components/Reveal';
import DollArt from '../components/DollArt';
import { useCatalogo } from '../store/catalogo';
import { AvisoCatalogo, CartoesFantasma } from '../components/EstadoCatalogo';
import NaoEncontrada from './NaoEncontrada';

type Ordem = 'destaque' | 'menor' | 'maior' | 'novidade';

const ordens: { valor: Ordem; rotulo: string }[] = [
  { valor: 'destaque', rotulo: 'Mais amadas' },
  { valor: 'novidade', rotulo: 'Novidades' },
  { valor: 'menor', rotulo: 'Menor preço' },
  { valor: 'maior', rotulo: 'Maior preço' },
];

export default function Catalogo() {
  const { slug } = useParams();
  const { produtos, categorias, categoriaPorSlug, carregando, erro, recarregar } = useCatalogo();
  const categoria = slug ? categoriaPorSlug(slug) : undefined;

  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState<Ordem>('destaque');
  const [filtro, setFiltro] = useState<string>(slug ?? 'todas');

  const categoriaAtiva = slug ? slug : filtro;

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let resultado = produtos.filter((p) => {
      const naCategoria = categoriaAtiva === 'todas' || p.categoria === categoriaAtiva;
      const noTermo =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        p.resumo.toLowerCase().includes(termo) ||
        p.tags.some((t) => t.toLowerCase().includes(termo));
      return naCategoria && noTermo;
    });

    resultado = [...resultado].sort((a, b) => {
      switch (ordem) {
        case 'menor':
          return a.preco - b.preco;
        case 'maior':
          return b.preco - a.preco;
        case 'novidade':
          return Number(!!b.novidade) - Number(!!a.novidade);
        default:
          return Number(!!b.maisVendida) - Number(!!a.maisVendida) || Number(!!b.destaque) - Number(!!a.destaque);
      }
    });

    return resultado;
  }, [busca, ordem, categoriaAtiva, produtos]);

  // enquanto o catálogo carrega ainda não dá para dizer que a coleção não existe
  if (slug && !categoria && !carregando && !erro) return <NaoEncontrada />;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <Reveal className="pt-6 text-center">
        <nav className="mb-4 flex items-center justify-center gap-2 text-xs text-sepia-500">
          <Link to="/" className="hover:text-rosa-700">
            Início
          </Link>
          <span aria-hidden="true">›</span>
          {categoria ? (
            <>
              <Link to="/bonecas" className="hover:text-rosa-700">
                Bonecas
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-sepia-800">{categoria.nome}</span>
            </>
          ) : (
            <span className="text-sepia-800">Todas as bonecas</span>
          )}
        </nav>

        {slug && categoria ? (
          <div className="flex flex-col items-center gap-4">
            <DollArt
              spec={categoria.capa}
              camada="todas"
              className="h-28 w-24 animate-flutuar-lento"
            />
            <h1 className="font-display text-4xl text-sepia-900 sm:text-5xl">{categoria.nome}</h1>
            <p className="max-w-2xl leading-relaxed text-sepia-700">{categoria.descricao}</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-rosa-600">Catálogo completo</p>
            <h1 className="mt-3 font-display text-4xl text-sepia-900 sm:text-5xl">
              Todas as nossas <span className="font-script text-rosa-600">bonecas</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-sepia-700">
              {carregando
                ? 'Buscando as bonecas que estão no ateliê agora…'
                : `${produtos.length} peças costuradas à mão, esperando por um colo. Use os filtros para achar a sua.`}
            </p>
          </>
        )}
      </Reveal>

      {/* filtros */}
      <div className="sticky top-[4.5rem] z-30 mt-10 rounded-[1.5rem] border border-rosa-200 bg-rosa-50/95 p-3 sombra-suave">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar boneca</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, cor ou estilo…"
              className="w-full rounded-full border border-rosa-200 bg-rosa-50 px-11 py-2.5 text-sm text-sepia-900 outline-none transition-all placeholder:text-sepia-300 focus:border-rosa-400 focus:bg-white"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sepia-300" aria-hidden="true">
              🔍
            </span>
          </label>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {ordens.map((o) => (
              <button
                key={o.valor}
                type="button"
                onClick={() => setOrdem(o.valor)}
                className={`relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  ordem === o.valor ? 'text-white' : 'text-sepia-700 hover:text-rosa-700'
                }`}
              >
                {ordem === o.valor && (
                  <motion.span layoutId="ordem-ativa" className="absolute inset-0 rounded-full bg-rosa-600" />
                )}
                <span className="relative">{o.rotulo}</span>
              </button>
            ))}
          </div>
        </div>

        {!slug && (
          <div className="mt-3 flex gap-2 overflow-x-auto border-t border-rosa-100 pt-3 no-scrollbar">
            <Chip ativo={filtro === 'todas'} onClick={() => setFiltro('todas')}>
              Todas
            </Chip>
            {categorias.map((c) => (
              <Chip key={c.slug} ativo={filtro === c.slug} onClick={() => setFiltro(c.slug)}>
                {c.emoji} {c.nome}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {!carregando && !erro && (
        <p className="mt-6 text-center text-sm text-sepia-500">
          {lista.length === 0
            ? 'Nenhuma boneca encontrada com esse jeitinho.'
            : `${lista.length} ${lista.length === 1 ? 'boneca encontrada' : 'bonecas encontradas'}`}
        </p>
      )}

      {carregando && <CartoesFantasma quantidade={8} />}

      {erro && !carregando && <AvisoCatalogo mensagem={erro} aoTentarDeNovo={recarregar} />}

      {!carregando && !erro && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((p, i) => (
            <CardProduto key={p.id} produto={p} indice={i} />
          ))}
        </div>
      )}

      {!carregando && !erro && lista.length === 0 && (
        <div className="mt-8 text-center">
          <span className="text-5xl animate-flutuar" aria-hidden="true">
            🧵
          </span>
          <p className="mt-4 text-sepia-700">
            Que tal ver as outras coleções? Tem boneca nova saindo do ateliê toda semana.
          </p>
          <Link
            to="/contato"
            className="mt-4 inline-block rounded-full bg-rosa-600 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Falar com o ateliê
          </Link>
        </div>
      )}

      {slug && categorias.length > 0 && (
        <div className="mt-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sepia-500">Outras coleções</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categorias
              .filter((c) => c.slug !== slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/categoria/${c.slug}`}
                  className="rounded-full border border-rosa-300 bg-white/70 px-4 py-2 text-sm text-sepia-700 transition-all hover:-translate-y-0.5 hover:border-rosa-500 hover:text-rosa-700"
                >
                  {c.emoji} {c.nome}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  ativo,
  onClick,
}: {
  children: React.ReactNode;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
        ativo
          ? 'border-rosa-500 bg-rosa-200 text-rosa-700'
          : 'border-rosa-200 bg-white/60 text-sepia-700 hover:border-rosa-400'
      }`}
    >
      {children}
    </button>
  );
}
