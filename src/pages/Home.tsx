import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import StyleCard from '../components/StyleCard';
import ColorCard from '../components/ColorCard';
import { haircuts } from '../data/haircuts';
import { haircolors } from '../data/haircolors';

const featuredCuts = haircuts.filter((h) =>
  ['chanel-longo', 'wolf-cut', 'franja-cortina', 'crespo-natural', 'pixie-cut'].includes(h.id),
);
const featuredColors = haircolors.filter((c) =>
  ['balayage-loiro', 'morena-iluminada-tec', 'nivel-7-dourado', 'nivel-7-cobre', 'cinza-prata'].includes(c.id),
);

const steps = [
  {
    title: 'Ao vivo, na câmera',
    desc: 'Ligue a câmera e veja a mudança em tempo real, sem precisar tirar foto.',
  },
  {
    title: 'Escolha corte e cor',
    desc: 'Pesquise entre dezenas de cortes e cores do Brasil e do mundo.',
  },
  {
    title: 'Seu rosto intacto',
    desc: 'A IA identifica só o cabelo. Sua beleza natural não é alterada.',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <Logo />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-400 via-rose-500 to-gold-500 px-6 py-8 text-cream-50 shadow-xl shadow-rose-500/25"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-50/80">
          Provador de cabelo com IA
        </p>
        <h1 className="mt-2 font-display text-[28px] font-semibold leading-[1.15]">
          Veja o cabelo dos seus sonhos antes de cortar
        </h1>
        <p className="mt-2 text-[15px] text-cream-50/90">
          Ao vivo, na câmera, sem alterar seu rosto — só o cabelo.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/experimentar')}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-cream-50 px-6 py-3.5 font-semibold text-rose-600 shadow-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 8.5 8.6 6h6.8L17 8.5h2A1.5 1.5 0 0 1 20.5 10v7A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17v-7A1.5 1.5 0 0 1 5 8.5h2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Testar meu cabelo agora
        </motion.button>
      </motion.section>

      <div className="-mt-1 px-1">
        <div className="relative z-10 mt-4">
          <SearchBar />
        </div>
      </div>

      <section className="mt-7 grid grid-cols-3 gap-2.5">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            className="rounded-2xl border border-blush-200/70 bg-white p-3.5 text-center"
          >
            <div className="mx-auto mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blush-100 text-[11px] font-bold text-rose-600">
              {i + 1}
            </div>
            <p className="text-[12.5px] font-semibold leading-tight text-ink-900">{s.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-ink-600/70">{s.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Cortes em alta</h2>
          <button onClick={() => navigate('/explorar?tab=cortes')} className="text-sm font-medium text-rose-500">
            Ver todos
          </button>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
          {featuredCuts.map((cut, i) => (
            <div key={cut.id} className="w-[42%] shrink-0">
              <StyleCard haircut={cut} index={i} onClick={() => navigate(`/experimentar?corte=${cut.id}`)} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Cores em alta</h2>
          <button onClick={() => navigate('/explorar?tab=cores')} className="text-sm font-medium text-rose-500">
            Ver todas
          </button>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
          {featuredColors.map((color, i) => (
            <div key={color.id} className="w-[42%] shrink-0">
              <ColorCard color={color} index={i} onClick={() => navigate(`/experimentar?cor=${color.id}`)} />
            </div>
          ))}
        </div>
      </section>

      <p className="mx-2 mt-8 text-center text-xs leading-relaxed text-ink-600/60">
        Todo o processamento acontece no seu aparelho. Nenhuma foto ou vídeo é enviado
        para servidores — sua privacidade é levada a sério.
      </p>
    </div>
  );
}
