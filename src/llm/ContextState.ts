export type ContextLabel = 'professional' | 'casual' | 'engaged' | 'confused' | 'thinking' | 'listening' | 'presenting' | 'low-energy';

export interface ContextState {
  label: ContextLabel;
  confidence: number;
  source: 'disabled' | 'local-qwen' | 'fallback';
  updatedAt: number;
  reason: string;
}

export const disabledContextState = (): ContextState => ({ label: 'listening', confidence: 0, source: 'disabled', updatedAt: Date.now(), reason: 'Context model is disabled.' });
