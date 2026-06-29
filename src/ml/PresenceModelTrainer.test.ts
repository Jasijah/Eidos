import { describe, expect, it } from 'vitest';
import { BehaviorFeatureExtractor, type RawBehaviorSample } from '../data/BehaviorFeatureExtractor';
import { PresenceModelTrainer } from './PresenceModelTrainer';
import { TrainingDataStore } from './TrainingDataStore';

function samples(state: 'speaking' | 'listening', mode: 'professional' | 'creator'): RawBehaviorSample[] {
  return Array.from({ length: 30 }, (_, index) => ({ timestamp: index * 100, blinkLeft: index === 10 ? 1 : 0, blinkRight: index === 10 ? 1 : 0, nodIntensity: state === 'listening' ? 0.4 : 0.1, headYaw: 0.08, headPitch: 0.06, headRoll: 0.04, gazeX: 0.02, gazeY: 0.02, smileIntensity: mode === 'creator' ? 0.4 : 0.16, expressionIntensity: mode === 'creator' ? 0.6 : 0.3, shoulderShift: 0.08, gestureEnergy: mode === 'creator' ? 0.7 : 0.35, state, mode, confidence: 0.88 }));
}

describe('behavioral presence model training', () => {
  it('creates normalized records and consumes them in the statistical trainer', () => {
    const extractor = new BehaviorFeatureExtractor();
    const records = [extractor.extract('eidos-synthetic-behavior-v1', 'one', samples('speaking', 'professional')), extractor.extract('eidos-synthetic-behavior-v1', 'two', samples('listening', 'creator'))];
    const store = new TrainingDataStore();
    store.addMany(records);
    const trainer = new PresenceModelTrainer();
    const model = trainer.train(store.list());
    const prediction = trainer.predict(model, { timestamp: 3000, mode: 'creator', state: 'listening' });
    expect(model.recordCount).toBe(2);
    expect(prediction.antiUncannyValidated).toBe(true);
    expect(prediction.confidence).toBeGreaterThan(0.5);
    expect(prediction.signal.smileIntensity).toBeLessThanOrEqual(0.5);
  });

  it('rejects records containing raw identity or retained media', () => {
    const record = new BehaviorFeatureExtractor().extract('eidos-synthetic-behavior-v1', 'one', samples('speaking', 'professional'));
    expect(() => new TrainingDataStore().add({ ...record, containsRawIdentity: true as false })).toThrow(/identity-free/i);
  });
});
