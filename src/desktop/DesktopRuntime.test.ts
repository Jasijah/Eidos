import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDesktopRuntimeStatus } from './DesktopRuntime';

describe('Electron desktop bridge', () => {
  afterEach(() => { delete window.eidosDesktop; vi.restoreAllMocks(); });
  it('preserves browser compatibility without Electron', async () => { await expect(getDesktopRuntimeStatus()).resolves.toEqual({ desktop: false, platform: 'browser', version: 'web' }); });
  it('uses the isolated preload bridge when desktop is available', async () => {
    window.eidosDesktop = { getInfo: vi.fn().mockResolvedValue({ desktop: true, platform: 'win32', version: '0.1.0', packaged: false }), openOutputWindow: vi.fn(), closeOutputWindow: vi.fn(), setOutputFullscreen: vi.fn(), getSecureKeyStatus: vi.fn(), loadSecureKey: vi.fn(), saveSecureKey: vi.fn(), deleteSecureKey: vi.fn(), getVirtualCameraStatus: vi.fn(), startVirtualCamera: vi.fn(), stopVirtualCamera: vi.fn(), getUpdateStatus: vi.fn(), getDiagnostics: vi.fn() };
    await expect(getDesktopRuntimeStatus()).resolves.toMatchObject({ desktop: true, platform: 'win32' });
  });
});

