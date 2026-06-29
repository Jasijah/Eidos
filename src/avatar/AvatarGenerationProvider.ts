import type { AvatarAssetDescriptor } from './AvatarAssetProvider';
import type { AvatarIdentityProfile } from './AvatarIdentityProfile';
import type { AvatarCreationRequest } from './UserImageAvatarCreator';

export interface AvatarGenerationProvider {
  readonly id: string;
  readonly displayName: string;
  readonly available: boolean;
  createAvatarFromImages(request: AvatarCreationRequest): Promise<AvatarIdentityProfile>;
  updateAvatarFromProfile(profile: AvatarIdentityProfile): Promise<AvatarIdentityProfile>;
  getAvatarAsset(profile: AvatarIdentityProfile): Promise<AvatarAssetDescriptor>;
  deleteAvatarData(profileId: string): Promise<void>;
}

export class AvatarProviderUnavailableError extends Error {
  constructor(providerId: string) {
    super(`${providerId} is not configured. Falling back to the local avatar provider is required.`);
  }
}
