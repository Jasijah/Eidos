# Remaining Risks Report

## High

1. Windows installer is not Authenticode signed and macOS output is not signed or notarized. Obtain credentials, sign in CI, and test clean-machine installation.
2. Native virtual camera drivers are not implemented. Keep OBS as the required beta route; build Windows Media Foundation and macOS CoreMediaIO components before public launch.
3. Photoreal identity is a local approximation. Contract and review a commercially licensed provider or ship a validated local model.

## Medium

1. MediaPipe assets and behavior quality need device-matrix testing across beta hardware.
2. Biometric, privacy, and security policies require external counsel and penetration review.
3. Update checks are architecture-ready but require signed GitHub releases and a production update feed.
4. Support email and Discord are placeholders until operational accounts and response SLAs are assigned.

## Validation risk

No product metric can substitute for observed use. The first beta must verify installation completion, meeting success, trust, naturalness, repeat use, and willingness to pay.
