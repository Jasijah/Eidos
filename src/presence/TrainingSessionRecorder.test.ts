import { describe, expect, it } from 'vitest';
import { TrainingSessionRecorder } from './TrainingSessionRecorder';

const feature = (index: number) => ({ timestamp: index * 100, blinkLeft: index % 40 === 0 ? 1 : 0, blinkRight: index % 40 === 0 ? 1 : 0, jawOpen: 0.1, smileIntensity: index % 20 < 4 ? 0.4 : 0.1, browMovement: 0.12, gazeX: 0.02, gazeY: 0.01, headYaw: Math.sin(index / 10) * 0.08, headPitch: Math.sin(index / 8) * 0.08, headRoll: 0.03, expressionIntensity: 0.3, faceConfidence: 0.9, source: 'mediapipe' as const });

describe('TrainingSessionRecorder', () => {
  it('summarizes a camera session into a local behavior profile', () => {
    const recorder = new TrainingSessionRecorder();
    recorder.start(0);
    for (let index = 0; index < 600; index += 1) recorder.record(feature(index));
    const summary = recorder.summarize(60000);
    expect(summary.sampleCount).toBe(600);
    expect(summary.qualityScore).toBeGreaterThan(70);
    expect(summary.profile.samples).toBe(600);
    expect(summary.source).toBe('mediapipe');
  });
});
