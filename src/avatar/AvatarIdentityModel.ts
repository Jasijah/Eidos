export type PhotorealAvatarProviderId = 'local-realistic' | 'local-portrait' | 'ready-player-me' | 'vrm' | 'external-photoreal';
export type AvatarRealismLevel = 'standard' | 'professional' | 'high-realism';

export interface AvatarSourceImage {
  id: string;
  name: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  dataUrl: string;
  storedLocally: boolean;
  role?: 'front' | 'left-profile' | 'right-profile' | 'smile';
  cropPosition?: number;
}

export interface AvatarIdentityModel {
  avatarId: string;
  displayName: string;
  sourceImages: AvatarSourceImage[];
  generatedAssetUrl: string;
  provider: PhotorealAvatarProviderId;
  realismLevel: AvatarRealismLevel;
  faceShapeApproximation: 'oval' | 'round' | 'angular' | 'unknown';
  skinToneApproximation: string;
  hairApproximation: { style: 'short' | 'medium' | 'long' | 'unknown'; color: string };
  consentStatus: {
    imageProcessing: true;
    localStorage: boolean;
    thirdPartyProcessing: boolean;
    modelImprovement: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const AVATAR_IDENTITY_MODEL_KEY = 'eidos.avatar-identity.beta.v1';

export function loadAvatarIdentityModel(storage: Storage = window.localStorage): AvatarIdentityModel | undefined {
  const raw = storage.getItem(AVATAR_IDENTITY_MODEL_KEY);
  if (!raw) return undefined;
  try { return JSON.parse(raw) as AvatarIdentityModel; } catch { return undefined; }
}

export function saveAvatarIdentityModel(model: AvatarIdentityModel, storage: Storage = window.localStorage): void {
  storage.setItem(AVATAR_IDENTITY_MODEL_KEY, JSON.stringify(model));
}

export function deleteAvatarIdentityModel(storage: Storage = window.localStorage): void {
  storage.removeItem(AVATAR_IDENTITY_MODEL_KEY);
}

