# Native Virtual Camera

The desktop beta detects a packaged native Eidos camera driver and exposes start/stop IPC, but intentionally falls back to OBS until a signed OS driver is installed. The frame protocol requires bounded resolution/frame rate and visible avatar disclosure.

A shippable driver requires Windows Media Foundation and macOS CoreMediaIO implementations, signing certificates, installer elevation, uninstall cleanup, crash isolation, shared-memory frame transport, and testing in Zoom, Meet, Teams, Discord, and OBS. These cannot be truthfully completed without platform signing identities and driver development environments.