import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('eidosDesktop', {
  getInfo: () => ipcRenderer.invoke('eidos:desktop-info'),
  openOutputWindow: (options: { width: number; height: number; fullscreen: boolean }) => ipcRenderer.invoke('eidos:open-output', options),
  closeOutputWindow: () => ipcRenderer.invoke('eidos:close-output'), setOutputFullscreen: (fullscreen: boolean) => ipcRenderer.invoke('eidos:set-output-fullscreen', fullscreen),
  getSecureKeyStatus: () => ipcRenderer.invoke('eidos:secure-key-status'), loadSecureKey: () => ipcRenderer.invoke('eidos:secure-key-load'), saveSecureKey: (value: string) => ipcRenderer.invoke('eidos:secure-key-save', value), deleteSecureKey: () => ipcRenderer.invoke('eidos:secure-key-delete'),
  getVirtualCameraStatus: () => ipcRenderer.invoke('eidos:virtual-camera-status'), startVirtualCamera: (options: {width:number;height:number;frameRate:number}) => ipcRenderer.invoke('eidos:virtual-camera-start', options), stopVirtualCamera: () => ipcRenderer.invoke('eidos:virtual-camera-stop'),
  getUpdateStatus: () => ipcRenderer.invoke('eidos:update-status'),
  getDiagnostics: () => ipcRenderer.invoke('eidos:diagnostics')
});