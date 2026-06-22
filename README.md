# Eidos

Eidos is an MVP web app for realistic AI presence on video calls. It lets a user speak with their real voice while a realistic visual stand-in appears in the call preview. The current prototype uses browser microphone analysis for restrained lip-sync, optional camera-based motion heuristics for training, local gesture memory for voice-only animation, and anti-uncanny safeguards for professional playback.

Eidos is not a cartoon avatar product and does not clone voices. The user's real voice is always used. The avatar is a realistic visual stand-in for privacy, comfort, sickness, AR glasses, and camera-free video calls.

## Stack

- TypeScript
- React with Vite
- Tailwind CSS
- Browser media APIs through `getUserMedia`
- Local storage for MVP profile and gesture memory
- Vitest for service-level tests

## Setup

```bash
npm install
npm run dev
npm run build
npm run test
```

On this Windows machine, the local Node shim can also be used:

```powershell
C:\Users\My\Tools\NodeJS\pnpm.cmd install
C:\Users\My\Tools\NodeJS\pnpm.cmd dev
```

## Architecture

- `src/App.tsx` composes the onboarding, live preview, privacy controls, mode switching, settings, and virtual camera placeholder.
- `src/components/AvatarCanvas.tsx` renders the realistic webcam-style avatar surface.
- `src/avatar/` contains provider-agnostic realistic playback modules for assets, rendering, facial presence, realism controls, and anti-uncanny safeguards.`n- `src/presence/` contains the Universal Human Presence Model, behavior signal schema, state detector, user-profile blending, and future extraction stubs.
- `src/services/AudioLipSyncService.ts` connects to microphone input and produces smoothed amplitude, viseme, jaw, plosive-placeholder, and mouth-shape frames.
- `src/services/FaceTrackingService.ts` provides MVP camera heuristics for head position, nodding, blinking, smiling, and tilt.
- `src/services/GestureMemoryService.ts` stores local gesture patterns over time.
- `src/services/PresenceModeService.ts` converts saved gesture memory and selected mode into voice-only animation behavior.
- `src/services/AvatarAnimationService.ts` merges microphone, tracking, memory, and mode into the avatar frame.

## MVP Limitations

- Face tracking is heuristic and does not use a dedicated vision model yet.
- The current realistic avatar is still a code-native SVG placeholder, not a rigged 3D or neural avatar yet.
- Virtual camera output is a technical placeholder only.
- Gesture memory is local to the browser and not synced.
- Hand gesture support is represented as placeholder events.

## Privacy Model

- Camera is opt-in and intended for training/live mirroring only.
- After training is completed, Eidos automatically switches back to camera-off voice-only presence mode.
- Gesture memory is stored in local storage.
- The app includes a visible `Avatar Mode Active` disclosure toggle.
- The settings screen and live preview both provide gesture memory deletion.

## Next Steps

See [docs/eidos-roadmap.md](docs/eidos-roadmap.md), [docs/realistic-avatar-playback.md](docs/realistic-avatar-playback.md), and [docs/universal-human-presence-model.md](docs/universal-human-presence-model.md) for planned product and technical milestones.
