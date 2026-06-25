import { describe, expect, it } from 'vitest';
import { FaceLandmarkExtractor } from './FaceLandmarkExtractor';

describe('MediaPipe extractor fallback', () => {
  it('converts MVP snapshots when MediaPipe is unavailable', () => {
    const features = new FaceLandmarkExtractor().extractFromMvpSnapshot({ headX: 0.2, headY: -0.1, headTilt: 0.08, nodding: false, blinking: true, smiling: true, confidence: 0.3, source: 'fallback' });
    expect(features.source).toBe('fallback');
    expect(features.blinkLeft).toBe(1);
    expect(features.smileIntensity).toBeGreaterThan(0.3);
    expect(features.confidence).toBe(0.3);
  });
});
