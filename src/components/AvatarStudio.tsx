import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AvatarIdentityModel, AvatarRealismLevel, AvatarSourceImage, PhotorealAvatarProviderId } from '../avatar/AvatarIdentityModel';
import { AvatarProviderRegistry } from '../avatar/AvatarProviderRegistry';
import { PhotorealisticAvatarGenerator } from '../avatar/PhotorealisticAvatarGenerator';
import type { ConsentState } from '../privacy/ConsentManager';
import { AvatarConsentNotice } from './AvatarConsentNotice';

const MIME_TYPES = new Set(['image/png','image/jpeg','image/webp']);

export function AvatarStudio({ displayName, avatar, consent, providerId, realism, onProviderChange, onRealismChange, onCreated, onDelete }: {
  displayName: string;
  avatar?: AvatarIdentityModel;
  consent: ConsentState;
  providerId: PhotorealAvatarProviderId;
  realism: AvatarRealismLevel;
  onProviderChange: (id: PhotorealAvatarProviderId) => void;
  onRealismChange: (level: AvatarRealismLevel) => void;
  onCreated: (avatar: AvatarIdentityModel) => void;
  onDelete: () => void;
}) {
  const registry = useMemo(() => new AvatarProviderRegistry(), []);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);
  const resolved = registry.resolve(providerId);

  async function generate() {
    setError('');
    if (!consent.imageProcessing) return setError('Enable image processing consent in Privacy Dashboard first.');
    if (files.length === 0) return setError('Choose at least one image.');
    if (files.length > 5) return setError('Choose no more than five images.');
    const invalid = files.find((file) => !MIME_TYPES.has(file.type) || file.size > 2 * 1024 * 1024);
    if (invalid) return setError(`${invalid.name} must be PNG/JPG/WebP and no larger than 2 MB.`);
    setBusy(true);
    try {
      const images: AvatarSourceImage[] = await Promise.all(files.map(async (file, index) => ({ id: `source-${Date.now()}-${index}`, name: file.name, mimeType: file.type as AvatarSourceImage['mimeType'], dataUrl: await readDataUrl(file), storedLocally: consent.localAvatarStorage })));
      const model = await new PhotorealisticAvatarGenerator(resolved.provider).generate({ displayName, images, realismLevel: realism, consent: { imageProcessing: consent.imageProcessing, localStorage: consent.localAvatarStorage, thirdPartyProcessing: consent.thirdPartyAvatarProcessing, modelImprovement: false } });
      onCreated(model);
      setFiles([]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Avatar generation failed.'); }
    finally { setBusy(false); }
  }

  return <div className="studio-grid">
    <section className="panel p-5"><h3 className="section-title">Identity source</h3><div className="mt-4"><AvatarConsentNotice /></div><label className="upload-drop mt-4"><ImagePlus size={24} /><span><strong>Choose face references</strong><small>1-5 PNG, JPG, or WebP images. Processed locally by default.</small></span><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label>{previews.length ? <div className="image-preview-grid">{previews.map((preview) => <figure key={preview.url}><img src={preview.url} alt={preview.name} /><figcaption>{preview.name}</figcaption></figure>)}</div> : null}{error ? <p className="mt-3 text-sm font-semibold text-coral">{error}</p> : null}</section>
    <section className="panel p-5"><h3 className="section-title">Generator</h3><label className="field-label mt-4">Avatar provider</label><div className="provider-list">{registry.list().map((provider) => <button key={provider.id} className={`provider-option ${providerId === provider.id ? 'is-active' : ''}`} onClick={() => onProviderChange(provider.id)}><span><strong>{provider.displayName}</strong><small>{provider.status().message}</small></span><em>{provider.available ? 'Ready' : 'Stub'}</em></button>)}</div><label className="field-label mt-5">Realism level</label><div className="grid grid-cols-3 gap-2">{(['standard','professional','high-realism'] as AvatarRealismLevel[]).map((level) => <button key={level} className={`mode-button capitalize ${realism === level ? 'is-active' : ''}`} onClick={() => onRealismChange(level)}>{level.replace('-',' ')}</button>)}</div>{resolved.fellBack ? <p className="mt-3 text-xs font-semibold text-coral">Selected provider is unavailable; generation will use the local realistic fallback.</p> : null}<button className="primary-button mt-5 w-full" disabled={busy || files.length === 0} onClick={() => void generate()}>{busy ? 'Generating...' : 'Generate avatar identity'}</button></section>
    <section className="panel p-5 lg:col-span-2"><div className="flex items-center justify-between gap-3"><h3 className="section-title">Generated identity</h3>{avatar ? <button className="danger-button" onClick={onDelete}><Trash2 size={16} /> Delete avatar</button> : null}</div>{avatar ? <div className="avatar-model-summary mt-4"><div className="avatar-reference">{avatar.sourceImages[0]?.dataUrl ? <img src={avatar.sourceImages[0].dataUrl} alt="Avatar reference" /> : <span>No retained image</span>}</div><div><h4>{avatar.displayName}</h4><p>{avatar.provider} · {avatar.realismLevel} · {avatar.generatedAssetUrl}</p><div className="flex gap-2"><i style={{background:avatar.skinToneApproximation}} /><i style={{background:avatar.hairApproximation.color}} /></div></div></div> : <div className="empty-studio-state mt-4">Upload images and consent to create a local realistic head-and-shoulders identity.</div>}</section>
  </div>;
}

function readDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error(`Could not read ${file.name}.`)); reader.readAsDataURL(file); }); }
