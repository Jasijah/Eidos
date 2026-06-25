import type { AvatarAssetDescriptor } from '../AvatarAssetProvider';
import { AvatarProviderUnavailableError, type AvatarGenerationProvider } from '../AvatarGenerationProvider';
import type { AvatarIdentityProfile } from '../AvatarIdentityProfile';
import type { AvatarCreationRequest } from '../UserImageAvatarCreator';

export class ReadyPlayerMeAvatarProvider implements AvatarGenerationProvider {
  readonly id = 'ready-player-me';
  readonly displayName = 'Ready Player Me';
  readonly available = false;
  async createAvatarFromImages(_request: AvatarCreationRequest): Promise<AvatarIdentityProfile> { throw new AvatarProviderUnavailableError(this.id); }
  async updateAvatarFromProfile(_profile: AvatarIdentityProfile): Promise<AvatarIdentityProfile> { throw new AvatarProviderUnavailableError(this.id); }
  async getAvatarAsset(_profile: AvatarIdentityProfile): Promise<AvatarAssetDescriptor> { throw new AvatarProviderUnavailableError(this.id); }
  async deleteAvatarData(_profileId: string): Promise<void> { /* TODO: invoke provider deletion API after commercial terms and DPA review. */ }
}
