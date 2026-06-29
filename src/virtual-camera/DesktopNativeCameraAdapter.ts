import type { NativeVirtualCameraAdapter, VirtualCameraStatus } from './VirtualCameraService';
export class DesktopNativeCameraAdapter implements NativeVirtualCameraAdapter {
  async status(): Promise<VirtualCameraStatus> {
    if (!window.eidosDesktop) return { route: 'native', available: false, installed: false, message: 'Desktop runtime required.' };
    return window.eidosDesktop.getVirtualCameraStatus();
  }
  start(options: { width: number; height: number; frameRate: number }): Promise<{ started: boolean; message: string }> { return window.eidosDesktop!.startVirtualCamera(options); }
  stop(): Promise<{ stopped: boolean }> { return window.eidosDesktop!.stopVirtualCamera(); }
}