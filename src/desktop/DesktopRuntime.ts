export interface DesktopRuntimeStatus {
  desktop: boolean;
  platform: string;
  version: string;
}

export async function getDesktopRuntimeStatus(): Promise<DesktopRuntimeStatus> {
  if (!window.eidosDesktop) return { desktop: false, platform: 'browser', version: 'web' };
  return window.eidosDesktop.getInfo();
}
