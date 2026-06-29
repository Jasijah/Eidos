import { useMemo, useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { AdminAuthService, type AdminPasswordRotationResult, type AdminSession } from '../auth/AdminAuthService';
import { EidosLogo } from '../brand/EidosLogo';

export function AdminPasswordChangePage({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const service = useMemo(() => new AdminAuthService(), []);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState<AdminPasswordRotationResult>();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setStatus('');
    setResult(undefined);
    try {
      const rotation = await service.changePassword(newPassword, confirmPassword);
      setResult(rotation);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not rotate admin password.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await service.logout();
    onLogout();
  };

  return <main className="admin-login-page"><header className="public-nav"><button className="brand-button" aria-label="Eidos"><EidosLogo /></button><nav><button className="nav-text-button" onClick={() => void logout()}><LogOut size={15} />Log out</button></nav></header><section className="admin-login-shell"><div className="admin-login-copy"><KeyRound /><p className="public-section-label">Password rotation required</p><h1>Change the temporary admin password</h1><p>You are signed in as {session.email}. Create a permanent password now. Eidos will generate the secure hash to place in Vercel, then you can redeploy and sign in with the new password.</p></div><form className="admin-login-form" onSubmit={event => { event.preventDefault(); void submit(); }}><label><span className="field-label">New admin password</span><input className="text-input" type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label><label><span className="field-label">Confirm new password</span><input className="text-input" type="password" autoComplete="new-password" minLength={12} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label><button className="public-cta" type="submit" disabled={busy}>{busy ? 'Generating hash...' : 'Generate replacement hash'}</button>{status ? <p className="signup-status is-error" aria-live="polite">{status}</p> : null}{result ? <div className="password-rotation-result" aria-live="polite"><p className="field-label">Set these Vercel environment values, then redeploy:</p><code>{result.envName}={result.passwordHash}</code><code>{result.rotationFlagName}={result.nextRotationFlagValue}</code><p>{result.message}</p></div> : null}</form></section></main>;
}
