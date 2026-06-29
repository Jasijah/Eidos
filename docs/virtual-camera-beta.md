# OBS Virtual Camera Beta

Eidos uses an OBS-first route so it can work with Zoom, Google Meet, Microsoft Teams, Discord, and other camera consumers without installing a native camera driver.

1. Start Eidos with `pnpm dev:desktop` or `pnpm desktop` after a desktop build.
2. In **Virtual Camera**, choose 720p, 1080p, or Square; choose 24 or 30 fps. The 60 fps option is a capability placeholder.
3. Choose a camera-safe background and keep **Avatar Mode Active** enabled for disclosure.
4. Open the dedicated output window.
5. In OBS, add **Window Capture** and select **Eidos Avatar Output**.
6. Set the OBS canvas/output resolution to match Eidos and fit the source to the canvas.
7. Start **OBS Virtual Camera**.
8. In the call application, select **OBS Virtual Camera** for video and the user's real microphone for audio.

The main Eidos window must remain running because it owns microphone analysis, MediaPipe tracking when enabled, and Behavioral Presence Model generation. Eidos does not clone or synthesize the user's voice.