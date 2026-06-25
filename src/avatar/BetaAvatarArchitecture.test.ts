import { beforeEach, describe, expect, it } from 'vitest';
import { AvatarProviderRegistry } from './AvatarProviderRegistry';
import { PhotorealisticAvatarGenerator } from './PhotorealisticAvatarGenerator';
import { deleteAvatarIdentityModel, loadAvatarIdentityModel, saveAvatarIdentityModel } from './AvatarIdentityModel';

const image = { id: 'one', name: 'face.png', mimeType: 'image/png' as const, dataUrl: 'data:image/png;base64,AAAA', storedLocally: true };

beforeEach(() => localStorage.clear());

describe('Beta avatar identity architecture', () => {
  it('requires consent before image processing', async () => {
    const provider = new AvatarProviderRegistry().resolve('local-realistic').provider;
    await expect(new PhotorealisticAvatarGenerator(provider).generate({ displayName: 'Mina', images: [image], realismLevel: 'professional', consent: { imageProcessing: false, localStorage: true, thirdPartyProcessing: false, modelImprovement: false } })).rejects.toThrow(/consent/i);
  });

  it('creates and persists a local realistic placeholder identity', async () => {
    const provider = new AvatarProviderRegistry().resolve('local-realistic').provider;
    const model = await new PhotorealisticAvatarGenerator(provider).generate({ displayName: 'Mina', images: [image], realismLevel: 'high-realism', consent: { imageProcessing: true, localStorage: true, thirdPartyProcessing: false, modelImprovement: false } });
    saveAvatarIdentityModel(model);
    expect(loadAvatarIdentityModel()?.avatarId).toBe(model.avatarId);
    expect(model.provider).toBe('local-realistic');
    expect(model.consentStatus.modelImprovement).toBe(false);
    deleteAvatarIdentityModel();
    expect(loadAvatarIdentityModel()).toBeUndefined();
  });

  it('falls back from unavailable providers to the local provider', () => {
    const result = new AvatarProviderRegistry().resolve('ready-player-me');
    expect(result.fellBack).toBe(true);
    expect(result.provider.id).toBe('local-realistic');
  });
});
