import { describe, expect, it } from 'vitest';
import { BetaFeedbackStore } from './BetaFeedbackStore';

describe('BetaFeedbackStore', () => {
  it('exports ratings without local identifiers', () => {
    const storage = new Map<string, string>();
    const adapter = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => void storage.set(key, value), removeItem: (key: string) => void storage.delete(key) } as Storage;
    const store = new BetaFeedbackStore(adapter);
    store.save({ realism: 4, naturalness: 4, trust: 5, usefulness: 5, comfort: 4, willingnessToPay: 3 }, 'Useful');
    const exported = store.exportAnonymized();
    expect(exported).toContain('naturalness');
    expect(exported).not.toContain('sessionId');
    expect(exported).not.toContain('"id"');
  });
});