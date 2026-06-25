import type { BehaviorTrainingRecord } from '../data/BehaviorTrainingRecord';

export interface TrainingDataStoreSnapshot {
  version: 1;
  records: BehaviorTrainingRecord[];
  updatedAt: string;
}

export class TrainingDataStore {
  private records: BehaviorTrainingRecord[] = [];

  add(record: BehaviorTrainingRecord): void {
    if (record.containsRawIdentity || record.rawMediaRetained) throw new Error('TrainingDataStore accepts normalized identity-free records only.');
    this.records.push(structuredClone(record));
  }

  addMany(records: BehaviorTrainingRecord[]): void {
    for (const record of records) this.add(record);
  }

  list(): BehaviorTrainingRecord[] {
    return this.records.map((record) => structuredClone(record));
  }

  clear(): void {
    this.records = [];
  }

  exportJson(): string {
    const snapshot: TrainingDataStoreSnapshot = { version: 1, records: this.list(), updatedAt: new Date().toISOString() };
    return JSON.stringify(snapshot, null, 2);
  }
}
