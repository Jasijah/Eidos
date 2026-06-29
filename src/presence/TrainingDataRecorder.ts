import type { BehaviorSignal } from './BehaviorSignal';
import type { FaceLandmarkFeatures } from './FaceLandmarkExtractor';
import type { UserBehaviorProfile } from './UserBehaviorProfile';
import { clamp } from '../avatar/RealismProfile';

export interface TrainingDataRecord {
  sessionId: string;
  signal: BehaviorSignal;
  source: 'universal-model' | 'camera-extraction' | 'manual-event';
}

export class TrainingDataRecorder {
  private records: TrainingDataRecord[] = [];
  private features: FaceLandmarkFeatures[] = [];

  record(record: TrainingDataRecord): void {
    this.records.push(record);
  }

  recordFeatures(features: FaceLandmarkFeatures): void {
    this.features.push(features);
  }

  list(): TrainingDataRecord[] {
    return [...this.records];
  }

  featureCount(): number {
    return this.features.length;
  }

  clear(): void {
    this.records = [];
    this.features = [];
  }

  createSessionProfile(): Omit<UserBehaviorProfile, 'trainingSessionCount' | 'profileMaturity' | 'qualityScore' | 'updatedAt'> {
    if (this.features.length === 0) {
      return { blinkRate: 15, nodRate: 0.25, smileFrequency: 0.2, headMovementIntensity: 0.3, eyeContactPreference: 0.65, gestureEnergy: 0.32, postureStyle: 'upright', samples: 0 };
    }

    const durationMinutes = Math.max(1 / 60, (this.features.length / 10) / 60);
    let blinkEvents = 0;
    let nodEvents = 0;
    let smiles = 0;
    let movement = 0;
    let eyeContact = 0;
    let previousBlink = false;
    let previousPitch = this.features[0].headPitch;

    for (const feature of this.features) {
      const blink = feature.blinkLeft > 0.65 && feature.blinkRight > 0.65;
      if (blink && !previousBlink) blinkEvents += 1;
      if (Math.abs(feature.headPitch - previousPitch) > 0.08) nodEvents += 1;
      if (feature.smileIntensity > 0.28) smiles += 1;
      movement += Math.abs(feature.headYaw) + Math.abs(feature.headPitch) + Math.abs(feature.headRoll);
      eyeContact += 1 - clamp(Math.abs(feature.gazeX) + Math.abs(feature.gazeY), 0, 1);
      previousBlink = blink;
      previousPitch = feature.headPitch;
    }

    const count = this.features.length;
    const headMovementIntensity = clamp(movement / count, 0.08, 0.72);
    return {
      blinkRate: clamp(blinkEvents / durationMinutes, 10, 22),
      nodRate: clamp(nodEvents / count * 2, 0, 0.68),
      smileFrequency: clamp(smiles / count, 0, 0.62),
      headMovementIntensity,
      eyeContactPreference: clamp(eyeContact / count, 0.28, 0.9),
      gestureEnergy: clamp(headMovementIntensity * 1.18, 0.05, 0.8),
      postureStyle: headMovementIntensity < 0.2 ? 'upright' : 'relaxed',
      samples: count
    };
  }
}
