# Pinned MediaPipe assets

For a fully offline desktop package, place the `@mediapipe/tasks-vision` 0.10.35 WASM files in `public/mediapipe/wasm/` and the commercially reviewed Face Landmarker model at `public/mediapipe/face_landmarker.task`.

The beta tries these local paths first and then falls back to version-pinned official distribution URLs. Model redistribution and commercial-use terms must be reviewed before shipping an installer.