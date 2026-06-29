# Eidos Native Virtual Camera Boundary

This directory defines the future signed native companion. The web/Electron application is complete through driver detection, lifecycle IPC, output framing, and a versioned frame-transport handshake. The OS driver itself must be implemented and signed separately:

- Windows: Media Foundation Virtual Camera on supported Windows 11 builds, with a signed companion service for shared-memory BGRA frames.
- macOS: CoreMediaIO Camera Extension, system extension entitlement, notarization, and user installation approval.

The driver must expose only video frames. Audio always remains the real microphone selected by the user in the call application. `Avatar Mode Active` disclosure is required by the transport handshake.