import { ShieldCheck } from 'lucide-react';

export function AvatarConsentNotice() {
  return (
    <div className="consent-notice">
      <ShieldCheck size={19} />
      <div>
        <strong>Visual avatar consent</strong>
        <p>Images create your visual stand-in only. Eidos does not clone your voice and does not use images for public model training unless you separately opt in.</p>
      </div>
    </div>
  );
}
