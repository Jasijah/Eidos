import type { ConsentState } from './ConsentManager';

export interface BehaviorDataPolicy {
  profileStorage: 'session-only' | 'local-browser';
  modelImprovement: 'blocked' | 'opted-in-normalized-records-only';
  rawAudioStorage: 'never';
  rawVideoStorage: 'never';
  rawImageTraining: 'never';
}

export function resolveBehaviorDataPolicy(consent: ConsentState): BehaviorDataPolicy {
  return { profileStorage: consent.behaviorStorage ? 'local-browser' : 'session-only', modelImprovement: consent.modelImprovement ? 'opted-in-normalized-records-only' : 'blocked', rawAudioStorage: 'never', rawVideoStorage: 'never', rawImageTraining: 'never' };
}
