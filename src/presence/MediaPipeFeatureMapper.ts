import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { clamp } from '../avatar/RealismProfile';
import type { FaceTrackingSnapshot } from '../types';

export interface MediaPipePresenceFeatures {
  timestamp: number;
  blinkLeft: number;
  blinkRight: number;
  jawOpen: number;
  smileIntensity: number;
  browMovement: number;
  gazeX: number;
  gazeY: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  expressionIntensity: number;
  faceConfidence: number;
  source: 'mediapipe' | 'fallback';
}

export class MediaPipeFeatureMapper {
  mapResult(result: FaceLandmarkerResult, timestamp: number): MediaPipePresenceFeatures | undefined {
    const categories = result.faceBlendshapes[0]?.categories;
    const landmarks = result.faceLandmarks[0];
    if (!categories || !landmarks) return undefined;
    const score = (name: string) => categories.find((item) => item.categoryName === name)?.score ?? 0;
    const matrix = result.facialTransformationMatrixes[0]?.data;
    const smileIntensity = clamp((score('mouthSmileLeft') + score('mouthSmileRight')) / 2, 0, 1);
    const browMovement = clamp((score('browInnerUp') + score('browOuterUpLeft') + score('browOuterUpRight')) / 3, 0, 1);
    const jawOpen = clamp(score('jawOpen'), 0, 1);

    return {
      timestamp,
      blinkLeft: clamp(score('eyeBlinkLeft'), 0, 1),
      blinkRight: clamp(score('eyeBlinkRight'), 0, 1),
      jawOpen,
      smileIntensity,
      browMovement,
      gazeX: clamp((score('eyeLookOutLeft') + score('eyeLookInRight') - score('eyeLookInLeft') - score('eyeLookOutRight')) / 2, -1, 1),
      gazeY: clamp((score('eyeLookUpLeft') + score('eyeLookUpRight') - score('eyeLookDownLeft') - score('eyeLookDownRight')) / 2, -1, 1),
      headYaw: matrix ? clamp(Math.atan2(matrix[8], matrix[10]), -0.7, 0.7) : 0,
      headPitch: matrix ? clamp(Math.asin(clamp(-matrix[9], -1, 1)), -0.55, 0.55) : 0,
      headRoll: matrix ? clamp(Math.atan2(matrix[1], matrix[5]), -0.55, 0.55) : 0,
      expressionIntensity: clamp(Math.max(smileIntensity, browMovement, jawOpen), 0, 1),
      faceConfidence: clamp(landmarks.length / 478, 0, 1),
      source: 'mediapipe'
    };
  }

  mapFallback(snapshot: FaceTrackingSnapshot, timestamp: number): MediaPipePresenceFeatures {
    return {
      timestamp,
      blinkLeft: snapshot.blinking ? 1 : 0,
      blinkRight: snapshot.blinking ? 1 : 0,
      jawOpen: 0.03,
      smileIntensity: snapshot.smiling ? 0.5 : 0.08,
      browMovement: (snapshot.expressionIntensity ?? 0.1) * 0.35,
      gazeX: snapshot.gazeX ?? snapshot.headX * 0.15,
      gazeY: snapshot.gazeY ?? snapshot.headY * 0.12,
      headYaw: snapshot.headX,
      headPitch: snapshot.headY,
      headRoll: snapshot.headTilt,
      expressionIntensity: snapshot.expressionIntensity ?? (snapshot.smiling ? 0.5 : 0.1),
      faceConfidence: snapshot.confidence ?? 0.35,
      source: 'fallback'
    };
  }
}
