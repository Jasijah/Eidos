import { UncannyValleyGuard } from '../avatar/UncannyValleyGuard';
import { clamp } from '../avatar/RealismProfile';
import { UniversalPresenceModel } from '../presence/UniversalPresenceModel';
import type { PresenceFeatureVector } from './PresenceFeatureVector';
import type { PresencePrediction, PresenceReasonCode } from './PresencePrediction';

export class BehavioralPresenceModel {
  private universal = new UniversalPresenceModel();
  private guard = new UncannyValleyGuard();

  predict(input: PresenceFeatureVector): PresencePrediction {
    const weights = blendWeights(input.trainingMaturity);
    const universal = this.universal.generate({
      timestamp: input.timestamp,
      mode: input.presenceMode,
      state: input.speechState,
      lipSync: { amplitude: input.audioEnergy, jawOpen: clamp(input.audioEnergy * 1.8, 0.02, 0.42) },
      userProfile: input.userBehaviorProfile
    });
    const user = input.userBehaviorProfile;
    const seconds = input.timestamp / 1000;
    const reasons: PresenceReasonCode[] = ['UNIVERSAL_BASELINE'];
    if (weights.user > 0.1) reasons.push('USER_PROFILE_BLEND');
    if (input.speechState === 'speaking') reasons.push('SPEAKING_AUDIO_DRIVE');
    if (input.speechState === 'listening') reasons.push('LISTENING_NOD');
    if (input.speechState === 'idle') reasons.push('IDLE_VARIATION');

    const userSignal = {
      blinkLeft: shouldBlink(input.timestamp, input.lastBlinkTime, user.blinkRate) ? 1 : 0,
      blinkRight: shouldBlink(input.timestamp, input.lastBlinkTime, user.blinkRate) ? 1 : 0,
      gazeX: Math.sin(seconds * 0.16) * (1 - user.eyeContactPreference) * 0.08,
      gazeY: Math.sin(seconds * 0.11 + 0.4) * (1 - user.eyeContactPreference) * 0.05,
      headYaw: Math.sin(seconds * 0.21) * user.headMovementIntensity * 0.16,
      headPitch: Math.sin(seconds * 0.18 + 0.8) * user.headMovementIntensity * 0.1,
      headRoll: Math.sin(seconds * 0.13) * user.headMovementIntensity * 0.12,
      nodIntensity: input.speechState === 'listening' && input.timestamp - input.lastNodTime > 2500 ? user.nodRate * 0.5 : 0,
      smileIntensity: user.smileFrequency * (input.presenceMode === 'creator' ? 0.42 : 0.26),
      browRaise: user.smileFrequency * 0.12,
      jawOpen: input.speechState === 'speaking' ? clamp(input.audioEnergy * 1.9, 0.02, 0.42) : 0.025,
      shoulderShift: Math.sin(seconds * 0.2) * user.gestureEnergy * 0.08,
      breathingMotion: 0.2 + Math.sin(seconds * 0.4) * 0.04,
      confidence: clamp(0.58 + weights.user * 0.42, 0.55, 0.94)
    };

    let signal = {
      timestamp: input.timestamp,
      blinkLeft: mix(universal.blinkLeft, userSignal.blinkLeft, weights.user),
      blinkRight: mix(universal.blinkRight, userSignal.blinkRight, weights.user),
      gazeX: mix(universal.gazeX, userSignal.gazeX, weights.user),
      gazeY: mix(universal.gazeY, userSignal.gazeY, weights.user),
      headYaw: mix(universal.headYaw, userSignal.headYaw, weights.user),
      headPitch: mix(universal.headPitch, userSignal.headPitch, weights.user),
      headRoll: mix(universal.headRoll, userSignal.headRoll, weights.user),
      nodIntensity: mix(universal.nodIntensity, userSignal.nodIntensity, weights.user),
      smileIntensity: mix(universal.smileIntensity, userSignal.smileIntensity, weights.user),
      browRaise: mix(universal.browRaise, userSignal.browRaise, weights.user),
      jawOpen: mix(universal.jawOpen, userSignal.jawOpen, weights.user),
      shoulderShift: mix(universal.shoulderShift, userSignal.shoulderShift, weights.user),
      breathingMotion: mix(universal.breathingMotion, userSignal.breathingMotion, weights.user),
      confidence: mix(universal.confidence, userSignal.confidence, weights.user)
    };

    if (input.cameraFeatures) {
      const cameraWeight = 0.72;
      signal = {
        ...signal,
        blinkLeft: mix(signal.blinkLeft, input.cameraFeatures.blinkLeft, cameraWeight),
        blinkRight: mix(signal.blinkRight, input.cameraFeatures.blinkRight, cameraWeight),
        gazeX: mix(signal.gazeX, input.cameraFeatures.gazeX, cameraWeight),
        gazeY: mix(signal.gazeY, input.cameraFeatures.gazeY, cameraWeight),
        headYaw: mix(signal.headYaw, input.cameraFeatures.headYaw, cameraWeight),
        headPitch: mix(signal.headPitch, input.cameraFeatures.headPitch, cameraWeight),
        headRoll: mix(signal.headRoll, input.cameraFeatures.headRoll, cameraWeight),
        smileIntensity: mix(signal.smileIntensity, input.cameraFeatures.smileIntensity, cameraWeight),
        browRaise: mix(signal.browRaise, input.cameraFeatures.browMovement, cameraWeight),
        jawOpen: mix(signal.jawOpen, input.cameraFeatures.jawOpen, cameraWeight),
        confidence: mix(signal.confidence, input.cameraFeatures.faceConfidence, cameraWeight)
      };
      reasons.push('CAMERA_FEATURE_BLEND');
    }

    const guarded = this.guard.constrainBehaviorSignal(signal);
    reasons.push('ANTI_UNCANNY_CLAMP');
    const naturalnessScore = clamp(0.72 + guarded.confidence * 0.2 - Math.abs(guarded.headYaw) * 0.12 - Math.max(0, guarded.smileIntensity - 0.38) * 0.2, 0.55, 0.96);
    return { signal: guarded, confidence: guarded.confidence, naturalnessScore, reasonCodes: reasons, blendWeights: weights };
  }
}

export function blendWeights(maturity: PresenceFeatureVector['trainingMaturity']): { universal: number; user: number } {
  if (maturity === 'trained') return { universal: 0.4, user: 0.6 };
  if (maturity === 'light-training') return { universal: 0.7, user: 0.3 };
  return { universal: 0.9, user: 0.1 };
}

function mix(a: number, b: number, userWeight: number): number { return a * (1 - userWeight) + b * userWeight; }
function shouldBlink(now: number, lastBlink: number, rate: number): boolean { return now - lastBlink >= 60000 / clamp(rate, 10, 22) && now - lastBlink < 60000 / clamp(rate, 10, 22) + 110; }
