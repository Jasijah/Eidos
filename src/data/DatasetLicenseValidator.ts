import type { CommercialDatasetRecord } from './CommercialDatasetRegistry';

export type DatasetUseMode = 'production' | 'experimental';

export interface DatasetLicenseDecision {
  allowed: boolean;
  severity: 'approved' | 'warning' | 'blocked';
  reasons: string[];
}

export class DatasetLicenseValidator {
  validate(dataset: CommercialDatasetRecord | undefined, mode: DatasetUseMode = 'production'): DatasetLicenseDecision {
    if (!dataset) return { allowed: false, severity: 'blocked', reasons: ['Dataset is not registered.'] };
    if (dataset.commercialUseAllowed === 'unknown') {
      return { allowed: false, severity: 'blocked', reasons: ['License is unknown. Unknown licenses are rejected by default.'] };
    }
    if (dataset.commercialUseAllowed === false) {
      if (mode === 'experimental') {
        return { allowed: true, severity: 'warning', reasons: ['Research-only data is allowed only in isolated experimental mode and must never enter production artifacts.'] };
      }
      return { allowed: false, severity: 'blocked', reasons: ['Dataset license does not allow commercial use.'] };
    }
    if (mode === 'production' && !dataset.approvedForProductionTraining) {
      return { allowed: false, severity: 'blocked', reasons: ['Dataset has not passed production training approval.'] };
    }

    const reasons = ['Commercial use is explicitly allowed.'];
    if (dataset.attributionRequired) reasons.push('Attribution must be included in release documentation and model cards.');
    return { allowed: true, severity: dataset.attributionRequired ? 'warning' : 'approved', reasons };
  }

  assertApproved(dataset: CommercialDatasetRecord | undefined, mode: DatasetUseMode = 'production'): CommercialDatasetRecord {
    const decision = this.validate(dataset, mode);
    if (!decision.allowed || !dataset) throw new Error(`Dataset rejected: ${decision.reasons.join(' ')}`);
    return dataset;
  }
}
