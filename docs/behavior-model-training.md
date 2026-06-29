# Behavioral Presence Model Training

The MVP trainer is deliberately lightweight. It uses a rule-based universal baseline plus statistical profiles derived from normalized behavior records. It does not use an LLM and does not clone or synthesize voices.

## Training records

`BehaviorFeatureExtractor` converts sampled behavior into blink rate, nod rate, head pose, gaze movement, smile frequency, expression intensity, posture movement, gesture energy, activity state, and presence mode. Records declare that raw identity and raw media are absent.

`TrainingDataStore` rejects records that contain raw identity or retained media. `PresenceModelTrainer` groups approved records by mode and state, creates statistical profiles, and predicts `BehaviorSignal` values. `UncannyValleyGuard` constrains every prediction.

Supported states and modes include speaking, listening, idle, thinking, Professional, Casual, Creator, and Low Energy.

## Future models

The JSON records can later feed gradient boosting or a tiny neural network. Any replacement must preserve license manifests, privacy boundaries, deterministic fallback behavior, evaluation by mode/state, and anti-uncanny output constraints.
