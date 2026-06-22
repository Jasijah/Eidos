import type { AvatarFrame, GestureProfile, PresenceMode } from '../types';
import type { BehaviorSignal } from '../presence/BehaviorSignal';
import type { ResolvedRealismProfile } from './RealismProfile';
import { clamp } from './RealismProfile';

export class UncannyValleyGuard {
  constrainFrame(frame: AvatarFrame, realism: ResolvedRealismProfile): AvatarFrame {
    return {
      ...frame,
      mouthOpen: clamp(frame.mouthOpen, 0.03, realism.mouthRange),
      smile: clamp(frame.smile, 0.04, realism.lowEnergyMode ? 0.22 : 0.46 * realism.expressionScale + 0.06),
      brow: clamp(frame.brow ?? 0, -0.32, 0.34),
      eyeSquint: clamp(frame.eyeSquint ?? 0.06, 0.02, 0.38),
      eyeContact: clamp(frame.eyeContact ?? 0.65, 0.18, 0.92),
      headX: clamp(frame.headX, -0.28 * realism.headRange, 0.28 * realism.headRange),
      headY: clamp(frame.headY, -0.22 * realism.headRange, 0.24 * realism.headRange),
      tilt: clamp(frame.tilt, -0.28 * realism.headRange, 0.28 * realism.headRange),
      shoulderShift: clamp(frame.shoulderShift ?? 0, -0.18 * realism.motionScale, 0.18 * realism.motionScale),
      posture: clamp(frame.posture ?? realism.postureLift, 0.18, 0.82),
      idle: clamp(frame.idle, 0.04, 0.42 * realism.motionScale)
    };
  }

  constrainGestureProfile(profile: GestureProfile, intensity: number): GestureProfile {
    const intensityScale = clamp(intensity / 60, 0.2, 1.25);
    return {
      ...profile,
      nodFrequency: clamp(profile.nodFrequency * intensityScale, 0, 0.72),
      smileFrequency: clamp(profile.smileFrequency * intensityScale, 0, 0.64),
      headTilt: clamp(profile.headTilt * intensityScale, -0.34, 0.34),
      idleMovement: clamp(profile.idleMovement * intensityScale, 0.04, 0.38),
      handGestureEvents: Math.min(profile.handGestureEvents, 24)
    };
  }

  blinkRateForMode(rate: number, mode: PresenceMode): number {
    const modeAdjusted = mode === 'low-energy' ? rate * 0.86 : rate;
    return clamp(modeAdjusted, 10, 22);
  }

  constrainBehaviorSignal(signal: BehaviorSignal): BehaviorSignal {
    return {
      ...signal,
      blinkLeft: clamp(signal.blinkLeft, 0, 1),
      blinkRight: clamp(signal.blinkRight, 0, 1),
      gazeX: clamp(signal.gazeX, -0.16, 0.16),
      gazeY: clamp(signal.gazeY, -0.14, 0.14),
      headYaw: clamp(signal.headYaw, -0.22, 0.22),
      headPitch: clamp(signal.headPitch, -0.18, 0.2),
      headRoll: clamp(signal.headRoll, -0.16, 0.16),
      nodIntensity: clamp(signal.nodIntensity, 0, 0.68),
      smileIntensity: clamp(signal.smileIntensity, 0.04, 0.5),
      browRaise: clamp(signal.browRaise, -0.1, 0.24),
      jawOpen: clamp(signal.jawOpen, 0.02, 0.42),
      shoulderShift: clamp(signal.shoulderShift, -0.12, 0.12),
      breathingMotion: clamp(signal.breathingMotion, 0.12, 0.42),
      confidence: clamp(signal.confidence, 0.45, 0.94)
    };
  }
}