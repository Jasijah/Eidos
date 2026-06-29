import { clamp } from '../avatar/RealismProfile';
import type { PresenceActivityState } from '../presence/BehaviorSignal';
import type { PresenceMode } from '../types';
import type { BehaviorTrainingRecord } from './BehaviorTrainingRecord';

export interface RawBehaviorSample {
  timestamp: number;
  blinkLeft: number;
  blinkRight: number;
  nodIntensity: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  gazeX: number;
  gazeY: number;
  smileIntensity: number;
  expressionIntensity: number;
  shoulderShift: number;
  gestureEnergy: number;
  state: PresenceActivityState;
  mode: PresenceMode;
  confidence: number;
}

export class BehaviorFeatureExtractor {
  extract(datasetId: string, sourceItemId: string, samples: RawBehaviorSample[]): BehaviorTrainingRecord {
    if (samples.length === 0) throw new Error('At least one behavior sample is required.');
    const average = (read: (sample: RawBehaviorSample) => number) => samples.reduce((sum, sample) => sum + read(sample), 0) / samples.length;
    const dominant = <T extends string>(read: (sample: RawBehaviorSample) => T): T => {
      const counts = new Map<T, number>();
      for (const sample of samples) counts.set(read(sample), (counts.get(read(sample)) ?? 0) + 1);
      return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    };
    let blinkEvents = 0;
    let priorBlink = false;
    for (const sample of samples) {
      const blink = sample.blinkLeft > 0.6 && sample.blinkRight > 0.6;
      if (blink && !priorBlink) blinkEvents += 1;
      priorBlink = blink;
    }
    const durationMinutes = Math.max(1 / 60, (samples[samples.length - 1].timestamp - samples[0].timestamp) / 60000);

    return {
      id: `${datasetId}:${sourceItemId}:${samples[0].timestamp}`,
      datasetId,
      sourceItemId,
      timestamp: samples[0].timestamp,
      state: dominant((sample) => sample.state),
      mode: dominant((sample) => sample.mode),
      features: {
        blinkRate: clamp(blinkEvents / durationMinutes, 0, 40),
        nodRate: clamp(average((sample) => sample.nodIntensity), 0, 1),
        headYaw: clamp(average((sample) => sample.headYaw), -1, 1),
        headPitch: clamp(average((sample) => sample.headPitch), -1, 1),
        headRoll: clamp(average((sample) => sample.headRoll), -1, 1),
        gazeMovement: clamp(average((sample) => Math.abs(sample.gazeX) + Math.abs(sample.gazeY)), 0, 1),
        smileFrequency: clamp(average((sample) => sample.smileIntensity > 0.28 ? 1 : 0), 0, 1),
        expressionIntensity: clamp(average((sample) => sample.expressionIntensity), 0, 1),
        postureMovement: clamp(average((sample) => Math.abs(sample.shoulderShift)), 0, 1),
        gestureEnergy: clamp(average((sample) => sample.gestureEnergy), 0, 1)
      },
      confidence: clamp(average((sample) => sample.confidence), 0, 1),
      containsRawIdentity: false,
      rawMediaRetained: false
    };
  }
}
