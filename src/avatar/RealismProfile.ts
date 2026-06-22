import type { PresenceMode } from '../types';

export type RealismLevel = 'standard' | 'professional' | 'high-realism';

export interface RealismProfile {
  level: RealismLevel;
  gestureIntensity: number;
  expressionIntensity: number;
  eyeContactStrength: number;
  lowEnergyMode: boolean;
  cameraTrainedBehavior: boolean;
}

export interface ResolvedRealismProfile extends RealismProfile {
  motionScale: number;
  expressionScale: number;
  blinkRatePerMinute: number;
  mouthRange: number;
  headRange: number;
  postureLift: number;
}

export const defaultRealismProfile: RealismProfile = {
  level: 'professional',
  gestureIntensity: 55,
  expressionIntensity: 48,
  eyeContactStrength: 62,
  lowEnergyMode: false,
  cameraTrainedBehavior: true
};

const LEVEL_PRESETS: Record<RealismLevel, Pick<ResolvedRealismProfile, 'motionScale' | 'expressionScale' | 'blinkRatePerMinute' | 'mouthRange' | 'headRange' | 'postureLift'>> = {
  standard: { motionScale: 0.78, expressionScale: 0.74, blinkRatePerMinute: 16, mouthRange: 0.48, headRange: 0.62, postureLift: 0.42 },
  professional: { motionScale: 0.58, expressionScale: 0.56, blinkRatePerMinute: 14, mouthRange: 0.42, headRange: 0.46, postureLift: 0.62 },
  'high-realism': { motionScale: 0.44, expressionScale: 0.48, blinkRatePerMinute: 13, mouthRange: 0.36, headRange: 0.38, postureLift: 0.72 }
};

export function resolveRealismProfile(profile: RealismProfile, mode: PresenceMode): ResolvedRealismProfile {
  const preset = LEVEL_PRESETS[profile.level];
  const lowEnergy = profile.lowEnergyMode || mode === 'low-energy';
  const gestureScalar = clamp(profile.gestureIntensity / 60, 0.2, 1.35);
  const expressionScalar = clamp(profile.expressionIntensity / 60, 0.18, 1.15);

  return {
    ...profile,
    motionScale: preset.motionScale * gestureScalar * (lowEnergy ? 0.58 : 1),
    expressionScale: preset.expressionScale * expressionScalar * (lowEnergy ? 0.62 : 1),
    blinkRatePerMinute: clamp(preset.blinkRatePerMinute * (lowEnergy ? 0.88 : 1), 10, 22),
    mouthRange: preset.mouthRange * (lowEnergy ? 0.82 : 1),
    headRange: preset.headRange * (lowEnergy ? 0.68 : 1),
    postureLift: preset.postureLift * (lowEnergy ? 0.7 : 1)
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}