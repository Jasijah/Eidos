import type { PresenceMode } from '../types';

export type UniversalPresenceMode = 'Professional' | 'Casual' | 'Creator' | 'LowEnergy';

export interface ModeProfile {
  mode: UniversalPresenceMode;
  gestureFrequency: number;
  expressionIntensity: number;
  eyeContact: number;
  nodding: number;
  idleMovement: number;
  blinkRate: number;
  postureLift: number;
}

export const MODE_PROFILES: Record<UniversalPresenceMode, ModeProfile> = {
  Professional: {
    mode: 'Professional',
    gestureFrequency: 0.36,
    expressionIntensity: 0.42,
    eyeContact: 0.72,
    nodding: 0.36,
    idleMovement: 0.34,
    blinkRate: 15,
    postureLift: 0.68
  },
  Casual: {
    mode: 'Casual',
    gestureFrequency: 0.52,
    expressionIntensity: 0.58,
    eyeContact: 0.62,
    nodding: 0.52,
    idleMovement: 0.5,
    blinkRate: 16,
    postureLift: 0.56
  },
  Creator: {
    mode: 'Creator',
    gestureFrequency: 0.68,
    expressionIntensity: 0.76,
    eyeContact: 0.66,
    nodding: 0.62,
    idleMovement: 0.62,
    blinkRate: 17,
    postureLift: 0.62
  },
  LowEnergy: {
    mode: 'LowEnergy',
    gestureFrequency: 0.18,
    expressionIntensity: 0.24,
    eyeContact: 0.54,
    nodding: 0.2,
    idleMovement: 0.18,
    blinkRate: 13,
    postureLift: 0.38
  }
};

export function toUniversalPresenceMode(mode: PresenceMode): UniversalPresenceMode {
  if (mode === 'casual') return 'Casual';
  if (mode === 'creator') return 'Creator';
  if (mode === 'low-energy') return 'LowEnergy';
  return 'Professional';
}