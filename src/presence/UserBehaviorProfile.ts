import type { GestureProfile, ProfileMaturity } from '../types';
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
  trainingSessionCount: number;
  profileMaturity: ProfileMaturity;
  qualityScore: number;
  updatedAt: string;
}

export interface BlendWeights {
  universal: number;
  user: number;
  depth: TrainingDepth;
}

export const defaultUserBehaviorProfile: UserBehaviorProfile = {
  blinkRate: 15,
  nodRate: 0.3,
  smileFrequency: 0.24,
  headMovementIntensity: 0.32,
  eyeContactPreference: 0.68,
  gestureEnergy: 0.35,
  postureStyle: 'upright',
  samples: 0,
  trainingSessionCount: 0,
  profileMaturity: 'untrained',
  qualityScore: 0,
  updatedAt: new Date(0).toISOString()
};

export function profileFromGestureMemory(profile: GestureProfile): UserBehaviorProfile {
  return {
    blinkRate: 15,
    nodRate: clamp(profile.nodFrequency, 0, 1),
    smileFrequency: clamp(profile.smileFrequency, 0, 1),
    headMovementIntensity: clamp(Math.abs(profile.headTilt) + profile.idleMovement, 0, 1),
    eyeContactPreference: 0.65,
    gestureEnergy: clamp(profile.idleMovement + profile.handGestureEvents * 0.02, 0, 1),
    postureStyle: profile.idleMovement < 0.12 ? 'upright' : 'relaxed',
    samples: profile.samples,
    trainingSessionCount: 0,
    profileMaturity: getMaturity(profile.samples, 0),
    qualityScore: Math.min(100, Math.round(profile.samples * 2.5)),
    updatedAt: profile.updatedAt
  };
}

export function getMaturity(samples: number, sessions: number): ProfileMaturity {
  if (sessions >= 3 || samples >= 900) return 'personalized';
  if (sessions >= 1 || samples >= 60) return 'learning';
  return 'untrained';
}

export function mergeTrainingSession(
  current: UserBehaviorProfile,
  session: Omit<UserBehaviorProfile, 'trainingSessionCount' | 'profileMaturity' | 'qualityScore' | 'updatedAt'>
): UserBehaviorProfile {
  const previousWeight = current.samples;
  const totalSamples = previousWeight + session.samples;
  const blend = (previous: number, next: number) =>
    totalSamples === 0 ? next : (previous * previousWeight + next * session.samples) / totalSamples;
  const trainingSessionCount = current.trainingSessionCount + 1;

  return {
    blinkRate: clamp(blend(current.blinkRate, session.blinkRate), 10, 22),
    nodRate: clamp(blend(current.nodRate, session.nodRate), 0, 0.68),
    smileFrequency: clamp(blend(current.smileFrequency, session.smileFrequency), 0, 0.62),
    headMovementIntensity: clamp(blend(current.headMovementIntensity, session.headMovementIntensity), 0.08, 0.72),
    eyeContactPreference: clamp(blend(current.eyeContactPreference, session.eyeContactPreference), 0.28, 0.9),
    gestureEnergy: clamp(blend(current.gestureEnergy, session.gestureEnergy), 0.05, 0.8),
    postureStyle: session.postureStyle,
    samples: totalSamples,
    trainingSessionCount,
    profileMaturity: getMaturity(totalSamples, trainingSessionCount),
    qualityScore: Math.min(100, Math.round(32 + trainingSessionCount * 18 + Math.min(32, totalSamples / 18))),
    updatedAt: new Date().toISOString()
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
