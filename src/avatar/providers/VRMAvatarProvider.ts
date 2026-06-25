import type { AvatarAssetDescriptor } from '../AvatarAssetProvider';
import { AvatarProviderUnavailableError, type AvatarGenerationProvider } from '../AvatarGenerationProvider';
import type { AvatarIdentityProfile } from '../AvatarIdentityProfile';
import type { AvatarCreationRequest } from '../UserImageAvatarCreator';

export class VRMAvatarProvider implements AvatarGenerationProvider {
  readonly id = 'vrm';
  readonly displayName = 'VRM Avatar';
  readonly available = false;
  async createAvatarFromImages(_request: AvatarCreationRequest): Promise<AvatarIdentityProfile> { throw new AvatarProviderUnavailableError(this.id); }
  async updateAvatarFromProfile(_profile: AvatarIdentityProfile): Promise<AvatarIdentityProfile> { throw new AvatarProviderUnavailableError(this.id); }
  async getAvatarAsset(_profile: AvatarIdentityProfile): Promise<AvatarAssetDescriptor> { throw new AvatarProviderUnavailableError(this.id); }
  async deleteAvatarData(_profileId: string): Promise<void> { /* TODO: delete imported VRM files and cached textures. */ }
}
