# Virtual Camera Integration

The browser MVP renders the Eidos avatar into a WebGL canvas. Browsers cannot register an operating-system camera device, so virtual camera output requires a desktop bridge.

## Recommended path

1. Package the React app in Electron and keep the renderer isolated from Node APIs.
2. Capture the Three.js canvas with `canvas.captureStream(30)` and combine it with the user's unchanged microphone track.
3. Send the video frames to an Electron main-process bridge over a constrained IPC channel.
4. Publish the frames through OBS Virtual Camera for the first beta. This avoids writing and signing a custom camera driver.
5. Let Zoom, Meet, Teams, and other call clients select `OBS Virtual Camera` while the user's normal microphone remains selected.

## Security and privacy

- Do not send camera frames, landmarks, or microphone audio to a server by default.
- Keep the Avatar Mode Active disclosure burned into the output unless the user explicitly disables it.
- Stop camera tracks immediately after training.
- Store only aggregate behavior values in local storage.
- Do not implement voice cloning or synthesized speech.

## Later native path

A production desktop release can replace OBS with signed virtual-camera components: Windows Media Foundation virtual camera, macOS CoreMediaIO camera extension, and a PipeWire/V4L2 bridge on Linux. That work requires platform-specific installers, signing, updates, crash recovery, and extensive compatibility testing.

## Current MVP limitation

The web app is a realistic call preview and behavior-training product. It cannot appear as a selectable camera in third-party meeting software until the Electron + OBS bridge is shipped.
