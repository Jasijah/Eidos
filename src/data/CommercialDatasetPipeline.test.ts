import { describe, expect, it } from 'vitest';
import { CommercialDatasetRegistry } from './CommercialDatasetRegistry';
import { DatasetLicenseValidator } from './DatasetLicenseValidator';
import { BehaviorDatasetIngestor } from './BehaviorDatasetIngestor';
import type { RawBehaviorSample } from './BehaviorFeatureExtractor';

const samples: RawBehaviorSample[] = Array.from({ length: 20 }, (_, index) => ({
  timestamp: index * 100,
  blinkLeft: index === 5 ? 1 : 0,
  blinkRight: index === 5 ? 1 : 0,
  nodIntensity: 0.2,
  headYaw: 0.04,
  headPitch: 0.03,
  headRoll: 0.02,
  gazeX: 0.02,
  gazeY: 0.01,
  smileIntensity: index > 14 ? 0.35 : 0.1,
  expressionIntensity: 0.25,
  shoulderShift: 0.04,
  gestureEnergy: 0.3,
  state: 'listening',
  mode: 'professional',
  confidence: 0.9
}));

describe('commercial dataset policy', () => {
  const registry = new CommercialDatasetRegistry();
  const validator = new DatasetLicenseValidator();

  it('rejects unknown and non-commercial datasets for production', () => {
    expect(validator.validate(registry.get('unknown-license-placeholder')).allowed).toBe(false);
    expect(validator.validate(registry.get('research-only-placeholder')).allowed).toBe(false);
  });

  it('allows research-only data only in experimental mode with a warning', () => {
    const decision = validator.validate(registry.get('research-only-placeholder'), 'experimental');
    expect(decision.allowed).toBe(true);
    expect(decision.severity).toBe('warning');
  });

  it('ingests only production-approved commercial data and exports identity-free JSON', () => {
    const result = new BehaviorDatasetIngestor().ingest({ datasetId: 'eidos-synthetic-behavior-v1', sourceItemId: 'fixture-1', samples });
    expect(result.record.containsRawIdentity).toBe(false);
    expect(result.record.rawMediaRetained).toBe(false);
    expect(JSON.parse(result.exportedJson).features.blinkRate).toBeGreaterThan(0);
    expect(() => new BehaviorDatasetIngestor().ingest({ datasetId: 'research-only-placeholder', sourceItemId: 'bad', samples })).toThrow(/rejected/i);
  });
});
