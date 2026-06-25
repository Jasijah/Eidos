import type { AvatarStyle } from '../types';
import type { AvatarIdentityModel } from './AvatarIdentityModel';
import type { AvatarIdentityProfile } from './AvatarIdentityProfile';

export interface AvatarAssetDescriptor {
  id: string;
  provider: 'procedural-three' | 'local-portrait' | 'ready-player-me' | 'vrm' | 'metahuman' | 'neural-talking-head';
  displayName: string;
  skinTone: string;
  hairTone: string;
  jacketTone: string;
  shirtTone: string;
  background: string;
  modelUrl?: string;
  portraitUrl?: string;
  supportsBlendshapes: boolean;
  supportsRiggedBody: boolean;
}

type AnyIdentity = AvatarIdentityModel | AvatarIdentityProfile;

const ASSETS: Record<AvatarStyle, AvatarAssetDescriptor> = {
  studio: { id: 'procedural-studio', provider: 'procedural-three', displayName: 'Studio human', skinTone: '#b98268', hairTone: '#211b19', jacketTone: '#24302f', shirtTone: '#e8eeeb', background: 'studio-office', supportsBlendshapes: true, supportsRiggedBody: true },
  warm: { id: 'procedural-warm', provider: 'procedural-three', displayName: 'Warm human', skinTone: '#a96f57', hairTone: '#2b1e1b', jacketTone: '#3a403d', shirtTone: '#efe3dc', background: 'warm-office', supportsBlendshapes: true, supportsRiggedBody: true },
  mono: { id: 'procedural-mono', provider: 'procedural-three', displayName: 'Neutral human', skinTone: '#a58e82', hairTone: '#171d1d', jacketTone: '#202929', shirtTone: '#e7e9e8', background: 'neutral-office', supportsBlendshapes: true, supportsRiggedBody: true },
  expressive: { id: 'procedural-expressive', provider: 'procedural-three', displayName: 'Creator human', skinTone: '#bd866a', hairTone: '#24282d', jacketTone: '#253942', shirtTone: '#e4efeb', background: 'creative-office', supportsBlendshapes: true, supportsRiggedBody: true }
};

export class AvatarAssetProvider {
  getAsset(style: AvatarStyle, identity?: AnyIdentity): AvatarAssetDescriptor {
    const base = ASSETS[style];
    if (!identity) return base;
    const beta = 'avatarId' in identity;
    return { ...base, id: beta ? identity.avatarId : identity.assetId, displayName: 'User identity-derived local avatar', provider: beta && identity.provider === 'local-portrait' ? 'local-portrait' : base.provider, portraitUrl: beta && identity.provider === 'local-portrait' ? identity.generatedAssetUrl : undefined, modelUrl: beta && identity.provider === 'vrm' ? identity.generatedAssetUrl : base.modelUrl, skinTone: identity.skinToneApproximation, hairTone: beta ? identity.hairApproximation.color : identity.hairColorApproximation };
  }

  createReadyPlayerMeAsset(modelUrl: string): AvatarAssetDescriptor { return { ...ASSETS.studio, id: modelUrl, provider: 'ready-player-me', displayName: 'Ready Player Me avatar', modelUrl }; }
  getProviderUpgradePath(): string[] { return ['Ready Player Me GLB rig', 'VRM humanoid rig', 'MetaHuman streaming renderer', 'Neural talking-head renderer']; }
}
