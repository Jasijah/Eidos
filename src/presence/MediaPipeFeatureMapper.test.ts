import { describe, expect, it } from 'vitest';
import { MediaPipeFeatureMapper } from './MediaPipeFeatureMapper';

describe('MediaPipeFeatureMapper fallback', () => {
  it('maps fallback tracking into the full beta feature contract', () => {
    const result = new MediaPipeFeatureMapper().mapFallback({ headX: 0.2, headY: -0.1, headTilt: 0.05, nodding: false, blinking: true, smiling: true, confidence: 0.35, source: 'fallback' }, 1000);
    expect(result.source).toBe('fallback');
    expect(result.blinkLeft).toBe(1);
    expect(result.jawOpen).toBeGreaterThan(0);
    expect(result.smileIntensity).toBeGreaterThan(0.3);
    expect(result.faceConfidence).toBe(0.35);
  });
});
