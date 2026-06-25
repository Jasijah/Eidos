export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  const webhook = process.env.EIDOS_BETA_SIGNUP_WEBHOOK_URL;
  if (!webhook) return response.status(503).json({ error: 'Beta signup delivery is not configured.' });
  const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  if (!body?.name?.trim() || !/^\S+@\S+\.\S+$/.test(body?.email ?? '')) return response.status(400).json({ error: 'Name and valid email are required.' });
  const upstream = await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ source: 'eidos-closed-beta', receivedAt: new Date().toISOString(), ...body }) });
  if (!upstream.ok) return response.status(502).json({ error: 'Beta signup delivery failed.' });
  return response.status(202).json({ accepted: true });
}
