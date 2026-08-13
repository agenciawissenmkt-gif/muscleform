import { useState } from 'react';
import type { Produto } from '../data/types';

/**
 * A foto da boneca, vinda do painel. É a única imagem do site.
 * Se a peça ainda não tem foto cadastrada (ou a URL não abre), entra um
 * espaço reservado no tom do ateliê — nunca aparece imagem quebrada.
 */
export default function FotoBoneca({
  produto,
  className = '',
  prioridade = false,
  ajuste = 'cover',
}: {
  produto: Pick<Produto, 'nome' | 'foto' | 'fotoEstudio'>;
  className?: string;
  prioridade?: boolean;
  /** 'cover' preenche o espaço; 'contain' mostra a foto inteira. */
  ajuste?: 'cover' | 'contain';
}) {
  const [falhou, setFalhou] = useState(false);
  const fonte = produto.foto ?? produto.fotoEstudio;

  if (!fonte || falhou) {
    return <SemFoto className={className} />;
  }

  return (
    <img
      src={fonte}
      alt={`${produto.nome} — boneca de pano feita à mão`}
      className={`h-full w-full object-${ajuste} ${className}`}
      loading={prioridade ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFalhou(true)}
    />
  );
}

/** Espaço reservado, no tom do site, para peça sem foto. */
export function SemFoto({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-rosa-100 to-creme-100 text-center ${className}`}
    >
      <span className="text-3xl opacity-60" aria-hidden="true">
        🎀
      </span>
      <span className="px-4 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-sepia-500">
        foto a caminho
      </span>
    </div>
  );
}
