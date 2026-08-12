import { useState } from 'react';
import { DollPlana } from './Doll3D';
import type { Produto } from '../data/types';

/**
 * Mostra a foto real da boneca quando o arquivo existe em public/produtos/.
 * Se a foto ainda não foi colocada lá, cai na ilustração — nunca aparece
 * imagem quebrada no site.
 */
export default function MidiaProduto({
  produto,
  className = '',
  prioridade = false,
}: {
  produto: Produto;
  className?: string;
  prioridade?: boolean;
}) {
  const [semFoto, setSemFoto] = useState(false);

  if (produto.foto && !semFoto) {
    return (
      <img
        src={produto.foto}
        alt={`${produto.nome} — boneca de pano feita à mão`}
        className={`h-full w-full object-cover ${className}`}
        loading={prioridade ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setSemFoto(true)}
      />
    );
  }

  return <DollPlana spec={produto.spec} className={`h-full w-full ${className}`} />;
}
