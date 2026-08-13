import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import DollArt from './DollArt';
import { formatarPreco, parcelamento } from '../lib/formato';
import type { Produto } from '../data/types';
import { CTA_COMPRA, linkWhatsApp } from '../config/site';

interface Props {
  produto: Produto;
  indice?: number;
}

/** Cartão da vitrine: inclina em 3D, dá zoom na boneca e leva para a página de venda. */
export default function CardProduto({ produto, indice = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [sobre, setSobre] = useState(false);
  const [semFoto, setSemFoto] = useState(false);

  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return;
    const caixa = ref.current?.getBoundingClientRect();
    if (!caixa) return;
    const px = (e.clientX - caixa.left) / caixa.width - 0.5;
    const py = (e.clientY - caixa.top) / caixa.height - 0.5;
    ry.set(px * 18);
    rx.set(-py * 14);
  }

  function sair() {
    rx.set(0);
    ry.set(0);
    setSobre(false);
  }

  const { vezes, valor } = parcelamento(produto.preco);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: Math.min(indice * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="cena-3d h-full"
    >
      <motion.div
        ref={ref}
        onPointerMove={mover}
        onPointerEnter={() => setSobre(true)}
        onPointerLeave={sair}
        style={{ rotateX: rx, rotateY: ry }}
        className="preserve-3d group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-rosa-200 bg-white/80 backdrop-blur transition-shadow duration-300 sombra-suave hover:shadow-[0_28px_60px_-30px_rgba(194,86,116,0.7)]"
      >
        <Link to={`/boneca/${produto.slug}`} className="block" aria-label={`Ver ${produto.nome}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-rosa-100 to-creme-100">
            <Etiquetas produto={produto} />

            {/* foto real quando existe; senão, a boneca em camadas com profundidade no hover */}
            {produto.foto && !semFoto ? (
              <motion.img
                src={produto.foto}
                alt={`${produto.nome} — boneca de pano feita à mão`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setSemFoto(true)}
                animate={{ scale: sobre ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              />
            ) : (
              /* um SVG só, com zoom por CSS — bem mais leve numa lista de 29 peças */
              <DollArt
                spec={produto.spec}
                camada="todas"
                className="absolute inset-0 h-full w-full p-5 transition-transform duration-500 ease-out"
                style={{ transform: sobre ? 'scale(1.08)' : 'scale(1)' }}
              />
            )}

            <motion.span
              className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-3"
              animate={{ opacity: sobre ? 1 : 0, y: sobre ? 0 : 10 }}
              transition={{ duration: 0.25 }}
            >
              <span className="rounded-full bg-white/90 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-rosa-700 shadow-sm">
                Ver detalhes ✦
              </span>
            </motion.span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <Link to={`/boneca/${produto.slug}`}>
              <h3 className="font-display text-lg leading-tight text-sepia-900 transition-colors hover:text-rosa-700">
                {produto.nome}
              </h3>
            </Link>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-sepia-500">{produto.resumo}</p>
          </div>

          <div className="mt-auto">
            <div className="flex items-end gap-2">
              {produto.precoDe && (
                <span className="text-sm text-sepia-300 line-through">{formatarPreco(produto.precoDe)}</span>
              )}
              <span className="font-display text-2xl text-rosa-700">{formatarPreco(produto.preco)}</span>
            </div>
            <p className="text-xs text-sepia-500">
              ou {vezes}x de {formatarPreco(valor)} sem juros
            </p>

            <a
              href={linkWhatsApp(
                `Olá, Sonhos de Brincar! 💕 Me apaixonei pela ${produto.nome} (${formatarPreco(produto.preco)}). Ela está disponível?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="botao-sonho mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wide sm:text-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 21s-7.5-4.7-9.6-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9z" />
              </svg>
              {CTA_COMPRA}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function Etiquetas({ produto }: { produto: Produto }) {
  const etiquetas: { texto: string; classe: string }[] = [];
  if (produto.novidade) etiquetas.push({ texto: 'Novidade', classe: 'bg-lavanda-300 text-sepia-800' });
  if (produto.maisVendida) etiquetas.push({ texto: 'Mais amada', classe: 'bg-rosa-600 text-white' });
  if (produto.precoDe) etiquetas.push({ texto: 'Oferta', classe: 'bg-neon-400 text-neon-900' });

  if (!etiquetas.length) return null;

  return (
    <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
      {etiquetas.map((e) => (
        <span
          key={e.texto}
          className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] shadow-sm ${e.classe}`}
        >
          {e.texto}
        </span>
      ))}
    </div>
  );
}
