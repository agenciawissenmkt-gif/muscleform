import { motion } from 'framer-motion';
import { catalogoConfigurado } from '../store/catalogo';

/**
 * Enquanto as bonecas chegam do painel, ou quando algo dá errado.
 * Os fantasminhas têm o mesmo formato dos cartões, para a página não pular.
 */

export function CartoesFantasma({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div
      className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Carregando as bonecas"
    >
      {Array.from({ length: quantidade }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-rosa-200 bg-white/70 sombra-suave"
        >
          <div className="aspect-[4/5] animate-pulse bg-gradient-to-b from-rosa-100 to-creme-100" />
          <div className="flex flex-col gap-3 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-rosa-200" />
            <div className="h-3 w-full animate-pulse rounded-full bg-rosa-100" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-rosa-100" />
            <div className="mt-2 h-6 w-1/3 animate-pulse rounded-full bg-rosa-200" />
            <div className="mt-2 h-10 w-full animate-pulse rounded-full bg-rosa-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bloco de carregamento para a página de uma boneca. */
export function ProdutoFantasma() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14" aria-busy="true">
      <div className="aspect-square w-full animate-pulse rounded-[2rem] border border-rosa-200 bg-gradient-to-br from-creme-50 via-rosa-100 to-rosa-200" />
      <div className="flex flex-col gap-4">
        <div className="h-5 w-40 animate-pulse rounded-full bg-rosa-200" />
        <div className="h-10 w-3/4 animate-pulse rounded-full bg-rosa-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-rosa-100" />
        <div className="mt-4 h-24 w-full animate-pulse rounded-[1.5rem] bg-rosa-100" />
        <div className="h-40 w-full animate-pulse rounded-[1.5rem] bg-rosa-100" />
        <div className="h-14 w-full animate-pulse rounded-full bg-rosa-200" />
      </div>
    </div>
  );
}

/** Recado carinhoso quando o catálogo não vem. */
export function AvisoCatalogo({
  mensagem,
  aoTentarDeNovo,
}: {
  mensagem: string;
  aoTentarDeNovo?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-10 max-w-lg rounded-[1.75rem] border border-rosa-200 bg-white/80 p-8 text-center sombra-suave"
      role="status"
    >
      <span className="inline-block animate-flutuar text-5xl" aria-hidden="true">
        🧵
      </span>
      <p className="mt-5 font-display text-2xl text-sepia-900">Um instante, por favor</p>
      <p className="mt-2 text-sm leading-relaxed text-sepia-700">{mensagem}</p>

      {aoTentarDeNovo && (
        <button
          type="button"
          onClick={aoTentarDeNovo}
          className="mt-6 rounded-full bg-rosa-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          tentar de novo
        </button>
      )}

      {!catalogoConfigurado && (
        <p className="mt-4 text-xs text-sepia-500">
          Dica para quem cuida do site: falta preencher as variáveis de ambiente do Supabase.
        </p>
      )}
    </motion.div>
  );
}
