# Hair asset pipeline harness

`index.html` is a static page (no build step) used by `scripts/generate-hair-assets.mjs`
to extract a clean, transparent hair-only PNG from a reference photo — using
our own on-device MediaPipe models — and to calibrate where that cutout
should anchor onto a live face (see `computeHeadAnchor` in
`src/lib/faceLandmarks.ts` for the runtime side of the same math).

It loads MediaPipe from the CDN, same as the production app. If your network
makes that unreliable, download the files once into a local `vendor/`
folder (gitignored) and swap the import + `modelAssetPath`/`forVisionTasks`
values at the top of `index.html` to `./vendor/...`:

```bash
mkdir -p scripts/harness/vendor/wasm
curl -sSL -o scripts/harness/vendor/vision_bundle.mjs \
  https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs
curl -sSL -o scripts/harness/vendor/selfie_multiclass_256x256.tflite \
  https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
curl -sSL -o scripts/harness/vendor/face_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task
cp -r node_modules/@mediapipe/tasks-vision/wasm/* scripts/harness/vendor/wasm/
```

`images/` holds the raw OpenAI-generated reference photos (kept so the
manifest/cutouts can be regenerated without paying for new generations).
