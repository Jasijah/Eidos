import type { BehaviorSignal } from './BehaviorSignal';

export interface GestureFeatureSample {
  nodRate: number;
  shoulderEnergy: number;
  headMovementIntensity: number;
  gestureEnergy: number;
  confidence: number;
}

export class GestureFeatureExtractor {
  extractFromSignals(signals: BehaviorSignal[]): GestureFeatureSample {
    if (signals.length === 0) {
      return { nodRate: 0, shoulderEnergy: 0, headMovementIntensity: 0, gestureEnergy: 0, confidence: 0 };
    }

    const totals = signals.reduce(
      (acc, signal) => ({
        nodRate: acc.nodRate + signal.nodIntensity,
        shoulderEnergy: acc.shoulderEnergy + Math.abs(signal.shoulderShift),
        headMovementIntensity: acc.headMovementIntensity + Math.abs(signal.headYaw) + Math.abs(signal.headPitch) + Math.abs(signal.headRoll),
        gestureEnergy: acc.gestureEnergy + signal.nodIntensity + Math.abs(signal.shoulderShift),
        confidence: acc.confidence + signal.confidence
      }),
      { nodRate: 0, shoulderEnergy: 0, headMovementIntensity: 0, gestureEnergy: 0, confidence: 0 }
    );

    return {
      nodRate: totals.nodRate / signals.length,
      shoulderEnergy: totals.shoulderEnergy / signals.length,
      headMovementIntensity: totals.headMovementIntensity / signals.length,
      gestureEnergy: totals.gestureEnergy / signals.length,
      confidence: totals.confidence / signals.length
    };
  }
}