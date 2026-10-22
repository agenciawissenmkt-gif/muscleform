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
  const ctx = context2d(canvas);
  ctx.imageSmoothingQuality = 'high';
  if (options.mirror) {
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, sx, sy, cropW, cropH, 0, 0, outW, outH);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  release(canvas);
  return { dataUrl, width: outW, height: outH, aspectRatio: `${rw}:${rh}` };
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não consegui preparar a imagem. Feche outras abas do navegador e tente de novo.');
  return ctx;
}

/** Libera a memória do canvas na hora (iPhones antigos travam se acumular). */
function release(canvas: HTMLCanvasElement) {
  canvas.width = 1;
  canvas.height = 1;
}

/** Navegadores atuais já desviram a foto sozinhos (dado EXIF); os antigos não. */
function browserRotatesExif(): boolean {
  try {
    return typeof CSS !== 'undefined' && CSS.supports('image-orientation', 'from-image');
  } catch {
    return false;
  }
}

/** Orientação EXIF (1 a 8) gravada pela câmera no começo do JPEG; 1 = normal. */
function readOrientation(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(1);
    reader.onload = () => {
      try {
        const view = new DataView(reader.result as ArrayBuffer);
        if (view.getUint16(0) !== 0xffd8) return resolve(1);
        let offset = 2;
        while (offset + 4 < view.byteLength) {
          const marker = view.getUint16(offset);
          if (marker === 0xffe1 && view.getUint32(offset + 4) === 0x45786966) {
            const tiff = offset + 10;
            const little = view.getUint16(tiff) === 0x4949;
            const ifd = tiff + view.getUint32(tiff + 4, little);
            const count = view.getUint16(ifd, little);
            for (let i = 0; i < count; i++) {
              const entry = ifd + 2 + i * 12;
              if (view.getUint16(entry, little) === 0x0112) return resolve(view.getUint16(entry + 8, little));
            }
            return resolve(1);
          }
          if ((marker & 0xff00) !== 0xff00) break;
          offset += 2 + view.getUint16(offset + 2);
        }
      } catch {
        // arquivo fora do padrão: usa como está
      }
      resolve(1);
    };
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
  });
}

/** Desvira a foto conforme a orientação EXIF (já reduzindo o tamanho). */
function uprightCanvas(img: HTMLImageElement, orientation: number): HTMLCanvasElement {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = Math.min(1, 2048 / Math.max(w, h));
  const swap = orientation >= 5;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round((swap ? h : w) * scale);
  canvas.height = Math.round((swap ? w : h) * scale);
  const ctx = context2d(canvas);
  ctx.scale(scale, scale);
  const m = (
    {
      2: [-1, 0, 0, 1, w, 0],
      3: [-1, 0, 0, -1, w, h],
      4: [1, 0, 0, -1, 0, h],
      5: [0, 1, 1, 0, 0, 0],
      6: [0, 1, -1, 0, h, 0],
      7: [0, -1, -1, 0, h, w],
      8: [0, -1, 1, 0, 0, w],
    } as Record<number, [number, number, number, number, number, number]>
  )[orientation];
  if (m) ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  ctx.drawImage(img, 0, 0);
  return canvas;
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
  const heic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  // (alguns Androids mandam a foto sem tipo: deixa o navegador tentar abrir)
  if (file.type && !file.type.startsWith('image/') && !heic) {
    throw new Error('Escolha um arquivo de imagem (foto).');
  }
  const url = URL.createObjectURL(file);
  try {
    const [img, orientation] = await Promise.all([
      loadImage(url),
      browserRotatesExif() ? Promise.resolve(1) : readOrientation(file),
    ]);
    if (orientation > 1) {
      const upright = uprightCanvas(img, orientation);
      const photo = drawToPhoto(upright, upright.width, upright.height);
      release(upright);
      return photo;
    }
    return drawToPhoto(img, img.naturalWidth, img.naturalHeight);
  } catch (err) {
    if (heic) {
      throw new Error(
        'Fotos no formato HEIC não abrem neste navegador. Tire a foto pela câmera do app ou escolha uma foto JPG.',
      );
    }
    if ((err as Error).message.startsWith('Não consegui preparar')) throw err;
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
  const ctx = context2d(canvas);
  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => {
        release(canvas);
        if (b) resolve(b);
        else reject(new Error('Falha ao converter a imagem.'));
      },
      wanted,
      0.95,
    ),
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
  const stamp = new Date().toISOString().slice(0, 16).replace(/\D/g, '');
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
  // Safari pergunta "Baixar?" antes: dá tempo para a pessoa responder
  setTimeout(() => URL.revokeObjectURL(url), 40000);
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
export async function shareFile(blob: Blob, name: string): Promise<'shared' | 'cancelled' | 'retry' | 'unsupported'> {
  const file = new File([blob], name, { type: blob.type });
  const nav = navigator as ShareNavigator;
  if (!nav.canShare?.({ files: [file] })) return 'unsupported';
  try {
    await nav.share({ files: [file], title: 'Meu novo visual — Beauty and self' });
    return 'shared';
  } catch (err) {
    const n = (err as DOMException)?.name;
    // NotAllowedError: o sistema achou que demorou demais depois do toque
    return n === 'AbortError' ? 'cancelled' : n === 'NotAllowedError' ? 'retry' : 'unsupported';
  }
}
