import { describe, expect, it } from 'vitest';
import { AvatarGenerationPipeline } from './AvatarGenerationPipeline';
import type { AvatarSourceImage } from './AvatarIdentityModel';
import { defaultConsentState } from '../privacy/ConsentManager';

const image: AvatarSourceImage = { id: 'front', name: 'front.jpg', mimeType: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,AA', storedLocally: true, role: 'front' };
describe('AvatarGenerationPipeline', () => {
  it('creates an identity independently of behavior and keeps model improvement disabled', async () => {
    const extractor = { extract: async () => ({ faceShape: 'oval', skinTone: '#aabbcc', eyeColor: '#334455', hairStyle: 'short', hairColor: '#111111', facialProportions: { faceWidthToHeight: 0.72, eyeSpacing: 0.31, jawWidth: 0.61 } }) };
    const pipeline = new AvatarGenerationPipeline(undefined, extractor as never);
    const result = await pipeline.generate({ displayName: 'Beta User', images: [image], providerId: 'vrm', realismLevel: 'professional', consent: { ...defaultConsentState, imageProcessing: true } });
    expect(result.model.provider).toBe('vrm'); expect(result.model.skinToneApproximation).toBe('#aabbcc'); expect(result.model.consentStatus.modelImprovement).toBe(false);
  });
});