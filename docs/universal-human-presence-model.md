# Universal Human Presence Model

The Universal Human Presence Model is Eidos' baseline behavior engine for realistic video-call avatar presence. It makes a new user's avatar feel naturally present before that user has trained a personal behavior profile.

The model does not clone voices, synthesize speech, or alter the user's audio. The user's real microphone audio remains unchanged. The model only outputs visual behavior signals for the avatar renderer.

## What It Does

The model generates baseline human nonverbal behavior for video-call avatars across speaking, listening, idle, thinking, professional, casual, creator, and low-energy states.

It outputs a `BehaviorSignal` with:

- `timestamp`
- `blinkLeft`
- `blinkRight`
- `gazeX`
- `gazeY`
- `headYaw`
- `headPitch`
- `headRoll`
- `nodIntensity`
- `smileIntensity`
- `browRaise`
- `jawOpen`
- `shoulderShift`
- `breathingMotion`
- `confidence`

These signals are provider-agnostic. A simple SVG renderer, a rigged 3D avatar, a Live2D model, a MetaHuman-style rig, or a neural talking-head renderer can consume the same schema.

## What It Does Not Do

- It does not build voice cloning.
- It does not infer identity.
- It does not upload training data.
- It does not produce a photoreal model by itself.
- It does not replace explicit avatar-mode disclosure.

## Presence State Detection

`PresenceStateDetector` classifies the current activity from microphone activity:

- `speaking` when microphone amplitude indicates active speech.
- `listening` when low-level activity or future conversation context suggests attention.
- `idle` when there is no meaningful activity.
- `thinking` through placeholder hooks for future transcript or conversation context.

Future hooks can incorporate local transcription intent, meeting role, turn-taking state, and conversation context without changing the behavior signal schema.

## Mode Profiles

The model includes four presets:

- `Professional`: restrained gestures, steady eye contact, moderate posture lift.
- `Casual`: warmer expression and slightly more head movement.
- `Creator`: higher expression and gesture energy while keeping anti-uncanny limits.
- `LowEnergy`: reduced movement, softer expression, lower posture energy.

Each mode controls gesture frequency, expression intensity, eye contact, nodding, blink rate, posture, and idle movement.

## Personalization Over Time

`UserBehaviorProfile` can override the universal baseline as local training data accumulates:

- New users: 90% universal, 10% user profile.
- Light training: 70% universal, 30% user profile.
- Repeated use: 40% universal, 60% user profile.

The profile tracks blink rate, nod rate, smile frequency, head movement intensity, eye contact preference, gesture energy, and posture style. In the MVP this is derived from local gesture memory; future extraction can use richer face and gesture features.

## Anti-Uncanny Safeguards

`UncannyValleyGuard` constrains output before rendering to avoid:

- Blink frequency that is too high or too low.
- Repetitive nodding.
- Dead-eye stare.
- Frozen expression.
- Excessive head movement.
- Exaggerated mouth movement.
- Unnatural stillness.

## MediaPipe Extraction Placeholders

The first implementation includes stubs for future local behavior extraction:

- `FaceLandmarkExtractor`
- `GestureFeatureExtractor`
- `TrainingDataRecorder`

These are intentionally local-first boundaries. The product should prefer in-browser extraction and store only compact behavior features unless the user explicitly opts into another storage model.

## Dataset and Privacy Considerations

The universal baseline should be tuned from broad, consented, representative video-call behavior data, not from private user camera streams. Personal behavior memory should remain understandable, editable, and deletable. Eidos should store compact behavior features rather than raw video wherever possible.

The model is a presence layer for comfort, accessibility, AR glasses, sickness, privacy, and camera-free calls. It should remain disclosed and user-controlled.