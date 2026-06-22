import type { AvatarStyle } from '../types';

export interface AvatarAssetDescriptor {
  id: string;
  provider: 'local-placeholder' | 'ready-player-me' | 'metahuman' | 'live2d' | 'neural-talking-head';
  displayName: string;
  skinTone: string;
  hairTone: string;
  jacketTone: string;
  shirtTone: string;
  background: string;
  supportsBlendshapes: boolean;
  supportsRiggedBody: boolean;
}

const LOCAL_PLACEHOLDERS: Record<AvatarStyle, AvatarAssetDescriptor> = {
  studio: {
    id: 'local-realistic-studio',
    provider: 'local-placeholder',
    displayName: 'Studio realistic placeholder',
    skinTone: '#c98f72',
    hairTone: '#2f2522',
    jacketTone: '#24302f',
    shirtTone: '#f2f6f4',
    background: 'studio-office',
    supportsBlendshapes: true,
    supportsRiggedBody: false
  },
  warm: {
    id: 'local-realistic-warm',
    provider: 'local-placeholder',
    displayName: 'Warm realistic placeholder',
    skinTone: '#b8795f',
    hairTone: '#35231f',
    jacketTone: '#39413e',
    shirtTone: '#fff4ed',
    background: 'warm-office',
    supportsBlendshapes: true,
    supportsRiggedBody: false
  },
  mono: {
    id: 'local-realistic-mono',
    provider: 'local-placeholder',
    displayName: 'Neutral realistic placeholder',
    skinTone: '#b9a193',
    hairTone: '#1d2323',
    jacketTone: '#1f2a2a',
    shirtTone: '#f3f4f3',
    background: 'neutral-office',
    supportsBlendshapes: true,
    supportsRiggedBody: false
  },
  expressive: {
    id: 'local-realistic-expressive',
    provider: 'local-placeholder',
    displayName: 'Expressive realistic placeholder',
    skinTone: '#d09a7b',
    hairTone: '#2a2f35',
    jacketTone: '#263a43',
    shirtTone: '#eef7f4',
    background: 'creative-office',
    supportsBlendshapes: true,
    supportsRiggedBody: false
  }
};

export class AvatarAssetProvider {
  getAsset(style: AvatarStyle): AvatarAssetDescriptor {
    return LOCAL_PLACEHOLDERS[style];
  }

  getProviderUpgradePath(): string[] {
    return ['Ready Player Me-style rigged avatar', 'MetaHuman-style high fidelity rig', 'Live2D/3D blendshape model', 'Neural talking-head renderer'];
  }
}