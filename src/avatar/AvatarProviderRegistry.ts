import type { PhotorealAvatarProviderId } from './AvatarIdentityModel';
import type { PhotorealisticAvatarProvider } from './PhotorealisticAvatarGenerator';
import { LocalPhotorealPortraitProvider } from './providers/LocalPhotorealPortraitProvider';
import { LocalPlaceholderRealisticProvider } from './providers/LocalPlaceholderRealisticProvider';
import { ReadyPlayerMeProvider } from './providers/ReadyPlayerMeProvider';
import { VRMProvider } from './providers/VRMProvider';
import { ExternalPhotorealProvider } from './providers/ExternalPhotorealProvider';

export class AvatarProviderRegistry {
  private providers = new Map<PhotorealAvatarProviderId, PhotorealisticAvatarProvider>();

  constructor(providers: PhotorealisticAvatarProvider[] = [new LocalPhotorealPortraitProvider(), new LocalPlaceholderRealisticProvider(), new ReadyPlayerMeProvider(), new VRMProvider(), new ExternalPhotorealProvider()]) {
    providers.forEach((provider) => this.providers.set(provider.id, provider));
  }

  list(): PhotorealisticAvatarProvider[] {
    return Array.from(this.providers.values());
  }

  get(id: PhotorealAvatarProviderId): PhotorealisticAvatarProvider | undefined {
    return this.providers.get(id);
  }

  resolve(id: PhotorealAvatarProviderId): { provider: PhotorealisticAvatarProvider; fellBack: boolean } {
    const requested = this.providers.get(id);
    if (requested?.available) return { provider: requested, fellBack: false };
    const fallback = this.providers.get('local-realistic');
    if (!fallback) throw new Error('Local realistic avatar provider is not registered.');
    return { provider: fallback, fellBack: id !== 'local-realistic' };
  }
}
