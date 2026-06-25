import type { PresenceActivityState } from '../presence/BehaviorSignal';
import type { UserBehaviorProfile } from '../presence/UserBehaviorProfile';
import type { PresenceMode } from '../types';
import type { MediaPipePresenceFeatures } from '../presence/MediaPipeFeatureMapper';

export interface PresenceFeatureVector {
  timestamp: number;
  speechState: PresenceActivityState;
  audioEnergy: number;
  presenceMode: PresenceMode;
  userBehaviorProfile: UserBehaviorProfile;
  trainingMaturity: 'new-user' | 'light-training' | 'trained';
  lastBlinkTime: number;
  lastNodTime: number;
  lastExpressionChange: number;
  cameraFeatures?: MediaPipePresenceFeatures;
}
