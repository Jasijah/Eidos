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

- Face tracking uses MediaPipe Face Landmarker, with a lower-confidence local fallback when the model cannot load.
- The current avatar is a procedural Three.js human bust. Ready Player Me-compatible GLB loading is architected, but production avatar assets are not bundled yet.
- Virtual camera output still requires the documented Electron + OBS desktop bridge.
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

## Usable beta workflow

1. Run Eidos and connect the real microphone.
2. Use Voice-Only Presence immediately with the universal presence model.
3. Optionally complete a 60-second local camera training session.
4. After training, Eidos stops the camera and uses the persisted behavior profile to personalize movement.
5. Preview the result inside the simulated meeting frame.

MediaPipe Face Landmarker supplies head pose, blink, smile, gaze, and expression signals when its browser model is available. A lower-confidence local frame heuristic keeps training usable if the model cannot load. The avatar is rendered with Three.js through a provider-neutral asset contract that can accept a Ready Player Me-compatible GLB.

See [docs/virtual-camera-integration.md](docs/virtual-camera-integration.md) for the desktop output path.

## Commercial Safety and Avatar Identity

Eidos now includes a fail-closed commercial dataset registry, identity-free behavior ingestion records, explicit local training consent, and local image-based avatar identity profiles. No third-party dataset is approved by default. Unknown and non-commercial licenses are blocked from production training.

See:

- [Commercial dataset policy](docs/commercial-dataset-policy.md)
- [Avatar image upload](docs/avatar-image-upload.md)
- [Behavior model training](docs/behavior-model-training.md)
- [Privacy and consent](docs/privacy-and-consent.md)
- [MVP next steps](docs/eidos-mvp-next-steps.md)

## Beta Stack

Eidos now has explicit MediaPipe tracking, a provider-based realistic avatar identity architecture, a hybrid Behavioral Presence Model, safe ML training exports, optional local Qwen 3 4B context hooks, and a Privacy Dashboard. Avatar identity and behavior remain separate systems, and the user's real voice is never cloned or replaced.

See [Beta Stack Architecture](docs/beta-stack-architecture.md) and [Beta Launch Checklist](docs/beta-launch-checklist.md).

## Call-Usable Desktop Beta

The current beta adds an Electron shell, a dedicated OBS-ready avatar output window, 720p/1080p/square framing, active VRM provider architecture, role-based photo onboarding, encrypted IndexedDB storage for avatar and behavior records, local-first MediaPipe asset resolution, optional local Qwen detection, and anonymized beta feedback export.

```powershell
pnpm install
pnpm dev:desktop
pnpm build
pnpm test
pnpm build:desktop
```

See [Desktop Beta](docs/desktop-beta.md), [Virtual Camera Beta](docs/virtual-camera-beta.md), and [Beta User Testing Plan](docs/beta-user-testing-plan.md). Eidos always uses the user's real microphone audio and never performs voice cloning.
## Desktop Distribution and Closed Beta

- `pnpm pack:desktop`: unpacked desktop QA build
- `pnpm dist:win`: Windows NSIS installer
- `pnpm dist:mac`: macOS DMG (run on macOS with signing/notarization secrets)

The Local Photoreal Portrait provider is available without cloud processing. The external photoreal adapter remains disabled until an HTTPS provider passes commercial, privacy, retention, and deletion review. See `docs/desktop-signing-and-release.md`, `docs/photoreal-avatar-generation.md`, `docs/native-virtual-camera.md`, and `docs/closed-beta-operations.md`.
## Closed Beta Intelligence

Eidos now includes opt-in local anonymous analytics, completed presence-session tracking, presence quality scoring, feedback and PMF prompts, invite/referral administration, beta signup capture, performance/crash exports, Beta Dashboard, Founder Dashboard, and developer Administrator Console.

Analytics are disabled by default and never include raw audio, video, conversation text, or uploaded image pixels. See `docs/closed-beta-plan.md`, `docs/beta-success-metrics.md`, `docs/product-market-fit.md`, `docs/investor-metrics.md`, and `docs/privacy-analytics.md`.
## Closed Beta Launch Readiness

The launch candidate adds personalized onboarding, a post-avatar practice walkthrough, Trust Center, System Check, Help Center, Beta Hub, recovery actions, accessibility improvements, expanded founder metrics, and desktop branding.

See [Beta Readiness Report](docs/beta-readiness-report.md), [Beta User Guide](docs/beta-user-guide.md), [Release Notes](docs/release-notes.md), [Known Issues](docs/known-issues.md), and [Founder Launch Checklist](docs/founder-launch-checklist.md).

## Vercel Web Entry

The browser deployment now exposes three routes:

- `/`: public Eidos welcome page
- `/signup`: closed beta signup
- `/app`: the local-first Eidos product

`vercel.json` rewrites direct route requests to the Vite application. Set the server-side `EIDOS_BETA_SIGNUP_WEBHOOK_URL` environment variable in Vercel to deliver beta signup JSON to an approved CRM, automation webhook, or intake service. Without it, the form clearly reports that the request was saved locally only.
