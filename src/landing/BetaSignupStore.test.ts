import { describe, expect, it } from 'vitest';
import { BetaSignupStore } from './BetaSignupStore';
const valid={name:'A User',email:'A@Example.com',role:'Founder',company:'Eidos',weeklyVideoCalls:10,interest:'Camera-free meetings',smartGlassesInterest:'yes' as const,consentBetaUpdates:true};
describe('BetaSignupStore',()=>{it('validates, stores, and exports beta signups',()=>{localStorage.clear();const store=new BetaSignupStore();expect(()=>store.save({...valid,email:'bad'})).toThrow();expect(()=>store.save({...valid,consentBetaUpdates:false})).toThrow();store.save(valid);expect(store.list()[0].email).toBe('a@example.com');expect(store.exportCsv()).toContain('smartGlassesInterest');expect(store.exportCsv()).toContain('a@example.com')})});
