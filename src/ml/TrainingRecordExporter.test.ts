import { describe, expect, it } from 'vitest';
import { TrainingRecordExporter } from './TrainingRecordExporter';
import { defaultUserBehaviorProfile } from '../presence/UserBehaviorProfile';
import type { TrainingDatasetRow } from './TrainingDatasetSchema';

const row: TrainingDatasetRow = {
  input: { timestamp: 1, speechState: 'speaking', audioEnergy: 0.2, presenceMode: 'professional', userBehaviorProfile: defaultUserBehaviorProfile, trainingMaturity: 'new-user', lastBlinkTime: 0, lastNodTime: 0, lastExpressionChange: 0 },
  expectedBehaviorSignal: { timestamp: 1, blinkLeft: 0, blinkRight: 0, gazeX: 0, gazeY: 0, headYaw: 0, headPitch: 0, headRoll: 0, nodIntensity: 0, smileIntensity: 0.1, browRaise: 0, jawOpen: 0.2, shoulderShift: 0, breathingMotion: 0.2, confidence: 0.8 },
  mode: 'professional', timestamp: 1, sessionId: 'session', anonymizedUserId: 'anon-123', consentFlag: true, datasetId: 'eidos-synthetic-behavior-v1', commercialUseApproved: true
};

describe('TrainingRecordExporter', () => {
  it('blocks export without user consent', () => { expect(() => new TrainingRecordExporter().toJsonl([{ ...row, consentFlag: false }])).toThrow(/consent/i); });
  it('blocks export without commercial license approval', () => { expect(() => new TrainingRecordExporter().toCsv([{ ...row, datasetId: 'research-only-placeholder', commercialUseApproved: false }])).toThrow(/commercial/i); });
  it('exports approved rows without raw media', () => { const output = new TrainingRecordExporter().toJsonl([row]); expect(output).toContain('anonymizedUserId'); expect(output).not.toContain('data:image'); });
});
