import { CommercialDatasetRegistry } from '../data/CommercialDatasetRegistry';
import { DatasetLicenseValidator } from '../data/DatasetLicenseValidator';
import type { ModelTrainingManifest } from './ModelTrainingManifest';
import { TRAINING_DATASET_SCHEMA, type TrainingDatasetRow } from './TrainingDatasetSchema';

export class TrainingRecordExporter {
  constructor(private registry = new CommercialDatasetRegistry(), private validator = new DatasetLicenseValidator()) {}

  validate(rows: TrainingDatasetRow[]): void {
    if (rows.length === 0) throw new Error('No training records to export.');
    for (const row of rows) {
      if (!row.consentFlag) throw new Error(`Export blocked: consent missing for ${row.sessionId}.`);
      const decision = this.validator.validate(this.registry.get(row.datasetId), 'production');
      if (!decision.allowed || !row.commercialUseApproved) throw new Error(`Export blocked: dataset ${row.datasetId} is not commercially approved.`);
    }
  }

  toJsonl(rows: TrainingDatasetRow[]): string {
    this.validate(rows);
    return rows.map((row) => JSON.stringify(row)).join('\n');
  }

  toCsv(rows: TrainingDatasetRow[]): string {
    this.validate(rows);
    const header = ['timestamp','sessionId','anonymizedUserId','mode','speechState','audioEnergy','confidence','naturalJawOpen','consentFlag','datasetId','commercialUseApproved'];
    const lines = rows.map((row) => [row.timestamp,row.sessionId,row.anonymizedUserId,row.mode,row.input.speechState,row.input.audioEnergy,row.expectedBehaviorSignal.confidence,row.expectedBehaviorSignal.jawOpen,row.consentFlag,row.datasetId,row.commercialUseApproved].map(csv).join(','));
    return [header.join(','), ...lines].join('\n');
  }

  manifest(rows: TrainingDatasetRow[]): ModelTrainingManifest {
    this.validate(rows);
    return { manifestVersion: 1, createdAt: new Date().toISOString(), schemaVersion: TRAINING_DATASET_SCHEMA.schemaVersion, recordCount: rows.length, datasetIds: Array.from(new Set(rows.map((row) => row.datasetId))), allUsersConsented: true, allCommerciallyApproved: true, containsRawMedia: false, intendedAlgorithms: ['xgboost','lightgbm','tiny-neural-network'] };
  }
}

function csv(value: unknown): string { const text = String(value); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
