import type { BetaPage } from '../App';

export const PUBLIC_ROUTES = new Set(['/', '/join-beta', '/signup', '/admin-login']);
export const PROTECTED_ROUTES: Record<string, BetaPage> = {
  '/app': 'live',
  '/dashboard': 'founder',
  '/admin': 'admin',
  '/settings': 'privacy',
  '/live-presence': 'live',
  '/training': 'training',
  '/presence-studio': 'avatar',
  '/privacy': 'privacy',
  '/beta-dashboard': 'dashboard',
  '/spatial-presence': 'output',
};

export function normalizeRoute(path: string) {
  const normalized = path.replace(/\/+$/, '');
  return normalized || '/';
}

export function routeAccess(path: string, authenticated: boolean) {
  const normalized = normalizeRoute(path);
  if (PUBLIC_ROUTES.has(normalized)) return 'public';
  if (normalized in PROTECTED_ROUTES) return authenticated ? 'admin' : 'redirect';
  return 'redirect';
}

export function publicSignupOnlyEnabled(value: string | undefined) {
  return value !== 'false';
}
