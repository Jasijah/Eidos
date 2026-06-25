import type { PresenceActivityState } from '../presence/BehaviorSignal';
import type { PresenceMode } from '../types';

export interface BehaviorTrainingRecord {
  id: string;
  datasetId: string;
  sourceItemId: string;
  timestamp: number;
  state: PresenceActivityState;
  mode: PresenceMode;
  features: {
    blinkRate: number;
    nodRate: number;
    headYaw: number;
    headPitch: number;
    headRoll: number;
    gazeMovement: number;
    smileFrequency: number;
    expressionIntensity: number;
    postureMovement: number;
    gestureEnergy: number;
  };
  confidence: number;
  containsRawIdentity: false;
  rawMediaRetained: false;
}
