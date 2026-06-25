# Beta Launch Checklist

## Implemented

- MediaPipe browser tracking with graceful fallback.
- 60-second local training and summarized behavior profile.
- Local realistic avatar identity placeholder with provider registry.
- Hybrid Behavioral Presence Model and voice-only mode.
- Consent- and license-gated JSONL/CSV training export.
- Optional disabled-by-default Qwen context hooks.
- Privacy Dashboard export and deletion workflows.

## Blockers before external beta

- Test camera/microphone permissions on supported browsers and devices.
- Host MediaPipe model/WASM assets under a controlled commercial deployment.
- Complete accessibility and long-session performance testing.
- Replace the procedural identity placeholder with a commercially reviewed photoreal provider or local model.
- Complete signed Electron and virtual camera output.
- Add IndexedDB encryption, quota handling, and migration logic.
- Conduct privacy, biometric, security, and commercial-license legal review.
- Validate representation, bias, and naturalness with consented beta participants.

## Before enabling Qwen

- Verify the exact Qwen 3 4B weight and runtime licenses.
- Connect only to a local runtime.
- Add resource limits, model availability detection, and transcript retention controls.

## June 24, 2026 next-sprint status

Implemented locally: photo-derived avatar playback, external photoreal provider contract, OS-protected desktop encryption keys, installer generation, native-camera driver boundary, cohort enrollment, and diagnostics export.

Public release remains blocked by external credentials and native deliverables: Authenticode certificate, Apple Developer signing/notarization credentials, a contracted photoreal provider, Windows Media Foundation virtual camera implementation, macOS CoreMediaIO Camera Extension, privacy/security review, and real closed-beta evidence.