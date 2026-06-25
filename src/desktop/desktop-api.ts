import type { VirtualCameraStatus } from '../virtual-camera/VirtualCameraService';
export interface DesktopDiagnostics { platform:string;arch:string;appVersion:string;electronVersion:string;chromeVersion:string;packaged:boolean;safeStorage:{available:boolean;backend:string};nativeCameraDriver:boolean; }
export interface EidosDesktopBridge {
  getInfo(): Promise<{ desktop: true; platform: string; version: string; packaged:boolean }>;
  openOutputWindow(options: { width: number; height: number; fullscreen: boolean }): Promise<{ opened: boolean }>;
  closeOutputWindow(): Promise<{ closed: boolean }>; setOutputFullscreen(fullscreen: boolean): Promise<{ fullscreen: boolean }>;
  getSecureKeyStatus():Promise<{available:boolean;backend:string}>; loadSecureKey():Promise<string|undefined>; saveSecureKey(value:string):Promise<{saved:boolean}>; deleteSecureKey():Promise<{deleted:boolean}>;
  getVirtualCameraStatus():Promise<VirtualCameraStatus>; startVirtualCamera(options:{width:number;height:number;frameRate:number}):Promise<{started:boolean;message:string}>; stopVirtualCamera():Promise<{stopped:boolean}>;
  getUpdateStatus():Promise<{configured:boolean;channel:string;automaticDownload:boolean;message:string}>;
  getDiagnostics():Promise<DesktopDiagnostics>;
}
declare global { interface Window { eidosDesktop?: EidosDesktopBridge; } }
export {};