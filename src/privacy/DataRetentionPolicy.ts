import type { UserTrainingConsent } from './UserTrainingConsent';

export interface DataRetentionPolicy {
  rawImages: 'discard-after-avatar-creation' | 'browser-local';
  avatarProfile: 'browser-local';
  behaviorProfile: 'discard-after-session' | 'browser-local';
  rawAudio: 'never-stored';
  rawVideo: 'never-stored';
  cloudUpload: 'disabled';
}

export function resolveDataRetentionPolicy(consent: UserTrainingConsent): DataRetentionPolicy {
  return {
    rawImages: consent.imageRetention === 'local-only' ? 'browser-local' : 'discard-after-avatar-creation',
    avatarProfile: 'browser-local',
    behaviorProfile: consent.behaviorRetention === 'local-only' ? 'browser-local' : 'discard-after-session',
    rawAudio: 'never-stored',
    rawVideo: 'never-stored',
    cloudUpload: 'disabled'
  };
}

export function exportRetentionSummary(consent: UserTrainingConsent): string {
  return JSON.stringify(resolveDataRetentionPolicy(consent), null, 2);
}
