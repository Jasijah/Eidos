# Desktop Signing and Release

`pnpm pack:desktop` creates an unpacked application for internal QA. `pnpm dist:win` creates an NSIS installer and `pnpm dist:mac` creates a DMG.

## Windows

Provide `CSC_LINK` and `CSC_KEY_PASSWORD` for an Authenticode certificate. The certificate subject should match the configured publisher. Test SmartScreen reputation before external distribution.

## macOS

Provide `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID`. The app requests camera and microphone entitlements. Notarization must succeed before public distribution.

The GitHub workflow creates artifacts but cannot sign without repository secrets. Never commit certificates or passwords. Public beta is blocked until signed installers, notarization, privacy review, and update-channel testing are complete.