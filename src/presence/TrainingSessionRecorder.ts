import { clamp } from '../avatar/RealismProfile';
import type { UserBehaviorProfile } from './UserBehaviorProfile';
import type { MediaPipePresenceFeatures } from './MediaPipeFeatureMapper';

export interface TrainingSessionSummary {
  sessionId: string;
  durationMs: number;
  sampleCount: number;
  profile: Omit<UserBehaviorProfile, 'trainingSessionCount' | 'profileMaturity' | 'qualityScore' | 'updatedAt'>;
  qualityScore: number;
  source: 'mediapipe' | 'fallback' | 'mixed';
  latestFeatures?: MediaPipePresenceFeatures;
}

export class TrainingSessionRecorder {
  private samples: MediaPipePresenceFeatures[] = [];
  private startedAt = 0;
  private sessionId = '';

  start(now = Date.now()): string {
    this.samples = [];
    this.startedAt = now;
    this.sessionId = `training-${now}`;
    return this.sessionId;
  }

  record(features: MediaPipePresenceFeatures): void {
    if (!this.sessionId) this.start(features.timestamp);
    this.samples.push({ ...features });
  }

  progress(now = Date.now(), durationMs = 60000): number {
    return clamp((now - this.startedAt) / durationMs, 0, 1);
  }

  latest(): MediaPipePresenceFeatures | undefined {
    const value = this.samples[this.samples.length - 1];
    return value ? { ...value } : undefined;
  }

  summarize(now = Date.now()): TrainingSessionSummary {
    const durationMs = Math.max(1, now - this.startedAt);
    if (this.samples.length === 0) {
      return { sessionId: this.sessionId, durationMs, sampleCount: 0, qualityScore: 0, source: 'fallback', profile: { blinkRate: 15, nodRate: 0.25, smileFrequency: 0.2, headMovementIntensity: 0.3, eyeContactPreference: 0.65, gestureEnergy: 0.32, postureStyle: 'upright', samples: 0 } };
    }
    let blinkEvents = 0;
    let nodEvents = 0;
    let previousBlink = false;
    let previousPitch = this.samples[0].headPitch;
    const average = (read: (sample: MediaPipePresenceFeatures) => number) => this.samples.reduce((sum, sample) => sum + read(sample), 0) / this.samples.length;
    for (const sample of this.samples) {
      const blinking = sample.blinkLeft > 0.65 && sample.blinkRight > 0.65;
      if (blinking && !previousBlink) blinkEvents += 1;
      if (Math.abs(sample.headPitch - previousPitch) > 0.08) nodEvents += 1;
      previousBlink = blinking;
      previousPitch = sample.headPitch;
    }
    const sources = new Set(this.samples.map((sample) => sample.source));
    const movement = average((sample) => Math.abs(sample.headYaw) + Math.abs(sample.headPitch) + Math.abs(sample.headRoll));
    const confidence = average((sample) => sample.faceConfidence);
    return {
      sessionId: this.sessionId,
      durationMs,
      sampleCount: this.samples.length,
      qualityScore: Math.round(clamp(confidence * 70 + Math.min(30, this.samples.length / 20), 0, 100)),
      source: sources.size > 1 ? 'mixed' : this.samples[0].source,
      latestFeatures: this.latest(),
      profile: {
        blinkRate: clamp(blinkEvents / Math.max(1 / 60, durationMs / 60000), 10, 22),
        nodRate: clamp(nodEvents / this.samples.length * 2, 0, 0.68),
        smileFrequency: clamp(average((sample) => sample.smileIntensity > 0.28 ? 1 : 0), 0, 0.62),
        headMovementIntensity: clamp(movement, 0.08, 0.72),
        eyeContactPreference: clamp(1 - average((sample) => Math.abs(sample.gazeX) + Math.abs(sample.gazeY)), 0.28, 0.9),
        gestureEnergy: clamp(movement + average((sample) => sample.expressionIntensity) * 0.2, 0.05, 0.8),
        postureStyle: movement < 0.2 ? 'upright' : 'relaxed',
        samples: this.samples.length
      }
    };
  }
}
