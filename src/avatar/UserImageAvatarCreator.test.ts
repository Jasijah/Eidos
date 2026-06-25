import { beforeEach, describe, expect, it } from 'vitest';
import { deleteAvatarIdentity, loadAvatarIdentity, saveAvatarIdentity } from './AvatarIdentityProfile';
import { UserImageAvatarCreator } from './UserImageAvatarCreator';
import { LocalPlaceholderAvatarProvider } from './providers/LocalPlaceholderAvatarProvider';
import { ReadyPlayerMeAvatarProvider } from './providers/ReadyPlayerMeAvatarProvider';

const image = { name: 'face.png', type: 'image/png', size: 1024, dataUrl: 'data:image/png;base64,AAAA' };
const creator = new UserImageAvatarCreator();

beforeEach(() => localStorage.clear());

describe('user image avatar creation', () => {
  it('validates supported files and rejects unsafe inputs', () => {
    expect(creator.validateImages([image]).valid).toBe(true);
    expect(creator.validateImages([{ ...image, type: 'image/gif' }]).valid).toBe(false);
    expect(creator.validateImages([{ ...image, size: 3 * 1024 * 1024 }]).valid).toBe(false);
  });

  it('requires consent before avatar creation', () => {
    expect(() => creator.createProfile({ images: [image], realismPreference: 'professional', consent: { avatarCreation: false, localStorage: true, publicModelTraining: false } })).toThrow(/consent/i);
  });

  it('creates and deletes a local avatar identity profile', async () => {
    const provider = new LocalPlaceholderAvatarProvider();
    const profile = await provider.createAvatarFromImages({ images: [image], realismPreference: 'professional', consent: { avatarCreation: true, localStorage: true, publicModelTraining: false } });
    saveAvatarIdentity(profile);
    expect(loadAvatarIdentity()?.id).toBe(profile.id);
    deleteAvatarIdentity();
    expect(loadAvatarIdentity()).toBeUndefined();
  });

  it('falls back cleanly when an external provider is unavailable', async () => {
    const unavailable = new ReadyPlayerMeAvatarProvider();
    await expect(unavailable.createAvatarFromImages({ images: [image], realismPreference: 'professional', consent: { avatarCreation: true, localStorage: true, publicModelTraining: false } })).rejects.toThrow(/not configured/i);
    const local = await new LocalPlaceholderAvatarProvider().createAvatarFromImages({ images: [image], realismPreference: 'professional', consent: { avatarCreation: true, localStorage: true, publicModelTraining: false } });
    expect(local.providerId).toBe('local-placeholder');
  });
});
