# Commercial Dataset Policy

Eidos production training is fail-closed. A dataset must be registered, explicitly allow commercial use, and be approved for production training before `BehaviorDatasetIngestor` accepts it.

## Required registry fields

Every source records its name, source URL, license, commercial-use status, attribution requirement, data types, production approval, and review notes. Unknown licenses are rejected. Non-commercial sources are blocked. Research-only sources may be used only in isolated experimental mode and must never be mixed into production artifacts, checkpoints, evaluations used for claims, or derived datasets.

## Approval workflow

1. Verify the license text at the authoritative source.
2. Record the exact license version and retrieval date.
3. Confirm commercial model training, derivative feature extraction, redistribution, and hosted-service use are allowed.
4. Review biometric, privacy, consent, jurisdiction, and deletion obligations separately from copyright licensing.
5. Record attribution and notice requirements.
6. Obtain legal approval and set `approvedForProductionTraining` only after all checks pass.
7. Preserve a license snapshot and provenance manifest with every training run.

The bundled registry approves only Eidos-owned synthetic behavior fixtures. Placeholder research and unknown-license entries exist to prove rejection behavior. No third-party dataset is implicitly approved by this MVP.

## Identity minimization

Production records contain normalized nonverbal features, not raw identity. Raw images, video, and audio are excluded from `BehaviorTrainingRecord`. Raw media retention requires a separate legal basis, consent, storage boundary, and retention schedule.

Eidos never clones voices. The user's real microphone remains the only voice used during calls.
