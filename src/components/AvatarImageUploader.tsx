import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AvatarIdentityProfile, AvatarRealismPreference } from '../avatar/AvatarIdentityProfile';
import { LocalPlaceholderAvatarProvider } from '../avatar/providers/LocalPlaceholderAvatarProvider';
import { UserImageAvatarCreator } from '../avatar/UserImageAvatarCreator';
import type { UserTrainingConsent } from '../privacy/UserTrainingConsent';
import { AvatarConsentNotice } from './AvatarConsentNotice';

interface AvatarImageUploaderProps {
  consent: UserTrainingConsent;
  realismPreference: AvatarRealismPreference;
  profile?: AvatarIdentityProfile;
  onCreated: (profile: AvatarIdentityProfile) => void;
  onDelete: () => void;
}

const creator = new UserImageAvatarCreator();
const provider = new LocalPlaceholderAvatarProvider();

export function AvatarImageUploader({ consent, realismPreference, profile, onCreated, onDelete }: AvatarImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  async function createAvatar() {
    setError('');
    const validation = creator.validateImages(files);
    if (!validation.valid) return setError(validation.errors.join(' '));
    if (!consent.avatarCreationConsent) return setError('Confirm visual avatar consent before creating an avatar.');
    setProcessing(true);
    try {
      const images = await creator.filesToInputs(files);
      const created = await provider.createAvatarFromImages({
        images,
        realismPreference,
        consent: {
          avatarCreation: consent.avatarCreationConsent,
          localStorage: consent.imageRetention === 'local-only',
          publicModelTraining: false
        }
      });
      onCreated(created);
      setFiles([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Avatar creation failed.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <AvatarConsentNotice />
      <label className="upload-drop mt-4">
        <ImagePlus size={24} />
        <span><strong>Choose avatar images</strong><small>PNG, JPG, or WebP. Up to 5 images, 2 MB each.</small></span>
        <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
      </label>
      {previews.length > 0 ? <div className="image-preview-grid">{previews.map((preview) => <figure key={preview.url}><img src={preview.url} alt={preview.name} /><figcaption>{preview.name}</figcaption></figure>)}</div> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-coral">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="primary-button" disabled={processing || files.length === 0} onClick={() => void createAvatar()}>{processing ? 'Creating...' : 'Create local avatar'}</button>
        {profile ? <button className="danger-button" onClick={onDelete}><Trash2 size={16} /> Delete avatar data</button> : null}
      </div>
      {profile ? <div className="identity-summary mt-4"><img src={profile.faceReferenceImage} alt="Avatar face reference" /><div><strong>Local identity profile</strong><p>{profile.sourceImageCount} source image{profile.sourceImageCount === 1 ? '' : 's'} · {profile.avatarRealismPreference}</p><span style={{ background: profile.skinToneApproximation }} aria-label="Skin tone approximation" /></div></div> : null}
    </div>
  );
}

