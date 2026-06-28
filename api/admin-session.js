import {
  ADMIN_COOKIE,
  parseCookies,
  publicSignupOnly,
  verifySession,
} from './_lib/admin-auth.js';

export default function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  const token = parseCookies(request.headers.cookie)[ADMIN_COOKIE];
  const session = verifySession(token);
  if (!session) return response.status(401).json({ authenticated: false, publicSignupOnly: publicSignupOnly() });
  return response.status(200).json({
    authenticated: true,
    email: session.email,
    expiresAt: new Date(session.exp).toISOString(),
    publicSignupOnly: publicSignupOnly(),
  });
}
