import { describe, expect, it } from 'vitest';
import { TrainingDataRecorder } from './TrainingDataRecorder';
import { defaultUserBehaviorProfile, mergeTrainingSession } from './UserBehaviorProfile';
import type { FaceLandmarkFeatures } from './FaceLandmarkExtractor';

function feature(index: number): FaceLandmarkFeatures {
  return { blinkLeft: index % 40 === 0 ? 1 : 0, blinkRight: index % 40 === 0 ? 1 : 0, gazeX: 0.03, gazeY: 0.02, headYaw: Math.sin(index / 12) * 0.08, headPitch: Math.sin(index / 8) * 0.07, headRoll: Math.sin(index / 18) * 0.04, smileIntensity: index % 25 < 4 ? 0.35 : 0.1, expressionIntensity: 0.3, confidence: 0.92, source: 'mediapipe' };
}

describe('training session updates', () => {
  it('creates and matures a persisted behavior profile', () => {
    const recorder = new TrainingDataRecorder();
    for (let index = 0; index < 600; index += 1) recorder.recordFeatures(feature(index));
    const session = recorder.createSessionProfile();
    const updated = mergeTrainingSession(defaultUserBehaviorProfile, session);

    expect(updated.trainingSessionCount).toBe(1);
    expect(updated.profileMaturity).toBe('learning');
    expect(updated.qualityScore).toBeGreaterThan(50);
    expect(updated.blinkRate).toBeGreaterThanOrEqual(10);
    expect(updated.samples).toBe(600);
  });
});
