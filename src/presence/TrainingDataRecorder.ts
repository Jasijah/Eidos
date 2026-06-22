import type { BehaviorSignal } from './BehaviorSignal';

export interface TrainingDataRecord {
  sessionId: string;
  signal: BehaviorSignal;
  source: 'universal-model' | 'camera-extraction' | 'manual-event';
}

export class TrainingDataRecorder {
  private records: TrainingDataRecord[] = [];

  record(record: TrainingDataRecord): void {
    this.records.push(record);
  }

  list(): TrainingDataRecord[] {
    return [...this.records];
  }

  clear(): void {
    this.records = [];
  }
}