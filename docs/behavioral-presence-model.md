# Behavioral Presence Model

The Beta Behavioral Presence Model is a hybrid rule/statistical engine. It is not an LLM.

Inputs include speech state, microphone energy, presence mode, user behavior profile, training maturity, recent blink/nod/expression timing, and optional MediaPipe features. Outputs include `BehaviorSignal`, confidence, naturalness score, and debugging reason codes.

Personalization weights are fixed for the Beta:

- new user: 90% universal / 10% user;
- light training: 70% universal / 30% user;
- trained: 40% universal / 60% user.

Voice-only mode uses microphone energy and the user's unchanged real voice. The model generates restrained blinks, gaze, nods, mouth motion, posture, and breathing while the camera remains off. `UncannyValleyGuard` validates the final signal.

The training export schema is ready for XGBoost, LightGBM, or a tiny neural network, but no native ML dependency is required by this sprint.
