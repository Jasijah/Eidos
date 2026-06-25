import type { UserProfile } from '../types';
import { defaultUserBehaviorProfile, type UserBehaviorProfile } from '../presence/UserBehaviorProfile';

const PROFILE_KEY = 'eidos.user-profile.v1';
const BEHAVIOR_PROFILE_KEY = 'eidos.behavior-profile.v2';

export const defaultProfile: UserProfile = {
  name: 'Mina Chen',
  role: 'Product lead',
  avatarStyle: 'studio',
  trainingComplete: false
};

export function loadProfile(): UserProfile {
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return defaultProfile;
  try {
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: UserProfile): void {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadBehaviorProfile(storage: Storage = window.localStorage): UserBehaviorProfile {
  const raw = storage.getItem(BEHAVIOR_PROFILE_KEY);
  if (!raw) return { ...defaultUserBehaviorProfile };
  try {
    return { ...defaultUserBehaviorProfile, ...JSON.parse(raw) };
  } catch {
    return { ...defaultUserBehaviorProfile };
  }
}

export function saveBehaviorProfile(profile: UserBehaviorProfile, storage: Storage = window.localStorage): void {
  storage.setItem(BEHAVIOR_PROFILE_KEY, JSON.stringify(profile));
}

export function clearBehaviorProfile(storage: Storage = window.localStorage): UserBehaviorProfile {
  storage.removeItem(BEHAVIOR_PROFILE_KEY);
  return { ...defaultUserBehaviorProfile };
}
