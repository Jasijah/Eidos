import { beforeEach, describe, expect, it } from 'vitest';
import { ConsentManager, defaultConsentState } from './ConsentManager';
import { deleteAvatarIdentityModel, loadAvatarIdentityModel, saveAvatarIdentityModel } from '../avatar/AvatarIdentityModel';

beforeEach(() => localStorage.clear());

describe('privacy deletion workflows', () => {
  it('defaults to local-only with no model or third-party opt-in', () => {
    const state = new ConsentManager().load();
    expect(state.localOnlyMode).toBe(true);
    expect(state.modelImprovement).toBe(false);
    expect(state.thirdPartyAvatarProcessing).toBe(false);
  });

  it('deletes stored avatar identity and resets consent', () => {
    saveAvatarIdentityModel({ avatarId: 'a', displayName: 'A', sourceImages: [], generatedAssetUrl: 'local://a', provider: 'local-realistic', realismLevel: 'professional', faceShapeApproximation: 'unknown', skinToneApproximation: '#aaa', hairApproximation: { style: 'unknown', color: '#111' }, consentStatus: { imageProcessing: true, localStorage: true, thirdPartyProcessing: false, modelImprovement: false }, createdAt: '', updatedAt: '' });
    deleteAvatarIdentityModel();
    expect(loadAvatarIdentityModel()).toBeUndefined();
    const manager = new ConsentManager();
    manager.save({ ...defaultConsentState, imageProcessing: true });
    expect(manager.reset()).toEqual(defaultConsentState);
  });
});
