# Realistic Avatar Playback

Eidos is designed as a realistic AI presence layer, not a cartoon avatar product. The user speaks with their real microphone audio, and Eidos renders a professional visual stand-in for privacy, comfort, sickness, AR glasses, and camera-free video calls.

## Playback Architecture

The MVP separates behavior generation from rendering so higher-fidelity avatar systems can replace the placeholder renderer later.

- `src/avatar/AvatarAssetProvider.ts` describes provider-agnostic avatar assets and future upgrade paths such as Ready Player Me-style rigs, MetaHuman-style rigs, Live2D/3D blendshape models, and neural talking-head renderers.
- `src/avatar/RealisticAvatarRenderer.ts` renders the current realistic placeholder: head, face, shoulders, upper torso, studio lighting, professional background, and webcam framing.
- `src/avatar/RealismProfile.ts` resolves user controls into motion, expression, blink, mouth, posture, and head-motion ranges.
- `src/avatar/FacialPresenceService.ts` generates natural blinking, micro-expressions, brow movement, eye squint, listening face, thinking face, neutral professional expression, and low-energy behavior.
- `src/avatar/UncannyValleyGuard.ts` clamps motion and expression extremes to avoid toy-like or uncanny playback.
- `src/services/AudioLipSyncService.ts` analyzes microphone amplitude and produces smoothed jaw, mouth, viseme, plosive-placeholder, latency-aware lip-sync frames.
- `src/services/PresenceModeService.ts` generates realistic voice-only head, shoulder, posture, breathing, nod, and idle behavior from saved gesture memory.

## Current MVP Renderer

The current renderer is still a code-native placeholder, but it is intentionally framed like a polished webcam feed:

- Centered face and shoulders.
- Natural camera distance.
- Soft studio lighting.
- Slight background blur.
- Restrained mouth movement.
- Subtle head sway and breathing.
- Professional posture.
- No exaggerated emoji, cartoon, or game-character styling.

## Anti-Uncanny Safeguards

Eidos applies guardrails before rendering each frame:

- Caps mouth opening and jaw movement.
- Caps smiles to prevent over-smiling.
- Keeps eye contact below a fixed stare.
- Keeps blink rate in a human range.
- Limits head and shoulder movement.
- Reduces low-energy motion and expression.
- Prevents repetitive nodding from dominating voice-only playback.
- Maintains a natural mouth rest state when the user is quiet.

## Voice-Only Mode

When the camera is off, Eidos uses local gesture memory to synthesize nonverbal behavior:

- Natural nods while listening.
- Slight head tilts.
- Small expression changes while speaking.
- Occasional blinks.
- Subtle shoulder and breathing movement.
- Context-aware idle motion.
- Gesture frequency based on saved user patterns.

## Privacy Boundary

Eidos does not clone voices. The user remains in control and speaks with their real voice. Avatar playback is only a visual stand-in and should be disclosed with the visible `Avatar Mode Active` control.

## Next Rendering Steps

1. Replace the SVG placeholder with a rigged 3D avatar using blendshape inputs.
2. Add MediaPipe Face Landmarker for better camera-trained behavior.
3. Add phoneme/viseme estimation from Web Audio features or a local model.
4. Render to canvas and pipe the canvas stream into virtual camera output.
5. Add per-user calibration for neutral expression, eye contact, posture, and low-energy profiles.