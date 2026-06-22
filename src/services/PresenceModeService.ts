import type { GestureProfile, PresenceMode } from '../types';
import type { ResolvedRealismProfile } from '../avatar/RealismProfile';
import { clamp } from '../avatar/RealismProfile';

export interface PresenceBehavior {
  headX: number;
  headY: number;
  blink: boolean;
  smile: number;
  tilt: number;
  idle: number;
  handGesture: boolean;
  mouthAssist: number;
  shoulderShift: number;
  posture: number;
  breathing: number;
}

const MODE_SETTINGS: Record<PresenceMode, { energy: number; smile: number; tilt: number; gesture: number; nod: number }> = {
  professional: { energy: 0.38, smile: 0.26, tilt: 0.42, gesture: 0.18, nod: 0.42 },
  casual: { energy: 0.56, smile: 0.42, tilt: 0.62, gesture: 0.42, nod: 0.58 },
  creator: { energy: 0.68, smile: 0.52, tilt: 0.7, gesture: 0.58, nod: 0.64 },
  'low-energy': { energy: 0.18, smile: 0.14, tilt: 0.22, gesture: 0.06, nod: 0.22 }
};

export class PresenceModeService {
  computeBehavior(mode: PresenceMode, profile: GestureProfile, now: number, realism?: ResolvedRealismProfile): PresenceBehavior {
    const settings = MODE_SETTINGS[mode];
    const seconds = now / 1000;
    const realismMotion = realism?.motionScale ?? 0.6;
    const realismHead = realism?.headRange ?? 0.48;
    const idle = clamp(Math.max(0.04, profile.idleMovement) * settings.energy * realismMotion, 0.03, 0.32);
    const nodLikelihood = clamp(profile.nodFrequency * settings.nod, 0, 0.54);
    const nodWindow = Math.sin(seconds * (0.34 + nodLikelihood)) > 0.86 ? nodLikelihood : 0;
    const headX = Math.sin(seconds * 0.27 + profile.samples * 0.11) * idle * 0.36;
    const headY = Math.sin(seconds * 1.7) * nodWindow * 0.18 * realismHead + Math.sin(seconds * 0.19) * idle * 0.16;
    const tilt = (profile.headTilt * 0.42 + Math.sin(seconds * 0.23) * 0.08 * settings.tilt) * realismHead;
    const smile = clamp(profile.smileFrequency * settings.smile + (mode === 'creator' ? 0.08 : 0.03), 0.02, 0.38);
    const blink = Math.floor(seconds * 1.23 + profile.samples) % 11 === 0;
    const handGesture = profile.handGestureEvents > 0 && Math.sin(seconds * 0.17 + profile.handGestureEvents) > 0.94 && settings.gesture > 0.1;
    const breathing = Math.sin(seconds * 0.42) * 0.5 + 0.5;

    return {
      headX,
      headY,
      blink,
      smile,
      tilt,
      idle,
      handGesture,
      mouthAssist: mode === 'low-energy' ? 0.015 : 0.025,
      shoulderShift: Math.sin(seconds * 0.31) * idle * 0.42,
      posture: clamp((realism?.postureLift ?? 0.6) + (mode === 'low-energy' ? -0.18 : 0.02), 0.18, 0.82),
      breathing
    };
  }

  shouldDisableCameraAfterTraining(trainingComplete: boolean): boolean {
    return trainingComplete;
  }
}