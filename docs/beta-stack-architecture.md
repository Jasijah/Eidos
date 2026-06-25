# Beta Stack Architecture

Eidos Beta is a local-first visual presence layer. It does not clone or synthesize voices. The user's real microphone remains the only voice in a call.

## Runtime stack

1. `MediaPipeFaceTracker` extracts face blendshapes and head pose in the browser. `MediaPipeFeatureMapper` normalizes blink, jaw, smile, brow, gaze, head rotation, expression, and confidence. A lower-confidence local image heuristic is used when MediaPipe cannot load.
2. Avatar identity is handled by `AvatarIdentityModel`, `PhotorealisticAvatarGenerator`, and `AvatarProviderRegistry`. Identity controls appearance and asset selection only.
3. `BehavioralPresenceModel` handles speaking, listening, idle, thinking, mode behavior, user-profile blending, and camera features. It does not read avatar images.
4. `UncannyValleyGuard` constrains the final behavior signal.
5. Optional `LocalQwenProvider` emits high-level context labels. It is disabled by default and never directly controls animation.

## Separation of systems

Avatar identity and behavioral presence are intentionally separate. Deleting images does not delete behavior memory. Deleting behavior memory does not delete avatar identity. Voice data belongs to neither system and is not stored.

## Current deployment boundaries

The Three.js realistic placeholder is production-shaped but not photorealistic reconstruction. Ready Player Me, VRM, external photoreal generation, a local Qwen runtime, and virtual camera output remain adapters or roadmap work.
