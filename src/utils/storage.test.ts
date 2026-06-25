import { describe, expect, it } from 'vitest';
import { clearBehaviorProfile, loadBehaviorProfile, saveBehaviorProfile } from './storage';
import { defaultUserBehaviorProfile } from '../presence/UserBehaviorProfile';

describe('behavior profile persistence', () => {
  it('round-trips a trained profile through local storage', () => {
    const profile = { ...defaultUserBehaviorProfile, samples: 420, trainingSessionCount: 2, profileMaturity: 'learning' as const, qualityScore: 78 };
    saveBehaviorProfile(profile);
    expect(loadBehaviorProfile()).toMatchObject(profile);
    clearBehaviorProfile();
    expect(loadBehaviorProfile().profileMaturity).toBe('untrained');
  });
});
