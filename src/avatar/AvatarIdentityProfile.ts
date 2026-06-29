export type AvatarRealismPreference = 'standard' | 'professional' | 'high-realism';

export interface AvatarIdentityProfile {
  id: string;
  faceReferenceImage: string;
  sourceImageCount: number;
  skinToneApproximation: string;
  hairStyleApproximation: 'short' | 'medium' | 'long' | 'unknown';
  hairColorApproximation: string;
  facialStructure: {
    faceShape: 'oval' | 'round' | 'angular' | 'unknown';
    jawWidth: number;
    cheekboneProminence: number;
  };
  avatarRealismPreference: AvatarRealismPreference;
  providerId: string;
  assetId: string;
  createdTimestamp: string;
  consentStatus: {
    avatarCreation: true;
    localStorage: boolean;
    publicModelTraining: boolean;
  };
}

export const AVATAR_IDENTITY_STORAGE_KEY = 'eidos.avatar-identity.v1';

export function loadAvatarIdentity(storage: Storage = window.localStorage): AvatarIdentityProfile | undefined {
  const raw = storage.getItem(AVATAR_IDENTITY_STORAGE_KEY);
  if (!raw) return undefined;
  try { return JSON.parse(raw) as AvatarIdentityProfile; } catch { return undefined; }
}

export function saveAvatarIdentity(profile: AvatarIdentityProfile, storage: Storage = window.localStorage): void {
  storage.setItem(AVATAR_IDENTITY_STORAGE_KEY, JSON.stringify(profile));
}

export function deleteAvatarIdentity(storage: Storage = window.localStorage): void {
  storage.removeItem(AVATAR_IDENTITY_STORAGE_KEY);
}
