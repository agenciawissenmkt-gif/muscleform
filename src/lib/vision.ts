import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';

const SEGMENTER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

/** Category indices returned per-pixel by the multiclass selfie segmenter. */
export const SEGMENT_CLASS = {
  BACKGROUND: 0,
  HAIR: 1,
  BODY_SKIN: 2,
  FACE_SKIN: 3,
  CLOTHES: 4,
  OTHER: 5,
} as const;

let segmenterPromise: Promise<ImageSegmenter> | null = null;

/** Lazily loads (once) the on-device hair/face/body segmentation model. Runs
 * fully client-side in WASM/WebGL — no photo or video ever leaves the device. */
export function getHairSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
      try {
        return await ImageSegmenter.createFromOptions(vision, {
          baseOptions: { modelAssetPath: SEGMENTER_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
      } catch {
        // Some devices/browsers lack a WebGL delegate for on-device inference;
        // fall back to the (slower but universally supported) CPU delegate.
        return ImageSegmenter.createFromOptions(vision, {
          baseOptions: { modelAssetPath: SEGMENTER_MODEL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
      }
    })();
  }
  return segmenterPromise;
}
