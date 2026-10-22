// Ajustes para navegadores antigos, para o app ficar igual em todos.
// Nos navegadores atuais nada disto roda.

/** Safari < 14.1 (iPhone/iPad antigos) e Chrome < 84 ignoram "gap" em flex. */
function supportsFlexGap() {
  const box = document.createElement('div');
  box.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden';
  box.appendChild(document.createElement('div'));
  box.appendChild(document.createElement('div'));
  document.body.appendChild(box);
  const ok = box.scrollHeight === 1;
  document.body.removeChild(box);
  return ok;
}

type Side = 'l' | 't' | 'r' | 'b';

/**
 * Em cada bloco flex com espaçamento, dá aos itens a margem equivalente ao
 * "gap" (atributo data-fg-gap + variáveis --fg-*; as regras estão no index.css).
 * Textos soltos também são itens: o espaço vai então para o elemento vizinho.
 * Refaz quando a tela muda (React) ou o tamanho da janela muda.
 */
function flexGapFallback() {
  const mark = (el: Element, side: Side, size: string) => {
    const cur = el.getAttribute('data-fg-gap');
    el.setAttribute('data-fg-gap', cur ? `${cur} ${side}` : side);
    (el as HTMLElement).style.setProperty(`--fg-${side}`, size);
  };
  const gapOf = (v: string | undefined) => (v && v !== 'normal' && v !== '0px' ? v : '');

  let queued = false;
  const update = () => {
    queued = false;
    const old = document.querySelectorAll('[data-fg-gap]');
    for (let i = 0; i < old.length; i++) old[i].removeAttribute('data-fg-gap');

    const boxes = document.querySelectorAll('[class*="gap-"]');
    for (let i = 0; i < boxes.length; i++) {
      const cs = getComputedStyle(boxes[i]);
      if (cs.display !== 'flex' && cs.display !== 'inline-flex') continue;
      const gx = gapOf(cs.columnGap);
      const gy = gapOf(cs.rowGap);
      if (!gx && !gy) continue;

      // Itens do flex, em ordem: elementos visíveis e textos (exceto espaços em branco)
      const items: Node[] = [];
      const nodes = boxes[i].childNodes;
      for (let j = 0; j < nodes.length; j++) {
        const n = nodes[j];
        if (n.nodeType === 3) {
          if (n.textContent?.trim() && !(items.length && items[items.length - 1].nodeType === 3)) items.push(n);
        } else if (n.nodeType === 1) {
          const c = getComputedStyle(n as Element);
          if (c.display !== 'none' && c.position !== 'absolute' && c.position !== 'fixed') items.push(n);
        }
      }

      if (cs.flexWrap !== 'nowrap') {
        // Com quebra de linha: espaço à direita e embaixo de cada item
        for (const n of items) {
          if (n.nodeType !== 1) continue;
          if (gx) mark(n as Element, 'r', gx);
          if (gy) mark(n as Element, 'b', gy);
        }
        continue;
      }
      const dir = cs.flexDirection;
      const column = dir === 'column' || dir === 'column-reverse';
      const size = column ? gy : gx;
      if (!size) continue;
      const reverse = dir === 'row-reverse' || dir === 'column-reverse';
      const lead: Side = column ? (reverse ? 'b' : 't') : reverse ? 'r' : 'l';
      const trail: Side = column ? (reverse ? 't' : 'b') : reverse ? 'l' : 'r';
      for (let j = 1; j < items.length; j++) {
        if (items[j].nodeType === 1) mark(items[j] as Element, lead, size);
        else if (items[j - 1].nodeType === 1) mark(items[j - 1] as Element, trail, size);
      }
    }
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class'],
  });
  window.addEventListener('resize', schedule);
  schedule();
}

/** Safari < 15.4 / Chrome < 108 não têm "dvh": --vh = 1% da altura visível da tela. */
function viewportHeightFallback() {
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('height', '1dvh')) return;
  const set = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
  set();
  window.addEventListener('resize', set);
  window.addEventListener('orientationchange', () => setTimeout(set, 300));
}

/** Safari < 12.1 não tem AbortController: versão mínima (o app só consulta "aborted"). */
function abortControllerFallback() {
  if (typeof window.AbortController === 'function') return;
  function AbortControllerLite(this: { signal: { aborted: boolean }; abort: () => void }) {
    const signal = { aborted: false };
    this.signal = signal;
    this.abort = () => {
      signal.aborted = true;
    };
  }
  (window as unknown as { AbortController: unknown }).AbortController = AbortControllerLite;
}

export function applyCompat() {
  for (const fix of [viewportHeightFallback, abortControllerFallback]) {
    try {
      fix();
    } catch {
      // ajuste opcional: se falhar, o app continua funcionando
    }
  }
  try {
    if ((window as { __forceFlexGapFallback?: boolean }).__forceFlexGapFallback || !supportsFlexGap())
      flexGapFallback();
  } catch {
    // ajuste opcional: se falhar, o app continua funcionando
  }
}
