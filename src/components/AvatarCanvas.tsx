import { useEffect, useRef } from 'react';
import type { AvatarFrame, AvatarStyle } from '../types';
import type { RealismProfile } from '../avatar/RealismProfile';
import { resolveRealismProfile } from '../avatar/RealismProfile';
import { AvatarAssetProvider } from '../avatar/AvatarAssetProvider';
import type { AvatarIdentityProfile } from '../avatar/AvatarIdentityProfile';
import type { AvatarIdentityModel } from '../avatar/AvatarIdentityModel';
import type { RealisticRenderInput } from '../avatar/RealisticAvatarRenderer';
import type { OutputSettings } from '../output/OutputSettings';

const assetProvider = new AvatarAssetProvider();
interface MountedAvatarRenderer { mount(container: HTMLElement, asset: ReturnType<AvatarAssetProvider['getAsset']>): void; update(input: RealisticRenderInput): void; canvas(): HTMLCanvasElement; dispose(): void; }

interface AvatarCanvasProps { frame: AvatarFrame; style: AvatarStyle; label: string; realism: RealismProfile; identity?: AvatarIdentityProfile | AvatarIdentityModel; outputSettings?: OutputSettings; onCanvasReady?: (canvas: HTMLCanvasElement) => void; }

export function AvatarCanvas({ frame, style, label, realism, identity, outputSettings, onCanvasReady }: AvatarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<MountedAvatarRenderer | undefined>(undefined);
  const identityId = identity ? ('avatarId' in identity ? identity.avatarId : identity.id) : undefined;
  const useVrm = Boolean(identity && 'provider' in identity && identity.provider === 'vrm');
  const usePortrait = !identity || Boolean('provider' in identity && identity.provider === 'local-portrait');
  const backgroundKey = `${outputSettings?.background ?? 'professional-office'}:${outputSettings?.solidColor ?? ''}`;

  useEffect(() => {
    let active = true;
    const loadRenderer = usePortrait ? import('../avatar/PhotorealPortraitRenderer').then((module) => new module.PhotorealPortraitRenderer()) : useVrm ? import('../avatar/VRMAvatarRenderer').then((module) => new module.VRMAvatarRenderer()) : import('../avatar/RealisticAvatarRenderer').then((module) => new module.RealisticAvatarRenderer());
    void loadRenderer.then((renderer) => {
      if (!active || !containerRef.current) return;
      const base = assetProvider.getAsset(style, identity);
      const asset = { ...base, provider: useVrm ? 'vrm' as const : base.provider, modelUrl: useVrm && identity && 'generatedAssetUrl' in identity ? identity.generatedAssetUrl : base.modelUrl, background: outputSettings?.background === 'solid' ? outputSettings.solidColor : outputSettings?.background ?? 'professional-office' };
      renderer.mount(containerRef.current, asset);
      rendererRef.current = renderer;
      onCanvasReady?.(renderer.canvas());
    });
    return () => { active = false; rendererRef.current?.dispose(); rendererRef.current = undefined; };
  }, [style, identityId, backgroundKey, onCanvasReady, usePortrait, useVrm]);

  useEffect(() => { rendererRef.current?.update({ frame, asset: assetProvider.getAsset(style, identity), label, realism: resolveRealismProfile(realism, realism.lowEnergyMode ? 'low-energy' : 'professional') }); }, [frame, identity, label, realism, style]);
  return <div className="realistic-video-feed" style={{ aspectRatio: outputSettings?.aspect === '1:1' ? '1 / 1' : '16 / 9' }} aria-label={`${label} realistic avatar preview`}><div ref={containerRef} className="realistic-avatar-stage"><div className="renderer-loading">Preparing realistic avatar</div></div>{outputSettings?.disclosure !== false ? <div className="feed-disclosure"><span /> Avatar Mode Active</div> : null}</div>;
}
