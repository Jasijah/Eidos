import type { AvatarFrame, FaceTrackingSnapshot, GestureProfile, PresenceMode } from '../types';
import type { LipSyncFrame } from './AudioLipSyncService';
import type { RealismProfile } from '../avatar/RealismProfile';
import { resolveRealismProfile } from '../avatar/RealismProfile';
import { FacialPresenceService } from '../avatar/FacialPresenceService';
import { UncannyValleyGuard } from '../avatar/UncannyValleyGuard';
import { PresenceModeService } from './PresenceModeService';
import { PresenceStateDetector } from '../presence/PresenceStateDetector';
import { UniversalPresenceModel } from '../presence/UniversalPresenceModel';
import { profileFromGestureMemory } from '../presence/UserBehaviorProfile';

export class AvatarAnimationService {
  private presence = new PresenceModeService();
  private facialPresence = new FacialPresenceService();
  private guard = new UncannyValleyGuard();
  private stateDetector = new PresenceStateDetector();
  private universalPresence = new UniversalPresenceModel();

  composeFrame(args: {
    lipSync: LipSyncFrame;
    tracking?: FaceTrackingSnapshot;
    gestureProfile: GestureProfile;
    mode: PresenceMode;
    voiceOnly: boolean;
    realism: RealismProfile;
    now: number;
  }): AvatarFrame {
    const resolved = resolveRealismProfile(args.realism, args.mode);
    const guardedProfile = this.guard.constrainGestureProfile(args.gestureProfile, args.realism.gestureIntensity);
    const activityState = this.stateDetector.classify(args.lipSync);
    const behaviorSignal = this.guard.constrainBehaviorSignal(
      this.universalPresence.generate({
        timestamp: args.now,
        mode: args.mode,
        state: activityState,
        lipSync: args.lipSync,
        userProfile: profileFromGestureMemory(guardedProfile)
      })
    );
    const behavior = this.presence.computeBehavior(args.mode, guardedProfile, args.now, resolved);
    const facial = this.facialPresence.computeState({
      mode: args.mode,
      gestureProfile: guardedProfile,
      realism: resolved,
      speaking: activityState === 'speaking',
      audioEnergy: args.lipSync.amplitude,
      now: args.now
    });
    const tracking = args.tracking;
    const useCameraBehavior = !args.voiceOnly && args.realism.cameraTrainedBehavior;

    const frame: AvatarFrame = {
      mouthOpen: Math.max(args.lipSync.mouthOpen, behaviorSignal.jawOpen * 0.78),
      jawOpen: Math.max(args.lipSync.jawOpen, behaviorSignal.jawOpen),
      viseme: args.lipSync.viseme,
      headX: useCameraBehavior ? tracking?.headX ?? behaviorSignal.headYaw : behaviorSignal.headYaw + behavior.headX * 0.35,
      headY: useCameraBehavior ? tracking?.headY ?? behaviorSignal.headPitch : behaviorSignal.headPitch + behavior.headY * 0.35,
      blink: useCameraBehavior ? tracking?.blinking ?? behaviorSignal.blinkLeft > 0.5 : behaviorSignal.blinkLeft > 0.5,
      smile: useCameraBehavior && tracking?.smiling ? Math.max(facial.smile, behaviorSignal.smileIntensity, 0.2) : Math.max(facial.smile, behaviorSignal.smileIntensity),
      brow: Math.max(facial.brow, behaviorSignal.browRaise),
      eyeSquint: facial.eyeSquint,
      eyeContact: behaviorSignal.confidence > 0.5 ? 0.5 + behaviorSignal.confidence * 0.32 : facial.eyeContact,
      tilt: useCameraBehavior ? tracking?.headTilt ?? behaviorSignal.headRoll : behaviorSignal.headRoll + behavior.tilt * 0.35,
      idle: Math.max(behavior.idle, behaviorSignal.breathingMotion * 0.42),
      handGesture: behavior.handGesture,
      shoulderShift: behaviorSignal.shoulderShift + behavior.shoulderShift * 0.25,
      posture: behavior.posture,
      breathing: behaviorSignal.breathingMotion
    };

    return this.guard.constrainFrame(frame, resolved);
  }
}