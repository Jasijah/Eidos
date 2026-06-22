import type { GestureProfile, PresenceMode } from '../types';
import type { ResolvedRealismProfile } from './RealismProfile';
import { clamp } from './RealismProfile';

export interface FacialPresenceState {
  blink: boolean;
  blinkOpenness: number;
  smile: number;
  brow: number;
  eyeSquint: number;
  eyeContact: number;
  listening: number;
  thinking: number;
  microExpression: number;
}

export class FacialPresenceService {
  getBlinkRatePerMinute(realism: ResolvedRealismProfile, mode: PresenceMode): number {
    const lowEnergyAdjustment = mode === 'low-energy' ? -2 : 0;
    return clamp(realism.blinkRatePerMinute + lowEnergyAdjustment, 10, 22);
  }

  computeState(args: {
    mode: PresenceMode;
    gestureProfile: GestureProfile;
    realism: ResolvedRealismProfile;
    speaking: boolean;
    now: number;
    audioEnergy: number;
  }): FacialPresenceState {
    const seconds = args.now / 1000;
    const blinkRate = this.getBlinkRatePerMinute(args.realism, args.mode);
    const blinkPeriod = 60 / blinkRate;
    const phase = positiveModulo(seconds + this.seed(args.gestureProfile.samples), blinkPeriod);
    const blink = phase < 0.13 || (phase > blinkPeriod - 0.04 && phase < blinkPeriod);
    const listening = args.speaking ? 0.18 : 0.72 + Math.sin(seconds * 0.21) * 0.06;
    const thinking = !args.speaking && Math.sin(seconds * 0.11 + 1.4) > 0.72 ? 0.35 : 0.08;
    const lowEnergy = args.realism.lowEnergyMode || args.mode === 'low-energy';
    const baseSmile = lowEnergy ? 0.06 : args.mode === 'creator' ? 0.18 : args.mode === 'casual' ? 0.14 : 0.08;
    const smile = clamp((baseSmile + args.gestureProfile.smileFrequency * 0.2 + args.audioEnergy * 0.1) * args.realism.expressionScale, 0.03, lowEnergy ? 0.2 : 0.42);
    const brow = clamp((thinking * 0.14) - (lowEnergy ? 0.05 : 0) + Math.sin(seconds * 0.31) * 0.025, -0.16, 0.24);
    const eyeSquint = clamp(0.07 + smile * 0.24 + (lowEnergy ? 0.04 : 0), 0.03, 0.26);
    const eyeContactBase = args.realism.eyeContactStrength / 100;
    const eyeContact = clamp(eyeContactBase + Math.sin(seconds * 0.17) * 0.04 - thinking * 0.12, 0.24, 0.9);
    const microExpression = clamp(Math.sin(seconds * 0.47 + args.gestureProfile.samples) * 0.5 + 0.5, 0, 1);

    return {
      blink,
      blinkOpenness: blink ? 0.08 : 1,
      smile,
      brow,
      eyeSquint,
      eyeContact,
      listening,
      thinking,
      microExpression
    };
  }

  private seed(samples: number): number {
    return (samples % 17) * 0.137;
  }
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}