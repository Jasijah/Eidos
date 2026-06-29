# Eidos Desktop Beta

Eidos ships a thin Electron shell around the same Vite/React application used in the browser. The shell enables a dedicated, frameless avatar output window while keeping camera, microphone, and behavior processing in the main Eidos window.

## Run

```powershell
pnpm install
pnpm dev:desktop
```

Production compile:

```powershell
pnpm build:desktop
pnpm desktop
```

The preload bridge exposes only runtime information and output-window controls. Node integration is disabled, context isolation and renderer sandboxing are enabled, and browser mode remains supported.

## Beta limitations

The sprint produces compiled Electron application files, not a signed installer. Before public distribution, add electron-builder or Electron Forge, OS signing/notarization, auto-update policy, crash reporting consent, and OS keychain-backed encryption keys.