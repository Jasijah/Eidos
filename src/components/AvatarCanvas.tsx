import { useMemo } from 'react';
import type { AvatarFrame, AvatarStyle } from '../types';
import type { RealismProfile } from '../avatar/RealismProfile';
import { resolveRealismProfile } from '../avatar/RealismProfile';
import { AvatarAssetProvider } from '../avatar/AvatarAssetProvider';
import { RealisticAvatarRenderer } from '../avatar/RealisticAvatarRenderer';

const assetProvider = new AvatarAssetProvider();
const renderer = new RealisticAvatarRenderer();

interface AvatarCanvasProps {
  frame: AvatarFrame;
  style: AvatarStyle;
  label: string;
  realism: RealismProfile;
}

export function AvatarCanvas({ frame, style, label, realism }: AvatarCanvasProps) {
  const markup = useMemo(() => {
    const asset = assetProvider.getAsset(style);
    return renderer.renderSvg({
      frame,
      style,
      label,
      asset,
      realism: resolveRealismProfile(realism, realism.lowEnergyMode ? 'low-energy' : 'professional')
    });
  }, [frame, label, realism, style]);

  return (
    <div className="realistic-video-feed" aria-label={`${label} realistic avatar preview`}>
      <div className="feed-rec-indicator">Visual stand-in</div>
      <div className="realistic-avatar-stage" dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}