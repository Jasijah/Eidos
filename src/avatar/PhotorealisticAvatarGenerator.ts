import type { AvatarAssetDescriptor } from './AvatarAssetProvider';
import type { AvatarIdentityModel, AvatarRealismLevel, AvatarSourceImage, PhotorealAvatarProviderId } from './AvatarIdentityModel';

export interface PhotorealisticAvatarRequest {
  displayName: string;
  images: AvatarSourceImage[];
  realismLevel: AvatarRealismLevel;
  consent: { imageProcessing: boolean; localStorage: boolean; thirdPartyProcessing: boolean; modelImprovement: boolean };
}

export interface PhotorealisticAvatarProvider {
  readonly id: PhotorealAvatarProviderId;
  readonly displayName: string;
  readonly available: boolean;
  readonly requiresThirdPartyProcessing: boolean;
  createAvatar(request: PhotorealisticAvatarRequest): Promise<AvatarIdentityModel>;
  updateAvatar(model: AvatarIdentityModel): Promise<AvatarIdentityModel>;
  deleteAvatar(model: AvatarIdentityModel): Promise<void>;
  getAvatarAsset(model: AvatarIdentityModel): Promise<AvatarAssetDescriptor>;
  status(): { available: boolean; message: string };
}

export class PhotorealisticAvatarGenerator {
  constructor(private provider: PhotorealisticAvatarProvider) {}
  async generate(request: PhotorealisticAvatarRequest): Promise<AvatarIdentityModel> {
    if (!request.consent.imageProcessing) throw new Error('Image processing consent is required.');
    if (request.images.length === 0) throw new Error('At least one source image is required.');
    if (this.provider.requiresThirdPartyProcessing && !request.consent.thirdPartyProcessing) throw new Error('Explicit third-party avatar processing consent is required.');
    if (!this.provider.available) throw new Error(`${this.provider.displayName} is unavailable.`);
    return this.provider.createAvatar(request);
  }
}
