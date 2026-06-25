export type VirtualCameraRoute = 'native' | 'obs';
export interface VirtualCameraStatus { route: VirtualCameraRoute; available: boolean; installed: boolean; message: string; }
export interface NativeVirtualCameraAdapter {
  status(): Promise<VirtualCameraStatus>;
  start(options: { width: number; height: number; frameRate: number }): Promise<{ started: boolean; message: string }>;
  stop(): Promise<{ stopped: boolean }>;
}

export class VirtualCameraService {
  constructor(private readonly nativeAdapter?: NativeVirtualCameraAdapter) {}
  async routes(): Promise<VirtualCameraStatus[]> {
    const native = this.nativeAdapter ? await this.nativeAdapter.status() : { route: 'native' as const, available: false, installed: false, message: 'Native Eidos camera driver is not installed.' };
    return [native, { route: 'obs', available: true, installed: true, message: 'OBS Virtual Camera route is ready.' }];
  }
  async startNative(options: { width: number; height: number; frameRate: number }): Promise<{ started: boolean; message: string }> {
    if (!this.nativeAdapter) return { started: false, message: 'Native driver unavailable. Use OBS Virtual Camera.' };
    return this.nativeAdapter.start(options);
  }
}