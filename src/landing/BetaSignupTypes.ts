export type SmartGlassesInterest = 'yes' | 'maybe' | 'no';

export interface BetaSignup {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  weeklyVideoCalls: number;
  interest: string;
  smartGlassesInterest: SmartGlassesInterest;
  consentBetaUpdates: boolean;
  createdAt: string;
}

export type BetaSignupInput = Omit<BetaSignup, 'id' | 'createdAt'>;
