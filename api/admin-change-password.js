import {
  ADMIN_COOKIE,
  hashPassword,
  parseCookies,
  verifySession,
} from './_lib/admin-auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

  const token = parseCookies(request.headers.cookie)[ADMIN_COOKIE];
  const session = verifySession(token);
  if (!session) return response.status(401).json({ error: 'Admin session required.' });

  const newPassword = String(request.body?.newPassword ?? '');
  const confirmPassword = String(request.body?.confirmPassword ?? '');
  if (newPassword !== confirmPassword) return response.status(400).json({ error: 'Passwords do not match.' });
  if (newPassword.length < 12) return response.status(400).json({ error: 'Password must be at least 12 characters.' });

  return response.status(200).json({
    passwordHash: hashPassword(newPassword),
    envName: 'VITE_EIDOS_ADMIN_PASSWORD_HASH',
    rotationFlagName: 'VITE_EIDOS_ADMIN_PASSWORD_CHANGE_REQUIRED',
    nextRotationFlagValue: 'false',
    message: 'Update the Vercel environment hash, set the change-required flag to false, and redeploy.',
  });
}
