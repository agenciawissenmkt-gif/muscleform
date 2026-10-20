// Tratamento de imagens 100% no aparelho: recorte, redução de tamanho (envio
// mais rápido) e conversão para JPG/PNG no download.

export interface Photo {
  /** data:image/jpeg;base64,... pronto para enviar */
  dataUrl: string;
  width: number;
  height: number;
  /** proporção no formato aceito pela IA, ex.: "3:4" */
  aspectRatio: string;
}

/** Lado maior da foto enviada. Suficiente para fios nítidos e ainda leve. */
const MAX_SIDE = 1536;

const RATIOS: [w: number, h: number][] = [
  [3, 4],
  [4, 5],
  [2, 3],
  [9, 16],
  [1, 1],
  [4, 3],
  [5, 4],
  [3, 2],
  [16, 9],
];

function nearestRatio(width: number, height: number): [number, number] {
  const r = width / height;
  return RATIOS.reduce((best, cur) =>
    Math.abs(Math.log(cur[0] / cur[1] / r)) < Math.abs(Math.log(best[0] / best[1] / r)) ? cur : best,
  );
}

/**
 * Recorta (no centro) para a proporção padrão mais próxima e reduz o tamanho.
 * Assim a IA devolve a imagem exatamente no mesmo enquadramento, sem cortar
 * nem distorcer o cenário.
 */
export function drawToPhoto(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  options: { mirror?: boolean; ratio?: [number, number] } = {},
): Photo {
  const [rw, rh] = options.ratio ?? nearestRatio(srcWidth, srcHeight);
  let cropW = srcWidth;
  let cropH = Math.round((srcWidth * rh) / rw);
  if (cropH > srcHeight) {
    cropH = srcHeight;
    cropW = Math.round((srcHeight * rw) / rh);
  }
  const sx = Math.round((srcWidth - cropW) / 2);
  const sy = Math.round((srcHeight - cropH) / 2);
  const scale = Math.min(1, MAX_SIDE / Math.max(cropW, cropH));
  const outW = Math.round(cropW * scale);
  const outH = Math.round(cropH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  if (options.mirror) {
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, sx, sy, cropW, cropH, 0, 0, outW, outH);
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
    width: outW,
    height: outH,
    aspectRatio: `${rw}:${rh}`,
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não consegui abrir essa imagem.'));
    img.src = src;
  });
}

/** Foto escolhida da galeria / arquivos do aparelho. */
export async function photoFromFile(file: File): Promise<Photo> {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error('Escolha um arquivo de imagem (foto).');
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return drawToPhoto(img, img.naturalWidth, img.naturalHeight);
  } catch {
    throw new Error('Não consegui abrir essa foto. Tente outra ou tire uma foto pela câmera.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Converte o resultado para o formato pedido (JPG ou PNG). */
export async function convertImage(dataUrl: string, format: 'jpg' | 'png'): Promise<Blob> {
  const blob = await dataUrlToBlob(dataUrl);
  const wanted = format === 'png' ? 'image/png' : 'image/jpeg';
  if (blob.type === wanted) return blob;
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao converter a imagem.'))), wanted, 0.95),
  );
}

export function fileName(label: string, ext: 'jpg' | 'png'): string {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  return `beauty-and-self-${slug || 'visual'}-${stamp}.${ext}`;
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export type Platform = 'ios' | 'android' | 'desktop';

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  return 'desktop';
}

type ShareNavigator = Navigator & { canShare?: (data: ShareData) => boolean };

export function canShareFiles(): boolean {
  const nav = navigator as ShareNavigator;
  try {
    return !!nav.canShare?.({
      files: [new File([new Blob(['x'], { type: 'image/jpeg' })], 'x.jpg', { type: 'image/jpeg' })],
    });
  } catch {
    return false;
  }
}

/**
 * Abre a folha de compartilhamento do sistema com a imagem (WhatsApp etc.;
 * no iPhone também tem "Salvar Imagem", que guarda no app Fotos).
 */
export async function shareFile(blob: Blob, name: string): Promise<'shared' | 'cancelled' | 'unsupported'> {
  const file = new File([blob], name, { type: blob.type });
  const nav = navigator as ShareNavigator;
  if (!nav.canShare?.({ files: [file] })) return 'unsupported';
  try {
    await nav.share({ files: [file], title: 'Meu novo visual — Beauty and self' });
    return 'shared';
  } catch (err) {
    return (err as DOMException)?.name === 'AbortError' ? 'cancelled' : 'unsupported';
  }
}
