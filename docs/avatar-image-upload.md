# Avatar Image Upload

Users can upload PNG, JPG, or WebP images to create a local visual avatar identity. The MVP accepts up to five images of 2 MB each.

## Consent and purpose

Avatar creation consent is required before processing. Images are used only to create a visual stand-in. They are not used for voice cloning. Public model training is off by default and requires a separate explicit opt-in.

## Local MVP behavior

`UserImageAvatarCreator` validates images and creates an `AvatarIdentityProfile`. The local provider derives placeholder skin and hair colors and applies them to the Three.js avatar. It does not reconstruct a photorealistic 3D face.

When `Do not save images` is selected, the profile remains in memory for the current session. When `Save avatar locally only` is selected, it is stored in browser local storage. Delete Avatar Data removes the stored identity profile and image reference.

## Provider roadmap

`AvatarGenerationProvider` supports local, Ready Player Me, and VRM adapters. External adapters remain disabled until API terms, commercial rights, biometric handling, deletion APIs, security, and data-processing agreements are reviewed.
