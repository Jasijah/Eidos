import type { ConsentState } from './ConsentManager';

export interface AvatarDataPolicy {
  imageStorage: 'session-only' | 'local-browser';
  thirdPartyTransfer: 'blocked' | 'explicit-opt-in';
  modelImprovementUse: 'blocked';
  deletionScope: 'source-images-and-avatar-profile';
}

export function resolveAvatarDataPolicy(consent: ConsentState): AvatarDataPolicy {
  return { imageStorage: consent.localAvatarStorage ? 'local-browser' : 'session-only', thirdPartyTransfer: consent.thirdPartyAvatarProcessing && !consent.localOnlyMode ? 'explicit-opt-in' : 'blocked', modelImprovementUse: 'blocked', deletionScope: 'source-images-and-avatar-profile' };
}
