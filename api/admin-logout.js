import { clearSessionCookie } from './_lib/admin-auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  response.setHeader('Set-Cookie', clearSessionCookie());
  return response.status(200).json({ authenticated: false });
}
