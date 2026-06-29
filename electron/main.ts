import { app, BrowserWindow, ipcMain, safeStorage, screen } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = Boolean(process.env.EIDOS_DEV_SERVER_URL);
let mainWindow: BrowserWindow | undefined;
let outputWindow: BrowserWindow | undefined;
let splashWindow: BrowserWindow | undefined;

export interface OutputWindowOptions { width: number; height: number; fullscreen: boolean; }
const secretPath = () => path.join(app.getPath('userData'), 'eidos-secure-key.bin');
const nativeDriverPath = () => process.env.EIDOS_VIRTUAL_CAMERA_DRIVER_PATH || path.join(process.resourcesPath, 'virtual-camera', process.platform === 'win32' ? 'eidos-virtual-camera.exe' : 'eidos-virtual-camera');

function applicationUrl(route = ''): string {
  if (isDev) return `${process.env.EIDOS_DEV_SERVER_URL}${route}`;
  const file = path.join(__dirname, '..', 'dist', 'index.html');
  return `file://${file}${route}`;
}
function secureKeyStatus() { return { available: safeStorage.isEncryptionAvailable(), backend: process.platform === 'darwin' ? 'Keychain' : process.platform === 'win32' ? 'DPAPI' : 'Secret Service' }; }
function loadProtectedKey(): string | undefined { if (!safeStorage.isEncryptionAvailable() || !fs.existsSync(secretPath())) return undefined; try { return safeStorage.decryptString(fs.readFileSync(secretPath())); } catch { return undefined; } }
function saveProtectedKey(value: string): boolean { if (!safeStorage.isEncryptionAvailable()) return false; fs.mkdirSync(path.dirname(secretPath()), { recursive: true }); fs.writeFileSync(secretPath(), safeStorage.encryptString(value), { mode: 0o600 }); return true; }
function deleteProtectedKey(): boolean { try { if (fs.existsSync(secretPath())) fs.unlinkSync(secretPath()); return !fs.existsSync(secretPath()); } catch { return false; } }

function createSplashWindow(): BrowserWindow {
  const window = new BrowserWindow({ width: 460, height: 320, frame: false, resizable: false, alwaysOnTop: true, backgroundColor: '#15201f', show: false });
  void window.loadFile(app.isPackaged ? path.join(process.resourcesPath, 'splash.html') : path.join(__dirname, '..', 'electron', 'splash.html'));
  window.once('ready-to-show', () => window.show());
  return window;
}
function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({ width: 1440, height: 940, minWidth: 1040, minHeight: 720, backgroundColor: '#f3f6f5', title: 'Eidos', show: false, icon: path.join(__dirname, '..', 'build', 'icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  window.once('ready-to-show', () => { splashWindow?.close(); splashWindow = undefined; window.show(); }); void window.loadURL(applicationUrl()); window.on('closed', () => { mainWindow = undefined; }); return window;
}
function openOutputWindow(options: OutputWindowOptions): BrowserWindow {
  if (outputWindow && !outputWindow.isDestroyed()) { outputWindow.setSize(options.width, options.height); outputWindow.setFullScreen(options.fullscreen); outputWindow.show(); outputWindow.focus(); return outputWindow; }
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  outputWindow = new BrowserWindow({ width: options.width, height: options.height, x: display.workArea.x + 24, y: display.workArea.y + 24, frame: false, resizable: true, backgroundColor: '#151d1b', title: 'Eidos Avatar Output', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  void outputWindow.loadURL(applicationUrl('?output=1')); outputWindow.setFullScreen(options.fullscreen); outputWindow.on('closed', () => { outputWindow = undefined; }); return outputWindow;
}

app.whenReady().then(() => {
  splashWindow = createSplashWindow();
  ipcMain.handle('eidos:desktop-info', () => ({ desktop: true, platform: process.platform, version: app.getVersion(), packaged: app.isPackaged }));
  ipcMain.handle('eidos:open-output', (_event, options: OutputWindowOptions) => { openOutputWindow(options); return { opened: true }; });
  ipcMain.handle('eidos:close-output', () => { outputWindow?.close(); return { closed: true }; });
  ipcMain.handle('eidos:set-output-fullscreen', (_event, fullscreen: boolean) => { outputWindow?.setFullScreen(fullscreen); return { fullscreen: outputWindow?.isFullScreen() ?? false }; });
  ipcMain.handle('eidos:secure-key-status', secureKeyStatus);
  ipcMain.handle('eidos:secure-key-load', () => loadProtectedKey());
  ipcMain.handle('eidos:secure-key-save', (_event, value: string) => ({ saved: saveProtectedKey(value) }));
  ipcMain.handle('eidos:secure-key-delete', () => ({ deleted: deleteProtectedKey() }));
  ipcMain.handle('eidos:virtual-camera-status', () => { const installed = fs.existsSync(nativeDriverPath()); return { route: 'native', available: installed, installed, message: installed ? 'Native Eidos virtual camera driver detected.' : 'Native driver not installed; OBS Virtual Camera remains available.' }; });
  ipcMain.handle('eidos:virtual-camera-start', () => ({ started: false, message: fs.existsSync(nativeDriverPath()) ? 'Driver detected, but frame transport requires the signed driver companion service.' : 'Native driver unavailable. Use OBS Virtual Camera.' }));
  ipcMain.handle('eidos:virtual-camera-stop', () => ({ stopped: true }));
  ipcMain.handle('eidos:update-status', () => ({ configured: app.isPackaged, channel: 'beta', automaticDownload: false, message: app.isPackaged ? 'Manual beta update checks are ready for a signed GitHub release feed.' : 'Update checks are disabled in development.' }));
  ipcMain.handle('eidos:diagnostics', () => ({ platform: process.platform, arch: process.arch, appVersion: app.getVersion(), electronVersion: process.versions.electron, chromeVersion: process.versions.chrome, packaged: app.isPackaged, safeStorage: secureKeyStatus(), nativeCameraDriver: fs.existsSync(nativeDriverPath()) }));
  mainWindow = createMainWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) mainWindow = createMainWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });