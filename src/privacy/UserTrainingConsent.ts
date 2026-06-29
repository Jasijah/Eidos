export type ImageRetentionChoice = 'do-not-save' | 'local-only';
export type BehaviorRetentionChoice = 'do-not-save' | 'local-only';

export interface UserTrainingConsent {
  avatarCreationConsent: boolean;
  imageRetention: ImageRetentionChoice;
  behaviorRetention: BehaviorRetentionChoice;
  improveEidosModels: boolean;
  rawMediaCloudUpload: false;
  updatedAt: string;
}

export const USER_TRAINING_CONSENT_KEY = 'eidos.training-consent.v1';

export const defaultUserTrainingConsent: UserTrainingConsent = {
  avatarCreationConsent: false,
  imageRetention: 'local-only',
  behaviorRetention: 'local-only',
  improveEidosModels: false,
  rawMediaCloudUpload: false,
  updatedAt: new Date(0).toISOString()
};

export function loadUserTrainingConsent(storage: Storage = window.localStorage): UserTrainingConsent {
  const raw = storage.getItem(USER_TRAINING_CONSENT_KEY);
  if (!raw) return { ...defaultUserTrainingConsent };
  try { return { ...defaultUserTrainingConsent, ...JSON.parse(raw), rawMediaCloudUpload: false }; } catch { return { ...defaultUserTrainingConsent }; }
}

export function saveUserTrainingConsent(consent: UserTrainingConsent, storage: Storage = window.localStorage): void {
  storage.setItem(USER_TRAINING_CONSENT_KEY, JSON.stringify({ ...consent, rawMediaCloudUpload: false, updatedAt: new Date().toISOString() }));
}

export function canContributeToModelImprovement(consent: UserTrainingConsent): boolean {
  return consent.improveEidosModels === true;
}
