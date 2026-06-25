# Avatar Studio

Avatar Studio accepts one to five PNG, JPG, or WebP reference images. Image processing consent is required before generation.

The default provider is `LocalPlaceholderRealisticProvider`, which creates an `AvatarIdentityModel` and applies approximate visual identity values to the Three.js head-and-shoulders renderer. It does not reconstruct a photorealistic face.

Ready Player Me, VRM, and external photoreal providers are integration-ready stubs. Unavailable providers fall back to the local provider. Images cannot be sent to a third party unless local-only mode is disabled and the user separately opts in to third-party avatar processing.

Raw images are excluded from model-improvement training. The current improvement opt-in covers normalized behavioral records only.
