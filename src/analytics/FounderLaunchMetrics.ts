import type { AnalyticsEvent } from './AnalyticsService';
import type { PresenceSessionRecord } from './SessionTracker';
export interface FounderLaunchMetrics { dailyActiveUsers: number; weeklyActiveUsers: number; retentionPercent: number; inviteConversionPercent: number; feedbackCompletionPercent: number; averageOnboardingMinutes: number; averageInstallationMinutes: number; presenceQualityTrend: number[]; }
export function calculateFounderLaunchMetrics(events: AnalyticsEvent[], sessions: PresenceSessionRecord[], inviteSent: number, inviteAccepted: number, feedbackCount: number, onboarding?: { startedAt?: string; completedAt?: string }): FounderLaunchMetrics {
  const now = Date.now(); const recent = (days: number) => sessions.filter((item) => now - new Date(item.startedAt).getTime() <= days * 86400000);
  const uniqueDays = new Set(sessions.map((item) => item.startedAt.slice(0, 10))).size;
  const install = events.find((item) => item.name === 'App Installed' || item.name === 'First Launch'); const account = events.find((item) => item.name === 'Account Created');
  const minutes = (start?: string, end?: string) => start && end ? Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 60000) : 0;
  return { dailyActiveUsers: recent(1).length ? 1 : 0, weeklyActiveUsers: recent(7).length ? 1 : 0, retentionPercent: uniqueDays > 1 ? 100 : sessions.length > 1 ? 50 : 0, inviteConversionPercent: inviteSent ? inviteAccepted / inviteSent * 100 : 0, feedbackCompletionPercent: sessions.length ? Math.min(100, feedbackCount / sessions.length * 100) : 0, averageOnboardingMinutes: minutes(onboarding?.startedAt, onboarding?.completedAt), averageInstallationMinutes: minutes(install?.timestamp, account?.timestamp), presenceQualityTrend: sessions.slice(-8).map((item) => Math.round(item.averagePresenceQuality)) };
}
