import { describe, expect, it } from 'vitest';
import { emptyGestureProfile } from './GestureMemoryService';
import { PresenceModeService } from './PresenceModeService';

describe('PresenceModeService', () => {
  it('generates stronger animation for creator than low-energy mode', () => {
    const service = new PresenceModeService();
    const profile = {
      ...emptyGestureProfile(),
      nodFrequency: 0.8,
      smileFrequency: 0.8,
      headTilt: 0.4,
      idleMovement: 0.7,
      handGestureEvents: 3
    };

    const creator = service.computeBehavior('creator', profile, 4250);
    const lowEnergy = service.computeBehavior('low-energy', profile, 4250);

    expect(Math.abs(creator.headX)).toBeGreaterThan(Math.abs(lowEnergy.headX));
    expect(creator.smile).toBeGreaterThan(lowEnergy.smile);
    expect(Math.abs(creator.tilt)).toBeGreaterThan(Math.abs(lowEnergy.tilt));
  });

  it('recommends camera off after training is complete', () => {
    const service = new PresenceModeService();

    expect(service.shouldDisableCameraAfterTraining(true)).toBe(true);
    expect(service.shouldDisableCameraAfterTraining(false)).toBe(false);
  });
});
