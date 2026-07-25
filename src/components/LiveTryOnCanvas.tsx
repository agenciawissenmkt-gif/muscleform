import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { HairColor } from '../data/haircolors';
import type { Haircut } from '../data/haircuts';
import { getHairSegmenter, SEGMENT_CLASS } from '../lib/vision';
import { hairSilhouettePath } from '../lib/silhouette';

export type TryOnStatus =
  | 'loading-model'
  | 'requesting-camera'
  | 'ready'
  | 'no-camera'
  | 'error';

export interface LiveTryOnHandle {
  capture: () => string | null;
}

interface LiveTryOnCanvasProps {
  color: HairColor | null;
  haircut: Haircut | null;
  frozen: boolean;
  onStatusChange?: (status: TryOnStatus, message?: string) => void;
}

const PROCESS_WIDTH = 640;

const LiveTryOnCanvas = forwardRef<LiveTryOnHandle, LiveTryOnCanvasProps>(
  function LiveTryOnCanvas({ color, haircut, frozen, onStatusChange }, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const colorCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const frozenRef = useRef(frozen);
    const colorRef = useRef(color);
    const haircutRef = useRef(haircut);
    const [dims, setDims] = useState({ w: 0, h: 0 });

    frozenRef.current = frozen;
    colorRef.current = color;
    haircutRef.current = haircut;

    useImperativeHandle(ref, () => ({
      capture: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.toDataURL('image/jpeg', 0.92);
      },
    }));

    useEffect(() => {
      let cancelled = false;

      async function start() {
        if (!navigator.mediaDevices?.getUserMedia) {
          onStatusChange?.('no-camera', 'Este navegador não tem acesso à câmera.');
          return;
        }

        onStatusChange?.('loading-model');
        let segmenter;
        try {
          segmenter = await getHairSegmenter();
        } catch (err) {
          console.error('[hair-segmenter]', err);
          onStatusChange?.('error', 'Não foi possível carregar o modelo de IA.');
          return;
        }
        if (cancelled) return;

        onStatusChange?.('requesting-camera');
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 } },
            audio: false,
          });
        } catch {
          onStatusChange?.('no-camera', 'Permita o acesso à câmera para testar seu novo visual.');
          return;
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        const processH = Math.round((PROCESS_WIDTH * video.videoHeight) / video.videoWidth);
        setDims({ w: PROCESS_WIDTH, h: processH });

        const canvas = canvasRef.current!;
        canvas.width = PROCESS_WIDTH;
        canvas.height = processH;
        const maskCanvas = (maskCanvasRef.current ??= document.createElement('canvas'));
        const blurCanvas = (blurCanvasRef.current ??= document.createElement('canvas'));
        const colorCanvas = (colorCanvasRef.current ??= document.createElement('canvas'));
        [maskCanvas, blurCanvas, colorCanvas].forEach((c) => {
          c.width = PROCESS_WIDTH;
          c.height = processH;
        });

        const ctx = canvas.getContext('2d')!;
        const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;
        const blurCtx = blurCanvas.getContext('2d')!;
        const colorCtx = colorCanvas.getContext('2d')!;

        onStatusChange?.('ready');

        const loop = () => {
          if (cancelled) return;
          if (frozenRef.current) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          if (video.readyState >= 2) {
            const result = segmenter.segmentForVideo(video, performance.now());
            const mask = result.categoryMask;
            // Mirror everything together (video + overlays) so the live
            // preview and the captured photo always match pixel-for-pixel.
            ctx.save();
            ctx.translate(PROCESS_WIDTH, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, PROCESS_WIDTH, processH);

            if (mask) {
              const maskData = mask.getAsUint8Array();
              const mw = mask.width;
              const mh = mask.height;
              const imageData = maskCtx.createImageData(mw, mh);
              let hairPixels = 0;
              let minX = mw, maxX = 0, minY = mh, maxY = 0;
              for (let y = 0; y < mh; y++) {
                for (let x = 0; x < mw; x++) {
                  const idx = y * mw + x;
                  const cls = maskData[idx];
                  const p = idx * 4;
                  if (cls === SEGMENT_CLASS.HAIR) {
                    imageData.data[p] = 255;
                    imageData.data[p + 1] = 255;
                    imageData.data[p + 2] = 255;
                    imageData.data[p + 3] = 255;
                    hairPixels++;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                  } else {
                    imageData.data[p + 3] = 0;
                  }
                }
              }
              maskCanvas.width = mw;
              maskCanvas.height = mh;
              maskCtx.putImageData(imageData, 0, 0);

              blurCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
              blurCtx.filter = 'blur(3px)';
              blurCtx.drawImage(maskCanvas, 0, 0, mw, mh, 0, 0, PROCESS_WIDTH, processH);
              blurCtx.filter = 'none';

              const activeColor = colorRef.current;
              if (activeColor && hairPixels > 40) {
                colorCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
                colorCtx.globalCompositeOperation = 'source-over';
                colorCtx.fillStyle = activeColor.swatch[activeColor.swatch.length - 1];
                colorCtx.fillRect(0, 0, PROCESS_WIDTH, processH);
                colorCtx.globalCompositeOperation = 'destination-in';
                colorCtx.drawImage(blurCanvas, 0, 0);
                colorCtx.globalCompositeOperation = 'source-over';

                ctx.globalCompositeOperation = 'color';
                ctx.globalAlpha = 0.88;
                ctx.drawImage(colorCanvas, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
              }

              const activeHaircut = haircutRef.current;
              if (activeHaircut && hairPixels > 40) {
                const bboxW = ((maxX - minX) / mw) * PROCESS_WIDTH;
                const bboxCx = (((minX + maxX) / 2) / mw) * PROCESS_WIDTH;
                const bboxTop = (minY / mh) * processH;
                const guideW = Math.max(bboxW * 1.5, PROCESS_WIDTH * 0.3);
                const guideH = guideW * 1.25;
                const d = hairSilhouettePath(activeHaircut.silhouette, guideW, guideH);
                ctx.save();
                ctx.translate(bboxCx - guideW / 2, bboxTop - guideH * 0.05);
                ctx.globalAlpha = 0.24;
                ctx.fillStyle = activeColor ? activeColor.swatch[0] : '#cf838a';
                ctx.strokeStyle = 'rgba(255,255,255,0.55)';
                ctx.lineWidth = 2;
                const path = new Path2D(d);
                ctx.fill(path);
                ctx.globalAlpha = 0.5;
                ctx.stroke(path);
                ctx.restore();
                ctx.globalAlpha = 1;
              }
            }
            ctx.restore();
            result.close();
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      }

      start().catch(() => {
        if (!cancelled) onStatusChange?.('error', 'Algo deu errado ao iniciar a câmera.');
      });

      return () => {
        cancelled = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-ink-900">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover"
          width={dims.w || 640}
          height={dims.h || 480}
        />
      </div>
    );
  },
);

export default LiveTryOnCanvas;
