import type { BetaSignup, BetaSignupInput } from './BetaSignupTypes';

const KEY = 'eidos.beta.signups.v2';

export class BetaSignupStore {
  constructor(private readonly storage: Storage = window.localStorage) {}

  list(): BetaSignup[] {
    try { return JSON.parse(this.storage.getItem(KEY) ?? '[]') as BetaSignup[]; }
    catch { return []; }
  }

  save(input: BetaSignupInput): BetaSignup {
    if (!input.name.trim() || !/^\S+@\S+\.\S+$/.test(input.email)) throw new Error('Name and a valid email are required.');
    if (!input.role.trim() || !input.interest.trim()) throw new Error('Role and interest are required.');
    if (!input.consentBetaUpdates) throw new Error('Consent is required to receive beta updates.');
    const value: BetaSignup = { ...input, email: input.email.trim().toLowerCase(), id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    this.storage.setItem(KEY, JSON.stringify([...this.list(), value]));
    return value;
  }

  exportCsv() {
    const header = ['name','email','role','company','weeklyVideoCalls','interest','smartGlassesInterest','consentBetaUpdates','createdAt'].join(',');
    return [header, ...this.list().map((signup) => [signup.name, signup.email, signup.role, signup.company ?? '', signup.weeklyVideoCalls, signup.interest, signup.smartGlassesInterest, signup.consentBetaUpdates, signup.createdAt].map(csv).join(','))].join('\n');
  }
}

function csv(value: unknown) { return `"${String(value).replaceAll('"', '""')}"`; }
