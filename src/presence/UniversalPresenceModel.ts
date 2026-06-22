import { clamp } from '../avatar/RealismProfile';
import type { LipSyncFrame } from '../services/AudioLipSyncService';
import type { PresenceMode } from '../types';
import type { BehaviorSignal, PresenceActivityState } from './BehaviorSignal';
import { neutralBehaviorSignal } from './BehaviorSignal';
import { MODE_PROFILES, toUniversalPresenceMode } from './ModeProfiles';
import type { UserBehaviorProfile } from './UserBehaviorProfile';
import { blendValue, getBlendWeights } from './UserBehaviorProfile';

export interface UniversalPresenceInput {
  timestamp: number;
  mode: PresenceMode;
  state: PresenceActivityState;
  lipSync: Pick<LipSyncFrame, 'amplitude' | 'jawOpen'>;
  userProfile?: UserBehaviorProfile;
}

export class UniversalPresenceModel {
  generate(input: UniversalPresenceInput): BehaviorSignal {
    const modeProfile = MODE_PROFILES[toUniversalPresenceMode(input.mode)];
    const seconds = input.timestamp / 1000;
    const speaking = input.state === 'speaking';
    const listening = input.state === 'listening';
    const thinking = input.state === 'thinking';
    const user = input.userProfile;
    const weights = getBlendWeights(user?.samples ?? 0);

    const userBlinkRate = user?.blinkRate ?? modeProfile.blinkRate;
    const userNod = user?.nodRate ?? modeProfile.nodding;
    const userSmile = user?.smileFrequency ?? modeProfile.expressionIntensity;
    const userHead = user?.headMovementIntensity ?? modeProfile.idleMovement;
    const userEye = user?.eyeContactPreference ?? modeProfile.eyeContact;
    const userGesture = user?.gestureEnergy ?? modeProfile.gestureFrequency;
    const postureUser = user?.postureStyle === 'low-energy' ? 0.34 : user?.postureStyle === 'relaxed' ? 0.52 : 0.7;

    const blinkRate = clamp(blendValue(modeProfile.blinkRate, userBlinkRate, weights), 10, 22);
    const blinkPeriod = 60 / blinkRate;
    const blinkPhase = positiveModulo(seconds + stablePhase(user?.samples ?? 0), blinkPeriod);
    const blink = blinkPhase < 0.1;
    const activityEnergy = speaking ? 1 : listening ? 0.62 : thinking ? 0.42 : 0.28;
    const idleMovement = clamp(blendValue(modeProfile.idleMovement, userHead, weights), 0.08, 0.72);
    const gestureEnergy = clamp(blendValue(modeProfile.gestureFrequency, userGesture, weights), 0.05, 0.78);
    const expression = clamp(blendValue(modeProfile.expressionIntensity, userSmile, weights), 0.08, 0.82);
    const eyeContact = clamp(blendValue(modeProfile.eyeContact, userEye, weights), 0.28, 0.86);
    const nodBase = clamp(blendValue(modeProfile.nodding, userNod, weights), 0.04, 0.68);
    const nodPulse = listening && Math.sin(seconds * (0.65 + nodBase)) > 0.82 ? nodBase : 0;
    const breathing = 0.18 + (Math.sin(seconds * 0.42) * 0.5 + 0.5) * (0.14 + idleMovement * 0.12);

    const signal = neutralBehaviorSignal(input.timestamp);
    signal.blinkLeft = blink ? 1 : 0;
    signal.blinkRight = blink ? 1 : 0;
    signal.gazeX = clamp(Math.sin(seconds * 0.19) * 0.08 * (1 - eyeContact), -0.12, 0.12);
    signal.gazeY = clamp((thinking ? -0.05 : 0.02) + Math.sin(seconds * 0.13 + 1) * 0.03, -0.12, 0.12);
    signal.headYaw = clamp(Math.sin(seconds * 0.27) * idleMovement * 0.16, -0.22, 0.22);
    signal.headPitch = clamp(Math.sin(seconds * 0.21 + 0.8) * idleMovement * 0.1 + nodPulse * 0.1, -0.18, 0.2);
    signal.headRoll = clamp(Math.sin(seconds * 0.17 + 1.7) * idleMovement * 0.12, -0.16, 0.16);
    signal.nodIntensity = clamp(nodPulse, 0, 0.68);
    signal.smileIntensity = clamp((speaking ? 0.1 : listening ? 0.12 : 0.06) + expression * (input.mode === 'creator' ? 0.24 : 0.16), 0.04, input.mode === 'low-energy' ? 0.22 : 0.48);
    signal.browRaise = clamp((thinking ? 0.14 : speaking ? 0.05 : 0.02) + Math.sin(seconds * 0.31) * 0.025, -0.08, 0.22);
    signal.jawOpen = clamp(speaking ? input.lipSync.jawOpen : 0.025 + input.lipSync.amplitude * 0.08, 0.02, 0.42);
    signal.shoulderShift = clamp(Math.sin(seconds * 0.24) * gestureEnergy * activityEnergy * 0.08, -0.12, 0.12);
    signal.breathingMotion = clamp(breathing, 0.12, 0.42);
    signal.confidence = clamp(0.78 + weights.user * 0.1 - (input.state === 'idle' ? 0.04 : 0), 0.55, 0.92);

    return signal;
  }
}

function stablePhase(samples: number): number {
  return (samples % 19) * 0.071;
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}