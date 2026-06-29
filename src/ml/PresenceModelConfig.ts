import type { PresenceMode } from '../types';

export interface PresenceModelConfig {
  version: string;
  minimumRecords: number;
  learningRate: number;
  confidenceFloor: number;
  supportedModes: PresenceMode[];
  algorithm: 'statistical-profile-v1';
}

export const defaultPresenceModelConfig: PresenceModelConfig = {
  version: 'presence-statistical-v1',
  minimumRecords: 1,
  learningRate: 0.35,
  confidenceFloor: 0.55,
  supportedModes: ['professional', 'casual', 'creator', 'low-energy'],
  algorithm: 'statistical-profile-v1'
};
