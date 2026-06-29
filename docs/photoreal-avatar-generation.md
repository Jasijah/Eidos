# Photoreal Avatar Generation

Eidos now has two photoreal paths. **Local Photoreal Portrait** uses the uploaded front image entirely on-device and applies subtle presence-driven motion. It is immediately usable but remains a restrained 2D talking portrait, not a reconstructed neural head. **External Photoreal Provider** is an HTTPS-only adapter for a reviewed commercial vendor. It is disabled unless `VITE_EIDOS_PHOTOREAL_PROVIDER_URL` is configured and the user separately opts into third-party processing.

Uploaded images are used only to create the visual identity. They are not used for voice cloning or model training. Behavior signals remain separate from avatar identity and continue to drive VRM, local portrait, procedural, or future neural providers.

Before enabling a vendor, complete license, DPA, retention, deletion, biometric/privacy, security, regional transfer, and commercial-use review.