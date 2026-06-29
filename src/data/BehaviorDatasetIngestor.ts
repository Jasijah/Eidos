import { CommercialDatasetRegistry } from './CommercialDatasetRegistry';
import { DatasetLicenseValidator, type DatasetUseMode } from './DatasetLicenseValidator';
import { BehaviorFeatureExtractor, type RawBehaviorSample } from './BehaviorFeatureExtractor';
import type { BehaviorTrainingRecord } from './BehaviorTrainingRecord';

export interface DatasetIngestionRequest {
  datasetId: string;
  sourceItemId: string;
  samples: RawBehaviorSample[];
  mode?: DatasetUseMode;
  retainRawMedia?: boolean;
  rawMediaLegallyPermitted?: boolean;
}

export interface DatasetIngestionResult {
  record: BehaviorTrainingRecord;
  warnings: string[];
  exportedJson: string;
}

export class BehaviorDatasetIngestor {
  constructor(
    private registry = new CommercialDatasetRegistry(),
    private validator = new DatasetLicenseValidator(),
    private extractor = new BehaviorFeatureExtractor()
  ) {}

  ingest(request: DatasetIngestionRequest): DatasetIngestionResult {
    const mode = request.mode ?? 'production';
    const dataset = this.validator.assertApproved(this.registry.get(request.datasetId), mode);
    if (request.retainRawMedia && !request.rawMediaLegallyPermitted) {
      throw new Error('Raw media retention requires explicit legal permission.');
    }
    const record = this.extractor.extract(dataset.id, request.sourceItemId, request.samples);
    const warnings: string[] = [];
    if (mode === 'experimental') warnings.push('EXPERIMENTAL ONLY: this record must not enter production training artifacts.');
    if (dataset.attributionRequired) warnings.push(`Attribution required for ${dataset.datasetName}.`);
    if (request.retainRawMedia) warnings.push('Raw media retention was requested; store it outside normalized training records with a separate retention schedule.');
    return { record, warnings, exportedJson: JSON.stringify(record, null, 2) };
  }
}
