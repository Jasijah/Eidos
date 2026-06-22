import { describe, expect, it } from 'vitest';
import { emptyGestureProfile } from './GestureMemoryService';
import { PresenceModeService } from './PresenceModeService';
import { defaultRealismProfile, resolveRealismProfile } from '../avatar/RealismProfile';

describe('PresenceModeService voice-only realism', () => {
  it('generates restrained nonverbal behavior from saved gesture memory', () => {
    const service = new PresenceModeService();
    const realism = resolveRealismProfile(defaultRealismProfile, 'professional');
    const profile = { ...emptyGestureProfile(), nodFrequency: 0.45, headTilt: 0.22, idleMovement: 0.28, samples: 12 };
    const behavior = service.computeBehavior('professional', profile, 12500, realism);

    expect(Math.abs(behavior.headX)).toBeLessThan(0.12);
    expect(Math.abs(behavior.tilt)).toBeLessThan(0.12);
    expect(behavior.posture).toBeGreaterThan(0.2);
    expect(behavior.idle).toBeGreaterThan(0.02);
  });
});