import { beforeEach, describe, expect, it } from 'vitest';
import { canContributeToModelImprovement, defaultUserTrainingConsent, loadUserTrainingConsent, saveUserTrainingConsent } from './UserTrainingConsent';
import { resolveDataRetentionPolicy } from './DataRetentionPolicy';

beforeEach(() => localStorage.clear());

describe('training privacy defaults', () => {
  it('defaults to local-only retention and no public training', () => {
    const consent = loadUserTrainingConsent();
    expect(consent.imageRetention).toBe('local-only');
    expect(consent.behaviorRetention).toBe('local-only');
    expect(consent.improveEidosModels).toBe(false);
    expect(consent.rawMediaCloudUpload).toBe(false);
    expect(resolveDataRetentionPolicy(consent).cloudUpload).toBe('disabled');
  });

  it('requires explicit user opt-in for model improvement', () => {
    expect(canContributeToModelImprovement(defaultUserTrainingConsent)).toBe(false);
    const optedIn = { ...defaultUserTrainingConsent, improveEidosModels: true };
    saveUserTrainingConsent(optedIn);
    expect(canContributeToModelImprovement(loadUserTrainingConsent())).toBe(true);
  });
});
