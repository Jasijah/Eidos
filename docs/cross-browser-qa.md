# Cross-Browser QA

| Surface | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| Microphone / real voice | Required | Required | Required | Required |
| Camera permission | Required | Required | Required | Required |
| MediaPipe GPU/WASM | Primary | Primary | Verify fallback | Verify fallback |
| Canvas output window | Required | Required | Verify capture behavior | Verify capture behavior |
| OBS window capture | Windows/macOS | Windows | Manual | macOS manual |
| Voice-only behavior | Required | Required | Required | Required |
| IndexedDB encryption | Required | Required | Required | Required |
| Mobile responsive UI | Android | Android | Android | iOS |

## Manual checklist

Confirm denial/revocation of permissions, camera disconnect, microphone reconnect, local MediaPipe asset failure, CDN-offline fallback behavior, IndexedDB quota errors, deletion verification, output resizing, square framing, disclosure visibility, and recovery after reloading each page. Electron desktop mode is Chromium-based and must be tested separately on Windows and macOS.