import type { BehaviorSignal, PresenceActivityState } from '../presence/BehaviorSignal';
import type { PresenceMode } from '../types';
import type { BehaviorTrainingRecord } from '../data/BehaviorTrainingRecord';
import { UncannyValleyGuard } from '../avatar/UncannyValleyGuard';
import { clamp } from '../avatar/RealismProfile';
import { defaultPresenceModelConfig, type PresenceModelConfig } from './PresenceModelConfig';

export interface TrainedPresenceModel {
  version: string;
  trainedAt: string;
  recordCount: number;
  profiles: Record<string, StatisticalBehaviorProfile>;
}

export interface StatisticalBehaviorProfile {
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
  confidence: number;
}

export interface PresencePredictionRequest {
  timestamp: number;
  mode: PresenceMode;
  state: PresenceActivityState;
  audioJawOpen?: number;
}

export interface PresencePrediction {
  signal: BehaviorSignal;
  confidence: number;
  modeAdjustments: { movement: number; expression: number; posture: number };
  antiUncannyValidated: true;
}

export class PresenceModelTrainer {
  private guard = new UncannyValleyGuard();
  constructor(private config: PresenceModelConfig = defaultPresenceModelConfig) {}

  train(records: BehaviorTrainingRecord[]): TrainedPresenceModel {
    if (records.length < this.config.minimumRecords) throw new Error(`At least ${this.config.minimumRecords} behavior record is required.`);
    const buckets = new Map<string, BehaviorTrainingRecord[]>();
    for (const record of records) {
      const key = `${record.mode}:${record.state}`;
      buckets.set(key, [...(buckets.get(key) ?? []), record]);
    }
    const profiles: Record<string, StatisticalBehaviorProfile> = {};
    for (const [key, group] of buckets) profiles[key] = aggregate(group);
    return { version: this.config.version, trainedAt: new Date().toISOString(), recordCount: records.length, profiles };
  }

  predict(model: TrainedPresenceModel, request: PresencePredictionRequest): PresencePrediction {
    const exact = model.profiles[`${request.mode}:${request.state}`];
    const modeFallback = Object.entries(model.profiles).find(([key]) => key.startsWith(`${request.mode}:`))?.[1];
    const profile = exact ?? modeFallback ?? Object.values(model.profiles)[0];
    if (!profile) throw new Error('Model has no statistical profiles.');
    const modeAdjustments = modeAdjustment(request.mode);
    const seconds = request.timestamp / 1000;
    const blinkPeriod = 60 / clamp(profile.blinkRate, 10, 22);
    const blink = seconds % blinkPeriod < 0.1;
    const signal: BehaviorSignal = {
      timestamp: request.timestamp,
      blinkLeft: blink ? 1 : 0,
      blinkRight: blink ? 1 : 0,
      gazeX: Math.sin(seconds * 0.17) * profile.gazeMovement * 0.08,
      gazeY: Math.sin(seconds * 0.11 + 0.7) * profile.gazeMovement * 0.05,
      headYaw: Math.sin(seconds * 0.23) * profile.headYaw * modeAdjustments.movement,
      headPitch: Math.sin(seconds * 0.19) * profile.headPitch * modeAdjustments.movement,
      headRoll: Math.sin(seconds * 0.13) * profile.headRoll * modeAdjustments.movement,
      nodIntensity: request.state === 'listening' ? profile.nodRate * 0.5 : profile.nodRate * 0.15,
      smileIntensity: profile.smileFrequency * modeAdjustments.expression,
      browRaise: profile.expressionIntensity * 0.16,
      jawOpen: request.state === 'speaking' ? clamp(request.audioJawOpen ?? 0.12, 0.02, 0.42) : 0.025,
      shoulderShift: Math.sin(seconds * 0.21) * profile.postureMovement * modeAdjustments.movement,
      breathingMotion: 0.2 + Math.sin(seconds * 0.4) * 0.04,
      confidence: clamp(Math.max(this.config.confidenceFloor, profile.confidence), this.config.confidenceFloor, 0.94)
    };
    const guarded = this.guard.constrainBehaviorSignal(signal);
    return { signal: guarded, confidence: guarded.confidence, modeAdjustments, antiUncannyValidated: true };
  }
}

function aggregate(records: BehaviorTrainingRecord[]): StatisticalBehaviorProfile {
  const average = (read: (record: BehaviorTrainingRecord) => number) => records.reduce((sum, record) => sum + read(record), 0) / records.length;
  return {
    blinkRate: average((record) => record.features.blinkRate),
    nodRate: average((record) => record.features.nodRate),
    headYaw: average((record) => Math.abs(record.features.headYaw)),
    headPitch: average((record) => Math.abs(record.features.headPitch)),
    headRoll: average((record) => Math.abs(record.features.headRoll)),
    gazeMovement: average((record) => record.features.gazeMovement),
    smileFrequency: average((record) => record.features.smileFrequency),
    expressionIntensity: average((record) => record.features.expressionIntensity),
    postureMovement: average((record) => record.features.postureMovement),
    gestureEnergy: average((record) => record.features.gestureEnergy),
    confidence: average((record) => record.confidence)
  };
}

function modeAdjustment(mode: PresenceMode): { movement: number; expression: number; posture: number } {
  if (mode === 'creator') return { movement: 1.2, expression: 1.18, posture: 1.05 };
  if (mode === 'casual') return { movement: 1.05, expression: 1.05, posture: 0.95 };
  if (mode === 'low-energy') return { movement: 0.55, expression: 0.58, posture: 0.72 };
  return { movement: 0.78, expression: 0.8, posture: 1.08 };
}
