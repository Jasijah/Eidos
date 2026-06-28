import {
  configuredAdminEmail,
  createSession,
  publicSignupOnly,
  sessionCookie,
  verifyPassword,
} from './_lib/admin-auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  const email = String(request.body?.email ?? '').trim().toLowerCase();
  const password = String(request.body?.password ?? '');
  const configuredEmail = configuredAdminEmail();
  const configuredHash = process.env.VITE_EIDOS_ADMIN_PASSWORD_HASH ?? '';

  if (!configuredEmail || !configuredHash) {
    return response.status(503).json({ error: 'Admin access is not configured.' });
  }
  if (email !== configuredEmail || !verifyPassword(password, configuredHash)) {
    return response.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = createSession(email);
  response.setHeader('Set-Cookie', sessionCookie(token));
  return response.status(200).json({
    authenticated: true,
    email,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    publicSignupOnly: publicSignupOnly(),
  });
}
