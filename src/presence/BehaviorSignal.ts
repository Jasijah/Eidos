export type PresenceActivityState = 'speaking' | 'listening' | 'idle' | 'thinking';

export interface BehaviorSignal {
  timestamp: number;
  blinkLeft: number;
  blinkRight: number;
  gazeX: number;
  gazeY: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  nodIntensity: number;
  smileIntensity: number;
  browRaise: number;
  jawOpen: number;
  shoulderShift: number;
  breathingMotion: number;
  confidence: number;
}

export const neutralBehaviorSignal = (timestamp = 0): BehaviorSignal => ({
  timestamp,
  blinkLeft: 0,
  blinkRight: 0,
  gazeX: 0,
  gazeY: 0,
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
  nodIntensity: 0,
  smileIntensity: 0.08,
  browRaise: 0,
  jawOpen: 0.03,
  shoulderShift: 0,
  breathingMotion: 0.18,
  confidence: 0.72
});