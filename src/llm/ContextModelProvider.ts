import type { ContextState } from './ContextState';

export interface ContextModelInput {
  localTranscript?: string;
  speechState: 'speaking' | 'listening' | 'idle' | 'thinking';
  audioEnergy: number;
}

export interface ContextModelProvider {
  readonly id: string;
  readonly enabled: boolean;
  readonly localOnly: true;
  getStatus(): Promise<{ available: boolean; message: string }>;
  infer(input: ContextModelInput): Promise<ContextState>;
}
