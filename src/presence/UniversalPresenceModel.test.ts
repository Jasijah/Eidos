import { describe, expect, it } from 'vitest';
import { UniversalPresenceModel } from './UniversalPresenceModel';
import { getBlendWeights, type UserBehaviorProfile } from './UserBehaviorProfile';

const lipSync = { amplitude: 0.02, jawOpen: 0.03 };
const model = new UniversalPresenceModel();

function sampleProfile(samples: number): UserBehaviorProfile {
  return {
    blinkRate: 18,
    nodRate: 0.8,
    smileFrequency: 0.8,
    headMovementIntensity: 0.8,
    eyeContactPreference: 0.8,
    gestureEnergy: 0.8,
    postureStyle: 'relaxed',
    trainingSessionCount: 1,
    profileMaturity: 'learning',
    qualityScore: 60,
    updatedAt: new Date(0).toISOString(),
    samples
  };
}

describe('UniversalPresenceModel', () => {
  it('keeps blink intervals in a safe human range', () => {
    const signals = Array.from({ length: 120 }, (_, index) => model.generate({ timestamp: index * 500, mode: 'professional', state: 'listening', lipSync }));
    const blinks = signals.filter((signal) => signal.blinkLeft > 0.5).length;

    expect(blinks).toBeGreaterThan(4);
    expect(blinks).toBeLessThan(18);
  });

  it('limits nod frequency during listening', () => {
    const signal = model.generate({ timestamp: 2600, mode: 'casual', state: 'listening', lipSync, userProfile: sampleProfile(30) });

    expect(signal.nodIntensity).toBeGreaterThanOrEqual(0);
    expect(signal.nodIntensity).toBeLessThanOrEqual(0.68);
  });

  it('reduces movement in low-energy mode', () => {
    const professional = model.generate({ timestamp: 8200, mode: 'professional', state: 'idle', lipSync, userProfile: sampleProfile(30) });
    const lowEnergy = model.generate({ timestamp: 8200, mode: 'low-energy', state: 'idle', lipSync, userProfile: sampleProfile(30) });

    const professionalMovement = Math.abs(professional.headYaw) + Math.abs(professional.headPitch) + Math.abs(professional.shoulderShift);
    const lowEnergyMovement = Math.abs(lowEnergy.headYaw) + Math.abs(lowEnergy.headPitch) + Math.abs(lowEnergy.shoulderShift);
    expect(lowEnergyMovement).toBeLessThan(professionalMovement);
  });

  it('increases expression in creator mode', () => {
    const professional = model.generate({ timestamp: 6200, mode: 'professional', state: 'speaking', lipSync: { amplitude: 0.2, jawOpen: 0.16 } });
    const creator = model.generate({ timestamp: 6200, mode: 'creator', state: 'speaking', lipSync: { amplitude: 0.2, jawOpen: 0.16 } });

    expect(creator.smileIntensity).toBeGreaterThan(professional.smileIntensity);
  });

  it('uses the requested profile blending weights', () => {
    expect(getBlendWeights(0)).toEqual({ universal: 0.9, user: 0.1, depth: 'new-user' });
    expect(getBlendWeights(4)).toEqual({ universal: 0.7, user: 0.3, depth: 'light-training' });
    expect(getBlendWeights(24)).toEqual({ universal: 0.4, user: 0.6, depth: 'repeated-use' });
  });

  it('does not output a frozen face while idle', () => {
    const signal = model.generate({ timestamp: 9800, mode: 'professional', state: 'idle', lipSync });

    expect(signal.breathingMotion).toBeGreaterThan(0.12);
    expect(signal.smileIntensity).toBeGreaterThan(0.04);
    expect(Math.abs(signal.gazeY) + Math.abs(signal.headYaw) + signal.breathingMotion).toBeGreaterThan(0.15);
  });
});
