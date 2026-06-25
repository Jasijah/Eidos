import type { ContextModelInput, ContextModelProvider } from './ContextModelProvider';
import { disabledContextState, type ContextLabel, type ContextState } from './ContextState';
import { LocalContextRuntimeDetector } from './LocalContextRuntimeDetector';

export class LocalQwenProvider implements ContextModelProvider {
  readonly id = 'local-qwen3-4b';
  readonly localOnly = true as const;
  readonly enabled: boolean;

  constructor(enabled = import.meta.env.VITE_EIDOS_CONTEXT_MODEL_ENABLED === 'true', private readonly detector = new LocalContextRuntimeDetector()) {
    this.enabled = enabled;
  }

  async getStatus(): Promise<{ available: boolean; message: string }> {
    if (!this.enabled) return { available: false, message: 'Disabled by VITE_EIDOS_CONTEXT_MODEL_ENABLED.' };
    const status = await this.detector.detect();
    return { available: status.available, message: status.message };
  }

  async infer(input: ContextModelInput): Promise<ContextState> {
    if (!this.enabled) return disabledContextState();
    // No private conversation text leaves the browser. Until a local runtime is connected,
    // deterministic speech-state labels provide a safe fallback.
    const label: ContextLabel = input.speechState === 'thinking' ? 'thinking' : input.speechState === 'listening' ? 'listening' : input.speechState === 'speaking' && input.audioEnergy > 0.2 ? 'presenting' : 'engaged';
    return { label, confidence: 0.45, source: 'fallback', updatedAt: Date.now(), reason: 'Local Qwen runtime unavailable; used deterministic local fallback.' };
  }
}
