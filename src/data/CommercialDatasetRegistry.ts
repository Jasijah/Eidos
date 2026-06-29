export type DatasetCommercialUse = true | false | 'unknown';
export type DatasetDataType = 'face' | 'pose' | 'gesture' | 'expression' | 'audio-visual' | 'avatar';

export interface CommercialDatasetRecord {
  id: string;
  datasetName: string;
  sourceUrl: string;
  licenseType: string;
  commercialUseAllowed: DatasetCommercialUse;
  attributionRequired: boolean;
  dataType: DatasetDataType[];
  approvedForProductionTraining: boolean;
  notes: string;
}

const DATASETS: CommercialDatasetRecord[] = [
  {
    id: 'eidos-synthetic-behavior-v1',
    datasetName: 'Eidos Synthetic Behavior Fixtures v1',
    sourceUrl: 'local://src/data/fixtures',
    licenseType: 'Eidos project-owned synthetic data',
    commercialUseAllowed: true,
    attributionRequired: false,
    dataType: ['pose', 'gesture', 'expression'],
    approvedForProductionTraining: true,
    notes: 'Identity-free synthetic signals created for tests and baseline calibration.'
  },
  {
    id: 'user-consented-local-sessions',
    datasetName: 'User-Consented Local Training Sessions',
    sourceUrl: 'local://browser/user-training',
    licenseType: 'Direct user consent subject to Eidos retention policy',
    commercialUseAllowed: true,
    attributionRequired: false,
    dataType: ['face', 'pose', 'gesture', 'expression', 'audio-visual'],
    approvedForProductionTraining: false,
    notes: 'Local-only by default. Production model use additionally requires explicit model-improvement opt-in and legal review.'
  },
  {
    id: 'research-only-placeholder',
    datasetName: 'Research-Only Dataset Placeholder',
    sourceUrl: 'https://example.invalid/research-only',
    licenseType: 'Research-only / non-commercial',
    commercialUseAllowed: false,
    attributionRequired: true,
    dataType: ['face', 'expression'],
    approvedForProductionTraining: false,
    notes: 'Included to verify rejection and experimental-mode warnings. Never use for production training.'
  },
  {
    id: 'unknown-license-placeholder',
    datasetName: 'Unknown-License Dataset Placeholder',
    sourceUrl: 'https://example.invalid/unknown-license',
    licenseType: 'Unknown',
    commercialUseAllowed: 'unknown',
    attributionRequired: false,
    dataType: ['gesture'],
    approvedForProductionTraining: false,
    notes: 'Rejected by default until counsel verifies a commercial license.'
  }
];

export class CommercialDatasetRegistry {
  private records = new Map(DATASETS.map((dataset) => [dataset.id, dataset]));

  list(): CommercialDatasetRecord[] {
    return Array.from(this.records.values()).map((record) => ({ ...record, dataType: [...record.dataType] }));
  }

  get(id: string): CommercialDatasetRecord | undefined {
    const record = this.records.get(id);
    return record ? { ...record, dataType: [...record.dataType] } : undefined;
  }

  register(record: CommercialDatasetRecord): void {
    this.records.set(record.id, { ...record, dataType: [...record.dataType] });
  }
}
