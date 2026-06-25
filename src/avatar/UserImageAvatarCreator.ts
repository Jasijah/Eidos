import type { AvatarIdentityProfile, AvatarRealismPreference } from './AvatarIdentityProfile';

export const SUPPORTED_AVATAR_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_AVATAR_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_AVATAR_IMAGES = 5;

export interface AvatarImageInput {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface AvatarCreationConsent {
  avatarCreation: boolean;
  localStorage: boolean;
  publicModelTraining: boolean;
}

export interface AvatarCreationRequest {
  images: AvatarImageInput[];
  consent: AvatarCreationConsent;
  realismPreference: AvatarRealismPreference;
}

export interface AvatarImageValidationResult {
  valid: boolean;
  errors: string[];
}

export class UserImageAvatarCreator {
  validateImages(images: Pick<AvatarImageInput, 'name' | 'type' | 'size'>[]): AvatarImageValidationResult {
    const errors: string[] = [];
    if (images.length === 0) errors.push('Select at least one image.');
    if (images.length > MAX_AVATAR_IMAGES) errors.push(`Select no more than ${MAX_AVATAR_IMAGES} images.`);
    for (const image of images) {
      if (!SUPPORTED_AVATAR_IMAGE_TYPES.includes(image.type as typeof SUPPORTED_AVATAR_IMAGE_TYPES[number])) errors.push(`${image.name} must be PNG, JPG, or WebP.`);
      if (image.size > MAX_AVATAR_IMAGE_BYTES) errors.push(`${image.name} exceeds the 2 MB local-storage limit.`);
    }
    return { valid: errors.length === 0, errors };
  }

  createProfile(request: AvatarCreationRequest, providerId = 'local-placeholder'): AvatarIdentityProfile {
    const validation = this.validateImages(request.images);
    if (!validation.valid) throw new Error(validation.errors.join(' '));
    if (!request.consent.avatarCreation) throw new Error('Avatar creation consent is required.');
    const first = request.images[0];
    const tone = approximateToneFromDataUrl(first.dataUrl);
    return {
      id: `avatar-${Date.now()}`,
      faceReferenceImage: first.dataUrl,
      sourceImageCount: request.images.length,
      skinToneApproximation: tone.skin,
      hairStyleApproximation: 'unknown',
      hairColorApproximation: tone.hair,
      facialStructure: { faceShape: 'unknown', jawWidth: 0.5, cheekboneProminence: 0.5 },
      avatarRealismPreference: request.realismPreference,
      providerId,
      assetId: `${providerId}-${Date.now()}`,
      createdTimestamp: new Date().toISOString(),
      consentStatus: { avatarCreation: true, localStorage: request.consent.localStorage, publicModelTraining: request.consent.publicModelTraining }
    };
  }

  async filesToInputs(files: File[]): Promise<AvatarImageInput[]> {
    const validation = this.validateImages(files);
    if (!validation.valid) throw new Error(validation.errors.join(' '));
    return Promise.all(files.map(async (file) => ({ name: file.name, type: file.type, size: file.size, dataUrl: await readFileAsDataUrl(file) })));
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function approximateToneFromDataUrl(dataUrl: string): { skin: string; hair: string } {
  let hash = 0;
  for (let index = 0; index < Math.min(dataUrl.length, 4000); index += 1) hash = (hash * 31 + dataUrl.charCodeAt(index)) >>> 0;
  const skinPalette = ['#b98268', '#a96f57', '#c08b70', '#8f5f4c', '#d2a184', '#7b5040'];
  const hairPalette = ['#211b19', '#382a24', '#171d1d', '#4a3328', '#6a5142'];
  return { skin: skinPalette[hash % skinPalette.length], hair: hairPalette[(hash >>> 4) % hairPalette.length] };
}
