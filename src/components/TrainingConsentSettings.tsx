import type { UserTrainingConsent } from '../privacy/UserTrainingConsent';

export function TrainingConsentSettings({ consent, onChange }: { consent: UserTrainingConsent; onChange: (consent: UserTrainingConsent) => void }) {
  const update = (patch: Partial<UserTrainingConsent>) => onChange({ ...consent, ...patch, rawMediaCloudUpload: false, updatedAt: new Date().toISOString() });
  return (
    <div className="space-y-3">
      <label className="privacy-choice"><input type="checkbox" checked={consent.avatarCreationConsent} onChange={(event) => update({ avatarCreationConsent: event.target.checked })} /><span><strong>I consent to visual avatar creation</strong><small>Required before Eidos processes selected images.</small></span></label>
      <label className="privacy-choice"><input type="radio" name="image-retention" checked={consent.imageRetention === 'do-not-save'} onChange={() => update({ imageRetention: 'do-not-save' })} /><span><strong>Do not save images</strong><small>Use the identity only for this browser session.</small></span></label>
      <label className="privacy-choice"><input type="radio" name="image-retention" checked={consent.imageRetention === 'local-only'} onChange={() => update({ imageRetention: 'local-only' })} /><span><strong>Save avatar locally only</strong><small>Store the identity profile in this browser, never in the cloud.</small></span></label>
      <label className="privacy-choice"><input type="checkbox" checked={consent.behaviorRetention === 'local-only'} onChange={(event) => update({ behaviorRetention: event.target.checked ? 'local-only' : 'do-not-save' })} /><span><strong>Save behavior profile locally only</strong><small>Normalized movement statistics, not raw camera video.</small></span></label>
      <label className="privacy-choice"><input type="checkbox" checked={consent.improveEidosModels} onChange={(event) => update({ improveEidosModels: event.target.checked })} /><span><strong>Opt in to improve Eidos models</strong><small>Off by default. This does not authorize raw image, audio, or video uploads.</small></span></label>
      <div className="rounded-md border border-line bg-cloud px-3 py-2 text-xs leading-5 text-ink/55">Cloud raw-media upload: disabled. Your real microphone audio is never used for voice cloning.</div>
    </div>
  );
}
