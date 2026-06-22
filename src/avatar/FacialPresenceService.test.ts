import { describe, expect, it } from 'vitest';
import { emptyGestureProfile } from '../services/GestureMemoryService';
import { defaultRealismProfile, resolveRealismProfile } from './RealismProfile';
import { FacialPresenceService } from './FacialPresenceService';
import { UncannyValleyGuard } from './UncannyValleyGuard';
import type { AvatarFrame } from '../types';

describe('FacialPresenceService', () => {
  it('keeps blink frequency in a human video-call range', () => {
    const service = new FacialPresenceService();
    const realism = resolveRealismProfile(defaultRealismProfile, 'professional');

    expect(service.getBlinkRatePerMinute(realism, 'professional')).toBeGreaterThanOrEqual(10);
    expect(service.getBlinkRatePerMinute(realism, 'professional')).toBeLessThanOrEqual(22);
  });
});

describe('UncannyValleyGuard', () => {
  it('limits gesture intensity and facial extremes', () => {
    const guard = new UncannyValleyGuard();
    const realism = resolveRealismProfile({ ...defaultRealismProfile, gestureIntensity: 100 }, 'creator');
    const constrainedProfile = guard.constrainGestureProfile({ ...emptyGestureProfile(), nodFrequency: 5, smileFrequency: 4, headTilt: 2, idleMovement: 2, handGestureEvents: 99 }, 100);
    const frame: AvatarFrame = {
      mouthOpen: 1,
      headX: 3,
      headY: -3,
      blink: false,
      smile: 1,
      tilt: 3,
      idle: 2,
      handGesture: true,
      brow: 2,
      eyeSquint: 2,
      eyeContact: 2,
      shoulderShift: 3,
      posture: 2
    };
    const constrainedFrame = guard.constrainFrame(frame, realism);

    expect(constrainedProfile.nodFrequency).toBeLessThanOrEqual(0.72);
    expect(constrainedProfile.idleMovement).toBeLessThanOrEqual(0.38);
    expect(constrainedFrame.mouthOpen).toBeLessThanOrEqual(realism.mouthRange);
    expect(constrainedFrame.smile).toBeLessThan(0.6);
    expect(constrainedFrame.eyeContact).toBeLessThanOrEqual(0.92);
  });
});