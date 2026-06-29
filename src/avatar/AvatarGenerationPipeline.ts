import type { ConsentState } from '../privacy/ConsentManager';
import { AvatarConsentManager } from './AvatarConsentManager';
import type { AvatarIdentityModel, AvatarRealismLevel, AvatarSourceImage, PhotorealAvatarProviderId } from './AvatarIdentityModel';
import { AvatarProviderRegistry } from './AvatarProviderRegistry';
import { ImageFeatureExtractor } from './ImageFeatureExtractor';
import { PhotorealisticAvatarGenerator } from './PhotorealisticAvatarGenerator';

export class AvatarGenerationPipeline {
  constructor(private registry = new AvatarProviderRegistry(), private extractor = new ImageFeatureExtractor(), private consentManager = new AvatarConsentManager()) {}

  async generate(input: { displayName: string; images: AvatarSourceImage[]; providerId: PhotorealAvatarProviderId; realismLevel: AvatarRealismLevel; consent: ConsentState }): Promise<{ model: AvatarIdentityModel; fellBack: boolean }> {
    this.consentManager.assertCanProcess(input.consent);
    const features = await this.extractor.extract(input.images);
    const resolution = this.registry.resolve(input.providerId);
    const generated = await new PhotorealisticAvatarGenerator(resolution.provider).generate({ displayName: input.displayName, images: input.images, realismLevel: input.realismLevel, consent: { imageProcessing: true, localStorage: input.consent.localAvatarStorage, thirdPartyProcessing: this.consentManager.canUseThirdParty(input.consent), modelImprovement: false } });
    return { model: { ...generated, skinToneApproximation: features.skinTone, hairApproximation: { style: features.hairStyle, color: features.hairColor }, faceShapeApproximation: features.faceShape, updatedAt: new Date().toISOString() }, fellBack: resolution.fellBack };
  }
}
