import type { GestureProfile } from '../types';
import { clamp } from '../avatar/RealismProfile';

export type TrainingDepth = 'new-user' | 'light-training' | 'repeated-use';
export type PostureStyle = 'upright' | 'relaxed' | 'low-energy';

export interface UserBehaviorProfile {
  blinkRate: number;
  nodRate: number;
  smileFrequency: number;
  headMovementIntensity: number;
  eyeContactPreference: number;
  gestureEnergy: number;
  postureStyle: PostureStyle;
  samples: number;
}

export interface BlendWeights {
  universal: number;
  user: number;
  depth: TrainingDepth;
}

export function profileFromGestureMemory(profile: GestureProfile): UserBehaviorProfile {
  return {
    blinkRate: 15,
    nodRate: clamp(profile.nodFrequency, 0, 1),
    smileFrequency: clamp(profile.smileFrequency, 0, 1),
    headMovementIntensity: clamp(Math.abs(profile.headTilt) + profile.idleMovement, 0, 1),
    eyeContactPreference: 0.65,
    gestureEnergy: clamp(profile.idleMovement + profile.handGestureEvents * 0.02, 0, 1),
    postureStyle: profile.idleMovement < 0.12 ? 'upright' : 'relaxed',
    samples: profile.samples
  };
}

export function getTrainingDepth(samples: number): TrainingDepth {
  if (samples >= 24) return 'repeated-use';
  if (samples >= 4) return 'light-training';
  return 'new-user';
}

export function getBlendWeights(samples: number): BlendWeights {
  const depth = getTrainingDepth(samples);
  if (depth === 'repeated-use') return { universal: 0.4, user: 0.6, depth };
  if (depth === 'light-training') return { universal: 0.7, user: 0.3, depth };
  return { universal: 0.9, user: 0.1, depth };
}

export function blendValue(universal: number, user: number, weights: BlendWeights): number {
  return universal * weights.universal + user * weights.user;
}