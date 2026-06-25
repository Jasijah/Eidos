export type FeedbackMetric = 'realism' | 'naturalness' | 'trust' | 'usefulness' | 'comfort' | 'willingnessToPay';
export type FeedbackScores = Record<FeedbackMetric, number>;
export interface BetaFeedbackRecord { id: string; sessionId: string; scores: FeedbackScores; notes: string; createdAt: string; }
const KEY = 'eidos.beta-feedback.v1';

export class BetaFeedbackStore {
  constructor(private readonly storage: Storage = window.localStorage) {}
  list(): BetaFeedbackRecord[] { try { return JSON.parse(this.storage.getItem(KEY) ?? '[]') as BetaFeedbackRecord[]; } catch { return []; } }
  save(scores: FeedbackScores, notes = ''): BetaFeedbackRecord {
    const record = { id: crypto.randomUUID(), sessionId: crypto.randomUUID(), scores, notes: notes.slice(0, 1000), createdAt: new Date().toISOString() };
    this.storage.setItem(KEY, JSON.stringify([...this.list(), record])); return record;
  }
  clear(): void { this.storage.removeItem(KEY); }
  exportAnonymized(): string { return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), records: this.list().map(({ scores, notes, createdAt }) => ({ scores, notes, createdAt })) }, null, 2); }
}