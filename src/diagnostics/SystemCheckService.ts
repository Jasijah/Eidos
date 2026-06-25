export type CheckStatus = 'green' | 'yellow' | 'red';
export type SystemCheckId = 'camera' | 'microphone' | 'gpu' | 'mediapipe' | 'renderer' | 'virtual-camera' | 'obs' | 'storage' | 'encryption';
export interface SystemCheckResult { id: SystemCheckId; label: string; status: CheckStatus; message: string; }
export interface SystemCheckAdapters { mediaDevices?: MediaDevices; indexedDB?: IDBFactory; desktop?: Window['eidosDesktop']; createCanvas?: () => HTMLCanvasElement; mediaPipeStatus?: () => { mode: string }; }
export class SystemCheckService {
  constructor(private adapters: SystemCheckAdapters = {}) {}
  async run(): Promise<SystemCheckResult[]> {
    const media = this.adapters.mediaDevices ?? navigator.mediaDevices;
    const devices = media?.enumerateDevices ? await media.enumerateDevices().catch(() => []) : [] as MediaDeviceInfo[];
    const desktop = this.adapters.desktop ?? window.eidosDesktop;
    const diagnostics = desktop ? await desktop.getDiagnostics().catch(() => undefined) : undefined;
    const virtual = desktop ? await desktop.getVirtualCameraStatus().catch(() => undefined) : undefined;
    const canvas = this.adapters.createCanvas?.() ?? document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const tracker = this.adapters.mediaPipeStatus?.();
    const storage = await this.checkStorage(this.adapters.indexedDB ?? indexedDB);
    return [
      deviceResult('camera', 'Camera', devices, 'videoinput'), deviceResult('microphone', 'Microphone', devices, 'audioinput'),
      { id: 'gpu', label: 'GPU acceleration', status: gl ? 'green' : 'yellow', message: gl ? 'WebGL renderer available.' : 'WebGL unavailable; software fallback may be slow.' },
      { id: 'mediapipe', label: 'MediaPipe', status: tracker?.mode === 'mediapipe' ? 'green' : 'yellow', message: tracker?.mode === 'mediapipe' ? 'Face tracking model ready.' : 'Local fallback is active until MediaPipe initializes.' },
      { id: 'renderer', label: 'Avatar renderer', status: gl ? 'green' : 'red', message: gl ? 'Avatar canvas can render.' : 'No supported WebGL context was found.' },
      { id: 'virtual-camera', label: 'Virtual camera', status: virtual?.available ? 'green' : 'yellow', message: virtual?.message ?? 'OBS Virtual Camera is the supported beta route.' },
      { id: 'obs', label: 'OBS workflow', status: 'yellow', message: 'Open Eidos Output, add Window Capture in OBS, then start OBS Virtual Camera.' },
      { id: 'storage', label: 'Local storage', status: storage ? 'green' : 'red', message: storage ? 'Encrypted local records can be stored.' : 'IndexedDB is unavailable or blocked.' },
      { id: 'encryption', label: 'Encryption', status: diagnostics?.safeStorage.available ? 'green' : 'yellow', message: diagnostics?.safeStorage.available ? `${diagnostics.safeStorage.backend} key protection available.` : 'Browser encryption is available; OS key protection requires desktop Eidos.' }
    ];
  }
  private checkStorage(factory: IDBFactory): Promise<boolean> { return new Promise((resolve) => { try { const request = factory.open('eidos-system-check', 1); request.onupgradeneeded = () => request.result.createObjectStore('health'); request.onsuccess = () => { request.result.close(); resolve(true); }; request.onerror = () => resolve(false); } catch { resolve(false); } }); }
}
function deviceResult(id: 'camera' | 'microphone', label: string, devices: MediaDeviceInfo[], kind: MediaDeviceKind): SystemCheckResult { const present = devices.some((device) => device.kind === kind); return { id, label, status: present ? 'green' : 'yellow', message: present ? `${label} detected; permission is requested only when used.` : `No ${label.toLowerCase()} is currently visible to Eidos.` }; }
export function summarizeSystemChecks(results: SystemCheckResult[]): CheckStatus { return results.some((item) => item.status === 'red') ? 'red' : results.some((item) => item.status === 'yellow') ? 'yellow' : 'green'; }
