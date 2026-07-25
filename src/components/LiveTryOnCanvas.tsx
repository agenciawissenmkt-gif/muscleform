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
import { getFaceLandmarker, computeHeadAnchor } from '../lib/faceLandmarks';
import { hairSilhouettePath } from '../lib/silhouette';
import { averageSwatchLuma, luma } from '../lib/color';
import hairAssetManifest from '../data/hairAssetManifest.json';

interface AssetAnchor {
  faceWidth: number;
  foreheadX: number;
  foreheadY: number;
}
const HAIR_ASSETS = hairAssetManifest as Record<string, AssetAnchor>;

const overlayImageCache = new Map<string, HTMLImageElement>();
function getOverlayImage(id: string): HTMLImageElement {
  let img = overlayImageCache.get(id);
  if (!img) {
    img = new Image();
    img.src = `/hair-assets/${id}.png`;
    overlayImageCache.set(id, img);
  }
  return img;
}

export type TryOnStatus =
  | 'loading-model'
  | 'requesting-camera'
  | 'ready'
  | 'no-camera'
  | 'error';

export interface CaptureResult {
  /** Full photo, mirrored/composited exactly as shown on screen. */
  photo: string;
  /** Edit mask (PNG with alpha) for generative AI editing: transparent =
   * editable hair area (dilated a bit for new length/volume), opaque black =
   * protected (face, skin, background, everything else). Null if no hair
   * was confidently detected in the last frame. */
  mask: string | null;
}

export interface LiveTryOnHandle {
  capture: () => CaptureResult | null;
}

interface LiveTryOnCanvasProps {
  color: HairColor | null;
  haircut: Haircut | null;
  frozen: boolean;
  facingMode: 'user' | 'environment';
  onStatusChange?: (status: TryOnStatus, message?: string) => void;
}

const PROCESS_WIDTH = 640;

const LiveTryOnCanvas = forwardRef<LiveTryOnHandle, LiveTryOnCanvasProps>(
  function LiveTryOnCanvas({ color, haircut, frozen, facingMode, onStatusChange }, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const colorCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const lumaLayerCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const tinyColorCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const tinyMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const faceMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const blurFaceCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const editableCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const editMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const faceProtectCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const lastBboxRef = useRef<{ cx: number; top: number; w: number; h: number } | null>(null);
    const buildEditMaskRef = useRef<() => string | null>(() => null);
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
        const photo = canvas.toDataURL('image/jpeg', 0.92);
        const mask = buildEditMaskRef.current();
        return { photo, mask };
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

        // Optional: powers the realistic hairstyle overlay for haircuts that
        // have a pre-made asset. Not fatal if it fails to load — the app
        // just falls back to the abstract shape guide for every haircut.
        const landmarker = await getFaceLandmarker().catch((err) => {
          console.error('[face-landmarker]', err);
          return null;
        });
        if (cancelled) return;

        onStatusChange?.('requesting-camera');
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 1280 } },
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
        const lumaLayerCanvas = (lumaLayerCanvasRef.current ??= document.createElement('canvas'));
        const faceMaskCanvas = (faceMaskCanvasRef.current ??= document.createElement('canvas'));
        const blurFaceCanvas = (blurFaceCanvasRef.current ??= document.createElement('canvas'));
        const editableCanvas = (editableCanvasRef.current ??= document.createElement('canvas'));
        const editMaskCanvas = (editMaskCanvasRef.current ??= document.createElement('canvas'));
        const faceProtectCanvas = (faceProtectCanvasRef.current ??= document.createElement('canvas'));
        [
          maskCanvas,
          blurCanvas,
          colorCanvas,
          lumaLayerCanvas,
          faceMaskCanvas,
          blurFaceCanvas,
          editableCanvas,
          editMaskCanvas,
          faceProtectCanvas,
        ].forEach((c) => {
          c.width = PROCESS_WIDTH;
          c.height = processH;
        });
        const TINY_W = 48;
        const TINY_H = Math.max(1, Math.round((TINY_W * processH) / PROCESS_WIDTH));
        const tinyColorCanvas = (tinyColorCanvasRef.current ??= document.createElement('canvas'));
        const tinyMaskCanvas = (tinyMaskCanvasRef.current ??= document.createElement('canvas'));
        [tinyColorCanvas, tinyMaskCanvas].forEach((c) => {
          c.width = TINY_W;
          c.height = TINY_H;
        });

        const ctx = canvas.getContext('2d')!;
        const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;
        const blurCtx = blurCanvas.getContext('2d')!;
        const colorCtx = colorCanvas.getContext('2d')!;
        const lumaLayerCtx = lumaLayerCanvas.getContext('2d')!;
        const tinyColorCtx = tinyColorCanvas.getContext('2d', { willReadFrequently: true })!;
        const tinyMaskCtx = tinyMaskCanvas.getContext('2d', { willReadFrequently: true })!;
        const faceMaskCtx = faceMaskCanvas.getContext('2d', { willReadFrequently: true })!;
        const blurFaceCtx = blurFaceCanvas.getContext('2d')!;
        const editableCtx = editableCanvas.getContext('2d')!;
        const editMaskCtx = editMaskCanvas.getContext('2d')!;
        const faceProtectCtx = faceProtectCanvas.getContext('2d')!;

        // Builds a PNG edit-mask for generative AI photo editing: transparent
        // (alpha 0) over the hair area — dilated outward so the model has
        // room to draw a longer/fuller shape — minus the detected face-skin
        // area, which stays fully opaque (protected) no matter what.
        buildEditMaskRef.current = () => {
          const bbox = lastBboxRef.current;
          if (!bbox) return null;

          editableCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
          editableCtx.save();
          if (facingMode === 'user') {
            editableCtx.translate(PROCESS_WIDTH, 0);
            editableCtx.scale(-1, 1);
          }
          const scale = 1.7;
          const w = bbox.w * scale;
          const h = bbox.h * scale * 1.35;
          editableCtx.drawImage(blurCanvas, 0, 0, PROCESS_WIDTH, processH, bbox.cx - w / 2, bbox.top - h * 0.12, w, h);
          editableCtx.globalCompositeOperation = 'destination-out';
          editableCtx.drawImage(blurFaceCanvas, 0, 0);
          editableCtx.globalCompositeOperation = 'source-over';
          editableCtx.restore();

          editMaskCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
          editMaskCtx.fillStyle = '#000000';
          editMaskCtx.fillRect(0, 0, PROCESS_WIDTH, processH);
          editMaskCtx.globalCompositeOperation = 'destination-out';
          editMaskCtx.drawImage(editableCanvas, 0, 0);
          editMaskCtx.globalCompositeOperation = 'source-over';

          return editMaskCanvas.toDataURL('image/png');
        };

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
            // Only the front (selfie) camera is mirrored — a rear camera
            // should show the scene as-is, like every native camera app.
            ctx.save();
            if (facingMode === 'user') {
              ctx.translate(PROCESS_WIDTH, 0);
              ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, PROCESS_WIDTH, processH);

            if (mask) {
              const maskData = mask.getAsUint8Array();
              const mw = mask.width;
              const mh = mask.height;
              const imageData = maskCtx.createImageData(mw, mh);
              const faceImageData = faceMaskCtx.createImageData(mw, mh);
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
                  if (cls === SEGMENT_CLASS.FACE_SKIN) {
                    faceImageData.data[p] = 255;
                    faceImageData.data[p + 1] = 255;
                    faceImageData.data[p + 2] = 255;
                    faceImageData.data[p + 3] = 255;
                  } else {
                    faceImageData.data[p + 3] = 0;
                  }
                }
              }
              maskCanvas.width = mw;
              maskCanvas.height = mh;
              maskCtx.putImageData(imageData, 0, 0);
              faceMaskCanvas.width = mw;
              faceMaskCanvas.height = mh;
              faceMaskCtx.putImageData(faceImageData, 0, 0);

              blurCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
              blurCtx.filter = 'blur(3px)';
              blurCtx.drawImage(maskCanvas, 0, 0, mw, mh, 0, 0, PROCESS_WIDTH, processH);
              blurCtx.filter = 'none';

              // A slightly wider blur on the face mask so the protected zone
              // has a small safety margin around the actual facial skin.
              blurFaceCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
              blurFaceCtx.filter = 'blur(6px)';
              blurFaceCtx.drawImage(faceMaskCanvas, 0, 0, mw, mh, 0, 0, PROCESS_WIDTH, processH);
              blurFaceCtx.filter = 'none';

              if (hairPixels > 40) {
                lastBboxRef.current = {
                  cx: (((minX + maxX) / 2) / mw) * PROCESS_WIDTH,
                  top: (minY / mh) * processH,
                  w: ((maxX - minX) / mw) * PROCESS_WIDTH,
                  h: ((maxY - minY) / mh) * processH,
                };
              }

              const activeColor = colorRef.current;
              if (activeColor && hairPixels > 40) {
                // Estimate the real hair's current average lightness (cheaply,
                // at a tiny resolution) so we know how far it is from the
                // target color. The canvas 'color' blend below only replaces
                // hue/saturation and keeps the destination's original
                // lightness — so without this step, dark hair could never
                // visibly become platinum blonde (it would just look tinted,
                // still dark). We push lightness toward the target first.
                tinyColorCtx.drawImage(video, 0, 0, TINY_W, TINY_H);
                tinyMaskCtx.clearRect(0, 0, TINY_W, TINY_H);
                tinyMaskCtx.drawImage(maskCanvas, 0, 0, mw, mh, 0, 0, TINY_W, TINY_H);
                const tinyColors = tinyColorCtx.getImageData(0, 0, TINY_W, TINY_H).data;
                const tinyMask = tinyMaskCtx.getImageData(0, 0, TINY_W, TINY_H).data;
                let weightSum = 0;
                let lumaSum = 0;
                for (let i = 0; i < TINY_W * TINY_H; i++) {
                  const w = tinyMask[i * 4 + 3] / 255;
                  if (w <= 0) continue;
                  const p = i * 4;
                  lumaSum += luma(tinyColors[p], tinyColors[p + 1], tinyColors[p + 2]) * w;
                  weightSum += w;
                }
                const currentLuma = weightSum > 0 ? lumaSum / weightSum : 0.3;
                const targetLuma = averageSwatchLuma(activeColor.swatch);
                const delta = targetLuma - currentLuma;

                if (Math.abs(delta) > 0.03) {
                  lumaLayerCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
                  lumaLayerCtx.globalCompositeOperation = 'source-over';
                  lumaLayerCtx.fillStyle = delta > 0 ? '#ffffff' : '#000000';
                  lumaLayerCtx.fillRect(0, 0, PROCESS_WIDTH, processH);
                  lumaLayerCtx.globalCompositeOperation = 'destination-in';
                  lumaLayerCtx.drawImage(blurCanvas, 0, 0);
                  lumaLayerCtx.globalCompositeOperation = 'source-over';

                  ctx.globalCompositeOperation = delta > 0 ? 'screen' : 'multiply';
                  ctx.globalAlpha = Math.min(0.96, Math.abs(delta) * 2.1);
                  ctx.drawImage(lumaLayerCanvas, 0, 0);
                  ctx.globalCompositeOperation = 'source-over';
                  ctx.globalAlpha = 1;
                }

                colorCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
                colorCtx.globalCompositeOperation = 'source-over';
                colorCtx.fillStyle = activeColor.swatch[activeColor.swatch.length - 1];
                colorCtx.fillRect(0, 0, PROCESS_WIDTH, processH);
                colorCtx.globalCompositeOperation = 'destination-in';
                colorCtx.drawImage(blurCanvas, 0, 0);
                colorCtx.globalCompositeOperation = 'source-over';

                ctx.globalCompositeOperation = 'color';
                ctx.globalAlpha = 0.97;
                ctx.drawImage(colorCanvas, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
              }

              const activeHaircut = haircutRef.current;
              let usedRealisticOverlay = false;

              if (activeHaircut && landmarker && hairPixels > 40) {
                const refAnchor = HAIR_ASSETS[activeHaircut.id];
                if (refAnchor) {
                  const overlayImg = getOverlayImage(activeHaircut.id);
                  const faceResult = landmarker.detectForVideo(video, performance.now());
                  const lm = faceResult.faceLandmarks?.[0];
                  const liveAnchor = lm ? computeHeadAnchor(lm) : null;
                  if (liveAnchor && overlayImg.complete && overlayImg.naturalWidth > 0) {
                    const scaleFactor =
                      (liveAnchor.faceWidth * PROCESS_WIDTH) / (refAnchor.faceWidth * overlayImg.naturalWidth);
                    const liveForeheadX = liveAnchor.foreheadX * PROCESS_WIDTH;
                    const liveForeheadY = liveAnchor.foreheadY * processH;
                    const overlayForeheadX = refAnchor.foreheadX * overlayImg.naturalWidth;
                    const overlayForeheadY = refAnchor.foreheadY * overlayImg.naturalHeight;

                    ctx.save();
                    ctx.translate(liveForeheadX, liveForeheadY);
                    ctx.rotate(liveAnchor.rollRad);
                    ctx.scale(scaleFactor, scaleFactor);
                    ctx.translate(-overlayForeheadX, -overlayForeheadY);
                    ctx.drawImage(overlayImg, 0, 0);
                    ctx.restore();

                    // Real face pixels are redrawn on top of the overlay so an
                    // imprecise fit can never obscure the person's actual face
                    // — the same protective guarantee as the AI edit mask.
                    faceProtectCtx.clearRect(0, 0, PROCESS_WIDTH, processH);
                    faceProtectCtx.drawImage(video, 0, 0, PROCESS_WIDTH, processH);
                    faceProtectCtx.globalCompositeOperation = 'destination-in';
                    faceProtectCtx.drawImage(blurFaceCanvas, 0, 0);
                    faceProtectCtx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(faceProtectCanvas, 0, 0);

                    usedRealisticOverlay = true;
                  }
                }
              }

              if (!usedRealisticOverlay && activeHaircut && hairPixels > 40) {
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
      // Re-run (and restart the camera stream) whenever the requested camera
      // facing side changes. The model itself is cached globally, so this
      // doesn't reload the AI — only the video track is reopened.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

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
