import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminAuthService, type AdminSession } from './AdminAuthService';
import { AdminPasswordChangePage } from '../pages/AdminPasswordChangePage';

export function AdminRoute({
  children,
  onDenied,
}: {
  children: (session: AdminSession) => ReactNode;
  onDenied: () => void;
}) {
  const service = useMemo(() => new AdminAuthService(), []);
  const [session, setSession] = useState<AdminSession>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void service.session().then((value) => {
      if (!active) return;
      if (value) setSession(value);
      else onDenied();
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [onDenied, service]);

  if (loading) return <main className="auth-loading" aria-live="polite">Verifying admin access...</main>;
  if (!session) return null;
  if (session.mustChangePassword) return <AdminPasswordChangePage session={session} onLogout={onDenied} />;
  return children(session);
}
