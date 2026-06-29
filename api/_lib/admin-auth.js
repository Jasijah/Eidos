import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'eidos_admin_session';
export const SESSION_TTL_SECONDS = 8 * 60 * 60;
const HASH_ITERATIONS = 210000;
const HASH_BYTES = 32;

function encode(value) {
  return Buffer.from(value).toString('base64url');
}

function decode(value) {
  return Buffer.from(value, 'base64url');
}

export function hashPassword(password, salt = randomBytes(16)) {
  if (typeof password !== 'string' || password.length < 12) {
    throw new Error('Admin password must be at least 12 characters.');
  }
  const digest = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_BYTES, 'sha256');
  return `pbkdf2_sha256$${HASH_ITERATIONS}$${encode(salt)}$${encode(digest)}`;
}

export function verifyPassword(password, encodedHash) {
  try {
    const [algorithm, iterationsRaw, saltRaw, digestRaw] = encodedHash.split('$');
    if (algorithm !== 'pbkdf2_sha256') return false;
    const iterations = Number(iterationsRaw);
    if (!Number.isSafeInteger(iterations) || iterations < 100000) return false;
    const expected = decode(digestRaw);
    const actual = pbkdf2Sync(password, decode(saltRaw), iterations, expected.length, 'sha256');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function configuredAdminEmail() {
  return (process.env.VITE_EIDOS_ADMIN_EMAIL ?? '').trim().toLowerCase();
}

export function publicSignupOnly() {
  return process.env.VITE_EIDOS_PUBLIC_SIGNUP_ONLY !== 'false';
}

export function passwordChangeRequired() {
  return process.env.VITE_EIDOS_ADMIN_PASSWORD_CHANGE_REQUIRED === 'true';
}

function sessionKey() {
  return process.env.VITE_EIDOS_ADMIN_PASSWORD_HASH ?? '';
}

export function createSession(email, now = Date.now()) {
  const key = sessionKey();
  if (!key) throw new Error('Admin authentication is not configured.');
  const payload = encode(JSON.stringify({
    email: email.toLowerCase(),
    exp: now + SESSION_TTL_SECONDS * 1000,
    mustChangePassword: passwordChangeRequired(),
    nonce: encode(randomBytes(12)),
  }));
  const signature = createHmac('sha256', key).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySession(token, now = Date.now()) {
  try {
    const key = sessionKey();
    if (!key || !token) return undefined;
    const [payload, signature] = token.split('.');
    const expected = createHmac('sha256', key).update(payload).digest();
    const actual = decode(signature);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return undefined;
    const parsed = JSON.parse(decode(payload).toString('utf8'));
    if (parsed.exp <= now || parsed.email !== configuredAdminEmail()) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const index = part.indexOf('=');
    if (index < 0) return ['', ''];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

export function sessionCookie(token) {
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
