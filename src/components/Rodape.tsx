import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useCatalogo } from '../store/catalogo';
import { linkWhatsApp, site } from '../config/site';

export default function Rodape() {
  const { categorias } = useCatalogo();

  return (
    <footer className="relative mt-24 overflow-hidden bg-rosa-200/70 pt-16">
      <OndaTopo />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sepia-700">{site.descricao}</p>
          <p className="mt-4 font-script text-2xl text-rosa-700">{site.slogan}</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sepia-500">Categorias</p>
          <ul className="mt-4 flex flex-col gap-2">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/categoria/${c.slug}`}
                  className="text-sm text-sepia-700 transition-colors hover:text-rosa-700"
                >
                  {c.emoji} {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sepia-500">O ateliê</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-sepia-700">
            <li>
              <Link to="/sobre" className="transition-colors hover:text-rosa-700">
                Nossa história
              </Link>
            </li>
            <li>
              <Link to="/beneficios" className="transition-colors hover:text-rosa-700">
                Benefícios de brincar
              </Link>
            </li>
            <li>
              <Link to="/bonecas" className="transition-colors hover:text-rosa-700">
                Todas as bonecas
              </Link>
            </li>
            <li>
              <Link to="/contato" className="transition-colors hover:text-rosa-700">
                Dúvidas frequentes
              </Link>
            </li>
            <li>Prazo de produção: {site.prazoProducao}</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sepia-500">Fale com a gente</p>
          <a
            href={linkWhatsApp(`Olá, ${site.nome}! Vim pelo site e gostaria de saber mais sobre as bonecas 💕`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-sepia-800 transition-colors hover:text-rosa-700"
          >
            <IconeWhats className="h-5 w-5 text-neon-600" />
            {site.whatsappExibicao}
          </a>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm text-sepia-700 transition-colors hover:text-rosa-700"
          >
            <span aria-hidden="true">📸</span> {site.instagramUser}
          </a>
          <p className="mt-3 flex items-center gap-2 text-sm text-sepia-700">
            <span aria-hidden="true">📍</span> {site.cidade}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-sepia-700">
            <span aria-hidden="true">✉️</span> {site.email}
          </p>

          <div className="mt-5 rounded-2xl border border-rosa-300 bg-white/60 p-4">
            <p className="text-xs font-semibold text-sepia-800">Formas de pagamento</p>
            <p className="mt-1 text-xs text-sepia-500">
              Pix, cartão em até 3x sem juros e transferência — combinados direto no WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-rosa-300/70 px-4 py-5 text-center text-xs text-sepia-500 sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} {site.nome} — todas as bonecas são feitas à mão, uma a uma. Feito com{' '}
          <span className="inline-block animate-coracao text-rosa-600" aria-hidden="true">
            ♥
          </span>{' '}
          em cada detalhe.
        </p>
      </div>
    </footer>
  );
}

function OndaTopo() {
  return (
    <svg
      className="absolute inset-x-0 -top-1 h-12 w-full text-rosa-100"
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 0h1440v22c-180 30-360 38-720 20S180 8 0 30z" fill="currentColor" />
    </svg>
  );
}

export function IconeWhats({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.14c-.25.69-1.44 1.32-1.99 1.4-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07s.77-2.18 1.04-2.48c.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.06.92 2.21.08.15.13.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.39-.45.52-.15.15-.31.31-.13.61.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.4z" />
    </svg>
  );
}
