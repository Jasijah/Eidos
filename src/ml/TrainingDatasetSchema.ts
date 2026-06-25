import type { BehaviorSignal } from '../presence/BehaviorSignal';
import type { PresenceFeatureVector } from './PresenceFeatureVector';

export interface TrainingDatasetRow {
  input: PresenceFeatureVector;
  expectedBehaviorSignal: BehaviorSignal;
  mode: PresenceFeatureVector['presenceMode'];
  timestamp: number;
  sessionId: string;
  anonymizedUserId: string;
  consentFlag: boolean;
  datasetId: string;
  commercialUseApproved: boolean;
}

export interface TrainingDatasetSchema {
  schemaVersion: 'eidos-presence-beta-v1';
  excludesRawImages: true;
  excludesRawVideo: true;
  excludesRawAudio: true;
}

export const TRAINING_DATASET_SCHEMA: TrainingDatasetSchema = { schemaVersion: 'eidos-presence-beta-v1', excludesRawImages: true, excludesRawVideo: true, excludesRawAudio: true };
