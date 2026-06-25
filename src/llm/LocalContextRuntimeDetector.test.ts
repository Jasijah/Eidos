import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalContextRuntimeDetector } from './LocalContextRuntimeDetector';

describe('LocalContextRuntimeDetector', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('falls back cleanly when no runtime is listening', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(new LocalContextRuntimeDetector().detect()).resolves.toMatchObject({ available: false });
  });
  it('recognizes a local Qwen 3 4B model', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ models: [{ name: 'qwen3:4b' }] }) }));
    await expect(new LocalContextRuntimeDetector().detect()).resolves.toMatchObject({ available: true, model: 'qwen3:4b' });
  });
});