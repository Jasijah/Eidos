import type { AvatarAssetDescriptor } from '../AvatarAssetProvider';
import type { AvatarGenerationProvider } from '../AvatarGenerationProvider';
import { deleteAvatarIdentity, type AvatarIdentityProfile } from '../AvatarIdentityProfile';
import { UserImageAvatarCreator, type AvatarCreationRequest } from '../UserImageAvatarCreator';

export class LocalPlaceholderAvatarProvider implements AvatarGenerationProvider {
  readonly id = 'local-placeholder';
  readonly displayName = 'Local Three.js Avatar';
  readonly available = true;
  private creator = new UserImageAvatarCreator();

  async createAvatarFromImages(request: AvatarCreationRequest): Promise<AvatarIdentityProfile> {
    return this.creator.createProfile(request, this.id);
  }

  async updateAvatarFromProfile(profile: AvatarIdentityProfile): Promise<AvatarIdentityProfile> {
    return { ...profile, providerId: this.id, assetId: `local-${profile.id}` };
  }

  async getAvatarAsset(profile: AvatarIdentityProfile): Promise<AvatarAssetDescriptor> {
    return {
      id: profile.assetId,
      provider: 'procedural-three',
      displayName: 'Local identity-derived avatar',
      skinTone: profile.skinToneApproximation,
      hairTone: profile.hairColorApproximation,
      jacketTone: '#24302f',
      shirtTone: '#e8eeeb',
      background: 'studio-office',
      supportsBlendshapes: true,
      supportsRiggedBody: true
    };
  }

  async deleteAvatarData(_profileId: string): Promise<void> {
    if (typeof window !== 'undefined') deleteAvatarIdentity();
  }
}
