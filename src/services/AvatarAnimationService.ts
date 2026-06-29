import type { AvatarFrame, FaceTrackingSnapshot, GestureProfile, PresenceMode } from '../types';
import type { LipSyncFrame } from './AudioLipSyncService';
import type { RealismProfile } from '../avatar/RealismProfile';
import { resolveRealismProfile } from '../avatar/RealismProfile';
import { UncannyValleyGuard } from '../avatar/UncannyValleyGuard';
import { BehavioralPresenceModel } from '../ml/BehavioralPresenceModel';
import type { PresencePrediction } from '../ml/PresencePrediction';
import type { MediaPipePresenceFeatures } from '../presence/MediaPipeFeatureMapper';
import { PresenceStateDetector } from '../presence/PresenceStateDetector';
import { profileFromGestureMemory, type UserBehaviorProfile } from '../presence/UserBehaviorProfile';

export class AvatarAnimationService {
  private guard = new UncannyValleyGuard();
  private stateDetector = new PresenceStateDetector();
  private behavioralModel = new BehavioralPresenceModel();
  private lastPrediction?: PresencePrediction;
  private lastBlinkTime = 0;
  private lastNodTime = 0;
  private lastExpressionChange = 0;

  composeFrame(args: { lipSync: LipSyncFrame; tracking?: FaceTrackingSnapshot; cameraFeatures?: MediaPipePresenceFeatures; gestureProfile: GestureProfile; mode: PresenceMode; voiceOnly: boolean; realism: RealismProfile; userBehaviorProfile?: UserBehaviorProfile; now: number }): AvatarFrame {
    const user = args.userBehaviorProfile ?? profileFromGestureMemory(args.gestureProfile);
    const activity = this.stateDetector.classify(args.lipSync);
    const maturity = user.trainingSessionCount >= 3 || user.samples >= 900 ? 'trained' : user.trainingSessionCount >= 1 || user.samples >= 60 ? 'light-training' : 'new-user';
    const prediction = this.behavioralModel.predict({ timestamp: args.now, speechState: activity, audioEnergy: args.lipSync.amplitude, presenceMode: args.mode, userBehaviorProfile: user, trainingMaturity: maturity, lastBlinkTime: this.lastBlinkTime, lastNodTime: this.lastNodTime, lastExpressionChange: this.lastExpressionChange, cameraFeatures: args.voiceOnly ? undefined : args.cameraFeatures });
    this.lastPrediction = prediction;
    if (prediction.signal.blinkLeft > 0.5) this.lastBlinkTime = args.now;
    if (prediction.signal.nodIntensity > 0.2) this.lastNodTime = args.now;
    if (prediction.signal.smileIntensity > 0.18 || prediction.signal.browRaise > 0.1) this.lastExpressionChange = args.now;
    const signal = prediction.signal;
    const tracking = args.tracking;
    const resolved = resolveRealismProfile(args.realism, args.mode);
    const frame: AvatarFrame = {
      mouthOpen: Math.max(args.lipSync.mouthOpen, signal.jawOpen * 0.82),
      jawOpen: Math.max(args.lipSync.jawOpen, signal.jawOpen),
      viseme: args.lipSync.viseme,
      headX: !args.voiceOnly && tracking ? tracking.headX : signal.headYaw,
      headY: !args.voiceOnly && tracking ? tracking.headY : signal.headPitch,
      blink: !args.voiceOnly && tracking ? tracking.blinking : signal.blinkLeft > 0.5,
      smile: signal.smileIntensity,
      brow: signal.browRaise,
      eyeSquint: Math.max(0.03, signal.smileIntensity * 0.2),
      eyeContact: Math.max(0.18, 0.72 - Math.abs(signal.gazeX)),
      tilt: !args.voiceOnly && tracking ? tracking.headTilt : signal.headRoll,
      idle: signal.breathingMotion,
      handGesture: signal.shoulderShift > 0.08,
      shoulderShift: signal.shoulderShift,
      posture: args.mode === 'low-energy' ? 0.38 : 0.64,
      breathing: signal.breathingMotion
    };
    return this.guard.constrainFrame(frame, resolved);
  }

  getLastPrediction(): PresencePrediction | undefined {
    return this.lastPrediction ? { ...this.lastPrediction, signal: { ...this.lastPrediction.signal }, reasonCodes: [...this.lastPrediction.reasonCodes], blendWeights: { ...this.lastPrediction.blendWeights } } : undefined;
  }
}
