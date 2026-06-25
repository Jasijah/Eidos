import type { ConsentState } from '../privacy/ConsentManager';

export class AvatarConsentManager {
  canProcessImages(consent: ConsentState): boolean { return consent.imageProcessing; }
  canStoreImages(consent: ConsentState): boolean { return consent.imageProcessing && consent.localAvatarStorage; }
  canUseThirdParty(consent: ConsentState): boolean { return consent.imageProcessing && consent.thirdPartyAvatarProcessing && !consent.localOnlyMode; }
  assertCanProcess(consent: ConsentState): void { if (!this.canProcessImages(consent)) throw new Error('Explicit avatar image processing consent is required.'); }
}
