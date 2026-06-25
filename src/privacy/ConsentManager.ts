export interface ConsentState {
  imageProcessing: boolean;
  localAvatarStorage: boolean;
  behaviorStorage: boolean;
  modelImprovement: boolean;
  thirdPartyAvatarProcessing: boolean;
  localOnlyMode: boolean;
  updatedAt: string;
}

export const CONSENT_MANAGER_KEY = 'eidos.consent.beta.v1';
export const defaultConsentState: ConsentState = { imageProcessing: false, localAvatarStorage: true, behaviorStorage: true, modelImprovement: false, thirdPartyAvatarProcessing: false, localOnlyMode: true, updatedAt: new Date(0).toISOString() };

export class ConsentManager {
  load(storage: Storage = window.localStorage): ConsentState {
    const raw = storage.getItem(CONSENT_MANAGER_KEY);
    if (!raw) return { ...defaultConsentState };
    try { return { ...defaultConsentState, ...JSON.parse(raw), updatedAt: JSON.parse(raw).updatedAt ?? new Date().toISOString() }; } catch { return { ...defaultConsentState }; }
  }
  save(state: ConsentState, storage: Storage = window.localStorage): void { storage.setItem(CONSENT_MANAGER_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() })); }
  reset(storage: Storage = window.localStorage): ConsentState { storage.removeItem(CONSENT_MANAGER_KEY); return { ...defaultConsentState }; }
  canProcessImages(state: ConsentState): boolean { return state.imageProcessing; }
  canUseThirdPartyAvatar(state: ConsentState): boolean { return state.imageProcessing && state.thirdPartyAvatarProcessing && !state.localOnlyMode; }
  canImproveModels(state: ConsentState): boolean { return state.modelImprovement; }
}
