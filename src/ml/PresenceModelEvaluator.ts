import type { BehaviorTrainingRecord } from '../data/BehaviorTrainingRecord';
import type { TrainedPresenceModel } from './PresenceModelTrainer';

export interface PresenceModelEvaluation {
  coverage: number;
  averageConfidence: number;
  naturalnessEstimate: number;
  productionReady: boolean;
  warnings: string[];
}

export class PresenceModelEvaluator {
  evaluate(model: TrainedPresenceModel, records: BehaviorTrainingRecord[]): PresenceModelEvaluation {
    const covered = records.filter((record) => Boolean(model.profiles[`${record.mode}:${record.state}`])).length;
    const averageConfidence = records.length === 0 ? 0 : records.reduce((sum, record) => sum + record.confidence, 0) / records.length;
    const coverage = covered / Math.max(1, records.length);
    const warnings: string[] = [];
    if (records.length < 20) warnings.push('Evaluation set is too small for production claims.');
    if (coverage < 0.8) warnings.push('Mode/state coverage is below 80%.');
    if (averageConfidence < 0.7) warnings.push('Average feature confidence is below 70%.');
    return { coverage, averageConfidence, naturalnessEstimate: Math.min(0.95, averageConfidence * 0.72 + coverage * 0.23), productionReady: warnings.length === 0, warnings };
  }
}
