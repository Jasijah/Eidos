import { describe, expect, it } from 'vitest';
import { AudioLipSyncService } from './AudioLipSyncService';

describe('AudioLipSyncService realism primitives', () => {
  it('maps amplitude into restrained mouth movement and visemes', () => {
    const quiet = AudioLipSyncService.frameFromAmplitude(0.02, AudioLipSyncService.mapViseme(0.02, false), 80);
    const speaking = AudioLipSyncService.frameFromAmplitude(0.24, AudioLipSyncService.mapViseme(0.24, false), 80);

    expect(quiet.viseme).toBe('rest');
    expect(speaking.viseme).toBe('wide');
    expect(speaking.mouthOpen).toBeGreaterThan(quiet.mouthOpen);
    expect(speaking.mouthOpen).toBeLessThanOrEqual(0.46);
  });

  it('detects plosive placeholders from sudden amplitude changes', () => {
    expect(AudioLipSyncService.detectPlosive(0.28, 0.06)).toBe(true);
    expect(AudioLipSyncService.detectPlosive(0.16, 0.12)).toBe(false);
  });
});