import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminAuthService, type AdminSession } from './AdminAuthService';

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
  return session ? children(session) : null;
}
