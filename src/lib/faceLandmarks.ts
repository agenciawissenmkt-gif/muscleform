import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const FACE_LANDMARKER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

// Key indices into the 478-point face mesh (MediaPipe's canonical topology).
export const FACE_LANDMARK = {
  FOREHEAD_TOP: 10,
  CHIN: 152,
  LEFT_TEMPLE: 234,
  RIGHT_TEMPLE: 454,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  NOSE_TIP: 1,
} as const;

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

/** Lazily loads (once) the on-device face-mesh model used to anchor the
 * realistic hairstyle overlay to the user's head pose/size. */
export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
      try {
        return await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      } catch {
        return await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      }
    })().catch((err) => {
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}

export interface HeadAnchor {
  /** Center point between the temples, at forehead height (0-1 normalized). */
  cx: number;
  cy: number;
  /** Distance between temples (0-1 normalized), used to scale the overlay. */
  faceWidth: number;
  /** In-plane head tilt, radians (0 = upright). */
  rollRad: number;
  /** Forehead top point, used as the overlay's anchor for hairline placement. */
  foreheadX: number;
  foreheadY: number;
}

/** Reduces a full 478-point face mesh down to the handful of measurements
 * we need to place/scale/rotate a 2D hair overlay convincingly. */
export function computeHeadAnchor(landmarks: { x: number; y: number }[]): HeadAnchor | null {
  const left = landmarks[FACE_LANDMARK.LEFT_TEMPLE];
  const right = landmarks[FACE_LANDMARK.RIGHT_TEMPLE];
  const forehead = landmarks[FACE_LANDMARK.FOREHEAD_TOP];
  if (!left || !right || !forehead) return null;

  const faceWidth = Math.hypot(right.x - left.x, right.y - left.y);
  const rollRad = Math.atan2(right.y - left.y, right.x - left.x);

  return {
    cx: (left.x + right.x) / 2,
    cy: (left.y + right.y) / 2,
    faceWidth,
    rollRad,
    foreheadX: forehead.x,
    foreheadY: forehead.y,
  };
}
