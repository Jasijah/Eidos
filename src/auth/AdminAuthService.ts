export interface AdminSession {
  authenticated: true;
  email: string;
  expiresAt: string;
  publicSignupOnly: boolean;
  mustChangePassword?: boolean;
}

export interface AdminPasswordRotationResult {
  passwordHash: string;
  envName: string;
  rotationFlagName: string;
  nextRotationFlagValue: string;
  message: string;
}

type Fetcher = typeof fetch;

export class AdminAuthService {
  constructor(private readonly fetcher: Fetcher = fetch) {}

  async session(): Promise<AdminSession | undefined> {
    const response = await this.fetcher('/api/admin-session', { credentials: 'include' });
    if (!response.ok) return undefined;
    return response.json() as Promise<AdminSession>;
  }

  async login(email: string, password: string): Promise<AdminSession> {
    const response = await this.fetcher('/api/admin-login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    const body = await response.json().catch(() => ({})) as Partial<AdminSession> & { error?: string };
    if (!response.ok || !body.authenticated) throw new Error(body.error ?? 'Admin login failed.');
    return body as AdminSession;
  }

  async changePassword(newPassword: string, confirmPassword: string): Promise<AdminPasswordRotationResult> {
    const response = await this.fetcher('/api/admin-change-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
    const body = await response.json().catch(() => ({})) as Partial<AdminPasswordRotationResult> & { error?: string };
    if (!response.ok || !body.passwordHash) throw new Error(body.error ?? 'Could not generate password hash.');
    return body as AdminPasswordRotationResult;
  }

  async logout(): Promise<void> {
    await this.fetcher('/api/admin-logout', { method: 'POST', credentials: 'include' });
  }
}
