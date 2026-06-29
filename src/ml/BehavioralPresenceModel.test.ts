import { describe, expect, it } from 'vitest';
import { BehavioralPresenceModel, blendWeights } from './BehavioralPresenceModel';
import { defaultUserBehaviorProfile } from '../presence/UserBehaviorProfile';

const input = { timestamp: 5000, speechState: 'listening' as const, audioEnergy: 0.04, presenceMode: 'professional' as const, userBehaviorProfile: { ...defaultUserBehaviorProfile, samples: 400, trainingSessionCount: 1, profileMaturity: 'learning' as const, qualityScore: 70 }, trainingMaturity: 'light-training' as const, lastBlinkTime: 2000, lastNodTime: 0, lastExpressionChange: 0 };

describe('BehavioralPresenceModel', () => {
  it('uses exact maturity blend weights', () => {
    expect(blendWeights('new-user')).toEqual({ universal: 0.9, user: 0.1 });
    expect(blendWeights('light-training')).toEqual({ universal: 0.7, user: 0.3 });
    expect(blendWeights('trained')).toEqual({ universal: 0.4, user: 0.6 });
  });

  it('generates guarded voice-only behavior without camera input', () => {
    const prediction = new BehavioralPresenceModel().predict(input);
    expect(prediction.signal.blinkLeft).toBeGreaterThanOrEqual(0);
    expect(prediction.naturalnessScore).toBeGreaterThan(0.5);
    expect(prediction.reasonCodes).toContain('ANTI_UNCANNY_CLAMP');
    expect(prediction.reasonCodes).not.toContain('CAMERA_FEATURE_BLEND');
  });
});
