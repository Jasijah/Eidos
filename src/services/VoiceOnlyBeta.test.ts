import { describe, expect, it } from 'vitest';
import { AvatarAnimationService } from './AvatarAnimationService';
import { emptyGestureProfile } from './GestureMemoryService';
import { defaultRealismProfile } from '../avatar/RealismProfile';
import { defaultUserBehaviorProfile } from '../presence/UserBehaviorProfile';

const lipSync = { amplitude: 0.14, mouthOpen: 0.2, jawOpen: 0.18, viseme: 'soft' as const, plosive: false, latencyMs: 0 };

describe('voice-only presence without camera', () => {
  it('generates a guarded frame with no tracking input', () => {
    const frame = new AvatarAnimationService().composeFrame({ lipSync, gestureProfile: emptyGestureProfile(), mode: 'professional', voiceOnly: true, realism: defaultRealismProfile, userBehaviorProfile: { ...defaultUserBehaviorProfile, samples: 300, trainingSessionCount: 1, profileMaturity: 'learning', qualityScore: 70 }, now: 4200 });
    expect(frame.mouthOpen).toBeGreaterThan(0.03);
    expect(frame.breathing).toBeGreaterThan(0.1);
    expect(Math.abs(frame.headX)).toBeLessThan(0.3);
    expect(frame.eyeContact).toBeGreaterThan(0.18);
  });
});

