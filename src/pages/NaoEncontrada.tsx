import { Link } from 'react-router-dom';
import Doll3D from '../components/Doll3D';
import { produtos } from '../data/produtos';

export default function NaoEncontrada() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <div className="h-56 w-56">
        <Doll3D spec={produtos[4].spec} profundidade={1.2} className="h-full w-full" />
      </div>
      <h1 className="mt-6 font-display text-4xl text-sepia-900">Essa boneca saiu para brincar…</h1>
      <p className="mt-3 max-w-md text-sepia-700">
        Não encontramos a página que você procurava. Que tal dar uma olhada nas bonecas que estão no ateliê agora?
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/bonecas"
          className="rounded-full bg-rosa-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          ver o catálogo
        </Link>
        <Link
          to="/"
          className="rounded-full border-2 border-rosa-400 px-7 py-3 text-sm font-bold uppercase tracking-wide text-rosa-700 transition-all hover:bg-rosa-200"
        >
          voltar ao início
        </Link>
      </div>
    </div>
  );
}
