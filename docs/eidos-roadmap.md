# Eidos Roadmap

## Phase 1: MVP Prototype

- Browser-based onboarding, avatar selection, live preview, microphone lip-sync, optional camera tracking, local gesture memory, voice-only presence mode, privacy controls, and settings.
- Service boundaries for animation, audio, face tracking, gesture memory, and presence modes.
- Basic unit tests for gesture memory and presence mode logic.

## Phase 2: Better Presence Quality

- Replace heuristic face tracking with MediaPipe Face Landmarker or a similar local-first model.
- Add calibrated blink, smile, gaze, nod, and head-pose extraction.
- Add avatar rig presets and a realistic 2D/3D avatar pipeline.
- Improve idle and gesture synthesis from longer session history.

## Phase 3: Call Integration

- Implement canvas capture with `HTMLCanvasElement.captureStream()`.
- Build a WebRTC output path that can be consumed by meeting integrations.
- Explore OS-level virtual camera bridge options for macOS and Windows.
- Add explicit in-call disclosure overlays and enterprise policy controls.

## Phase 4: Privacy and Trust

- Add local encrypted gesture memory.
- Add memory export/import and per-session retention controls.
- Add clear audit logs for camera use, microphone use, and memory updates.
- Add admin-configurable disclosure requirements.

## Phase 5: Production Readiness

- Add accessibility review, responsive QA, and browser compatibility testing.
- Add end-to-end tests for onboarding and preview workflows.
- Add avatar asset loading, fallback states, and performance instrumentation.
- Package deployment with environment-specific feature flags.
