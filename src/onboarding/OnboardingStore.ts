export type MeetingType = 'team' | 'client' | 'creator' | 'comfort';
export interface OnboardingState { completed: boolean; step: number; meetingType?: MeetingType; startedAt?: string; completedAt?: string; }
const KEY = 'eidos.onboarding.v3';
export class OnboardingStore {
  constructor(private storage: Storage = window.localStorage) {}
  load(): OnboardingState { try { return { completed: false, step: 0, startedAt: new Date().toISOString(), ...JSON.parse(this.storage.getItem(KEY) ?? '{}') }; } catch { return { completed: false, step: 0, startedAt: new Date().toISOString() }; } }
  advance(step: number) { const next = { ...this.load(), step }; this.storage.setItem(KEY, JSON.stringify(next)); return next; }
  setMeetingType(meetingType: MeetingType) { const current = this.load(); const next = { ...current, meetingType, startedAt: current.startedAt ?? new Date().toISOString() }; this.storage.setItem(KEY, JSON.stringify(next)); return next; }
  complete() { const next = { ...this.load(), completed: true, step: 4, completedAt: new Date().toISOString() }; this.storage.setItem(KEY, JSON.stringify(next)); return next; }
  reset() { this.storage.removeItem(KEY); }
}
