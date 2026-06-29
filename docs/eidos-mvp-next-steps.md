# Eidos MVP Next Steps

## Before beta launch

- Replace color-derived identity placeholders with a commercially licensed avatar-generation provider.
- Add IndexedDB storage with encryption and quota handling for local images.
- Complete accessibility, browser-permission, and device testing.
- Add signed Electron packaging and OBS Virtual Camera integration.
- Add error recovery for WebGL loss and offline MediaPipe model hosting.
- Obtain privacy, biometric, and product counsel review.

## Before real commercial datasets

- Identify candidate datasets and review authoritative license text.
- Confirm commercial training, derivative features, hosted inference, and redistribution rights.
- Review consent, biometric, jurisdiction, demographic coverage, and deletion obligations.
- Add immutable provenance manifests and license snapshots.
- Create isolated raw-media processing infrastructure with access controls and retention enforcement.
- Run bias, representation, privacy leakage, and memorization evaluations.
- Obtain written legal approval before changing `approvedForProductionTraining` to true.

## Still placeholder

The local image provider produces a Three.js identity approximation, not a photorealistic facial reconstruction. Ready Player Me and VRM adapters are stubs. The trainer is statistical and designed for MVP validation, not production-scale learned behavior.
