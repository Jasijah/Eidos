import type { FaceTrackingSnapshot } from '../types';

export interface FaceLandmarkFeatures {
  blinkLeft: number;
  blinkRight: number;
  gazeX: number;
  gazeY: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  smileIntensity: number;
  confidence: number;
}

export class FaceLandmarkExtractor {
  extractFromVideoFrame(_video: HTMLVideoElement): FaceLandmarkFeatures | undefined {
    return undefined;
  }

  extractFromMvpSnapshot(snapshot: FaceTrackingSnapshot): FaceLandmarkFeatures {
    return {
      blinkLeft: snapshot.blinking ? 1 : 0,
      blinkRight: snapshot.blinking ? 1 : 0,
      gazeX: snapshot.headX * 0.15,
      gazeY: snapshot.headY * 0.12,
      headYaw: snapshot.headX,
      headPitch: snapshot.headY,
      headRoll: snapshot.headTilt,
      smileIntensity: snapshot.smiling ? 0.5 : 0.08,
      confidence: 0.42
    };
  }
}