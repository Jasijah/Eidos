import { indexedDB } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { SystemCheckService, summarizeSystemChecks } from './SystemCheckService';
describe('system check', () => { it('degrades unsupported integrations without crashing', async () => { const service = new SystemCheckService({ mediaDevices: { enumerateDevices: async () => [] } as unknown as MediaDevices, indexedDB, createCanvas: () => ({ getContext: () => null }) as unknown as HTMLCanvasElement, mediaPipeStatus: () => ({ mode: 'fallback' }) }); const results = await service.run(); expect(results).toHaveLength(9); expect(summarizeSystemChecks(results)).toBe('red'); expect(results.find((item) => item.id === 'mediapipe')?.status).toBe('yellow'); }); });

