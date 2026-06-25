import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSecureKeyBackend, type SecureKeyBackend } from '../storage/EidosSecureStorage';
import type { AvatarIdentityModel } from '../avatar/AvatarIdentityModel';
import type { UserBehaviorProfile } from '../presence/UserBehaviorProfile';
import type { ConsentState } from '../privacy/ConsentManager';
import { resolveAvatarDataPolicy } from '../privacy/AvatarDataPolicy';
import { resolveBehaviorDataPolicy } from '../privacy/BehaviorDataPolicy';

export function PrivacyDashboard({ consent, onConsentChange, avatar, behaviorProfile, onDeleteImages, onDeleteAvatar, onDeleteBehavior, onDeleteAll, onExport }: {
  consent: ConsentState;
  onConsentChange: (next: ConsentState) => void;
  avatar?: AvatarIdentityModel;
  behaviorProfile: UserBehaviorProfile;
  onDeleteImages: () => void;
  onDeleteAvatar: () => void;
  onDeleteBehavior: () => void;
  onDeleteAll: () => void;
  onExport: () => void;
}) {
  const avatarPolicy = resolveAvatarDataPolicy(consent);
  const [keyBackend,setKeyBackend]=useState<SecureKeyBackend>({kind:'browser-fallback',label:'Checking...'});
  useEffect(()=>{void getSecureKeyBackend().then(setKeyBackend);},[]);
  const behaviorPolicy = resolveBehaviorDataPolicy(consent);
  const update = (patch: Partial<ConsentState>) => onConsentChange({ ...consent, ...patch, updatedAt: new Date().toISOString() });
  return (
    <div className="privacy-dashboard-grid">
      <section className="panel p-5">
        <div className="flex items-center gap-2"><ShieldCheck size={19} className="text-teal" /><h3 className="section-title">Privacy controls</h3></div>
        <div className="mt-4 space-y-3">
          <ToggleChoice label="Local-only mode" detail="Blocks third-party avatar processing and cloud media upload." checked={consent.localOnlyMode} onChange={(checked) => update({ localOnlyMode: checked, thirdPartyAvatarProcessing: checked ? false : consent.thirdPartyAvatarProcessing })} />
          <ToggleChoice label="Allow local image processing" detail="Required to generate an avatar identity." checked={consent.imageProcessing} onChange={(checked) => update({ imageProcessing: checked })} />
          <ToggleChoice label="Store avatar locally" detail="Keeps source images and avatar profile in this browser." checked={consent.localAvatarStorage} onChange={(checked) => update({ localAvatarStorage: checked })} />
          <ToggleChoice label="Store behavior profile locally" detail="Stores summarized movement patterns, never raw video." checked={consent.behaviorStorage} onChange={(checked) => update({ behaviorStorage: checked })} />
          <ToggleChoice label="Improve Eidos models" detail="Exports normalized records only after license approval." checked={consent.modelImprovement} onChange={(checked) => update({ modelImprovement: checked })} />
          <ToggleChoice label="Third-party avatar generation" detail="Separate explicit opt-in. Disabled while local-only mode is active." checked={consent.thirdPartyAvatarProcessing} disabled={consent.localOnlyMode} onChange={(checked) => update({ thirdPartyAvatarProcessing: checked })} />
        </div>
      </section>
      <section className="panel p-5">
        <h3 className="section-title">Data stored</h3>
        <div className="mt-4 data-inventory">
          <InventoryRow label="Avatar profile" value={avatar ? 'Stored' : 'None'} />
          <InventoryRow label="Source images" value={avatar?.sourceImages.some((image) => image.dataUrl) ? `${avatar.sourceImages.length} local` : 'None'} />
          <InventoryRow label="Behavior samples" value={String(behaviorProfile.samples)} />
          <InventoryRow label="Raw audio" value="Never stored" />
          <InventoryRow label="Raw training video" value="Never stored" />
          <InventoryRow label="Cloud upload" value="Disabled" /><InventoryRow label="Encryption key" value={keyBackend.label} />
        </div>
        <div className="mt-5 rounded-md bg-cloud p-3 text-xs leading-5 text-ink/60">Avatar: {avatarPolicy.imageStorage}; third-party transfer: {avatarPolicy.thirdPartyTransfer}. Behavior: {behaviorPolicy.profileStorage}; model improvement: {behaviorPolicy.modelImprovement}.</div>
      </section>
      <section className="panel p-5 lg:col-span-2">
        <h3 className="section-title">Export and deletion</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="secondary-button" onClick={onExport}><Download size={16} /> Export my data</button>
          <button className="danger-button" onClick={onDeleteImages}><Trash2 size={16} /> Delete images</button>
          <button className="danger-button" onClick={onDeleteAvatar}><Trash2 size={16} /> Delete avatar profile</button>
          <button className="danger-button" onClick={onDeleteBehavior}><Trash2 size={16} /> Delete behavior memory</button>
          <button className="danger-button" onClick={onDeleteAll}><Trash2 size={16} /> Delete everything</button>
        </div>
      </section>
    </div>
  );
}

function ToggleChoice({ label, detail, checked, disabled = false, onChange }: { label: string; detail: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return <label className={`privacy-choice ${disabled ? 'opacity-50' : ''}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span><strong>{label}</strong><small>{detail}</small></span></label>;
}
function InventoryRow({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
