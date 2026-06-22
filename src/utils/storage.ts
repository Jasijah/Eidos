import type { UserProfile } from '../types';

const PROFILE_KEY = 'eidos.user-profile.v1';

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
