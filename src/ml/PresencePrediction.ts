import type { BehaviorSignal } from '../presence/BehaviorSignal';

export type PresenceReasonCode =
  | 'UNIVERSAL_BASELINE'
  | 'USER_PROFILE_BLEND'
  | 'CAMERA_FEATURE_BLEND'
  | 'SPEAKING_AUDIO_DRIVE'
  | 'LISTENING_NOD'
  | 'IDLE_VARIATION'
  | 'ANTI_UNCANNY_CLAMP'
  | 'CONTEXT_LABEL_APPLIED';

export interface PresencePrediction {
  signal: BehaviorSignal;
  confidence: number;
  naturalnessScore: number;
  reasonCodes: PresenceReasonCode[];
  blendWeights: { universal: number; user: number };
}
