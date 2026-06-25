export type OutputAspect = '16:9' | '1:1';
export type OutputResolution = '720p' | '1080p' | 'square';
export type OutputFrameRate = 24 | 30 | 60;
export type OutputBackground = 'professional-office' | 'studio' | 'blur' | 'solid';

export interface OutputSettings {
  aspect: OutputAspect;
  resolution: OutputResolution;
  frameRate: OutputFrameRate;
  background: OutputBackground;
  solidColor: string;
  disclosure: boolean;
  fullscreen: boolean;
}

export const OUTPUT_SETTINGS_KEY = 'eidos.output-settings.v1';
export const defaultOutputSettings: OutputSettings = { aspect: '16:9', resolution: '720p', frameRate: 30, background: 'professional-office', solidColor: '#d8e1de', disclosure: true, fullscreen: false };

export function dimensionsFor(settings: OutputSettings): { width: number; height: number } {
  if (settings.resolution === '1080p') return { width: 1920, height: 1080 };
  if (settings.resolution === 'square') return { width: 1080, height: 1080 };
  return { width: 1280, height: 720 };
}

export function loadOutputSettings(storage: Storage = window.localStorage): OutputSettings {
  const raw = storage.getItem(OUTPUT_SETTINGS_KEY);
  if (!raw) return { ...defaultOutputSettings };
  try { return { ...defaultOutputSettings, ...JSON.parse(raw) }; } catch { return { ...defaultOutputSettings }; }
}

export function saveOutputSettings(settings: OutputSettings, storage: Storage = window.localStorage): void {
  storage.setItem(OUTPUT_SETTINGS_KEY, JSON.stringify(settings));
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('eidos-output-settings');
    channel.postMessage(settings);
    channel.close();
  }
}
