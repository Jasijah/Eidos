import { describe, expect, it } from 'vitest';
import { LocalQwenProvider } from './LocalQwenProvider';
import { ContextToPresenceMapper } from './ContextToPresenceMapper';

describe('optional Qwen context hooks', () => {
  it('returns a disabled fallback when the feature is off', async () => {
    const provider = new LocalQwenProvider(false);
    const state = await provider.infer({ speechState: 'listening', audioEnergy: 0 });
    expect(state.source).toBe('disabled');
    expect((await provider.getStatus()).available).toBe(false);
  });

  it('maps context labels into high-level presence adjustments only', () => {
    const adjustment = new ContextToPresenceMapper().map({ label: 'presenting', confidence: 0.8, source: 'local-qwen', updatedAt: 1, reason: 'local' });
    expect(adjustment.suggestedMode).toBe('creator');
    expect(adjustment.reasonCode).toBe('CONTEXT_LABEL_MAPPED');
  });
});
