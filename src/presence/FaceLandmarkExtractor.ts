import type { FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import type { FaceTrackingSnapshot } from '../types';
import { clamp } from '../avatar/RealismProfile';

export interface FaceLandmarkFeatures {
  blinkLeft: number;
  blinkRight: number;
  gazeX: number;
  gazeY: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  smileIntensity: number;
  expressionIntensity: number;
  confidence: number;
  source: 'mediapipe' | 'fallback';
}

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

export class FaceLandmarkExtractor {
  private landmarker?: FaceLandmarker;
  private initialization?: Promise<boolean>;
  private lastError = '';

  async initialize(): Promise<boolean> {
    if (this.landmarker) return true;
    if (this.initialization) return this.initialization;
    this.initialization = this.createLandmarker();
    return this.initialization;
  }

  async extractFromVideoFrame(video: HTMLVideoElement, timestamp = performance.now()): Promise<FaceLandmarkFeatures | undefined> {
    const ready = await this.initialize();
    if (!ready || !this.landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return undefined;
    try {
      const result = this.landmarker.detectForVideo(video, timestamp);
      return this.extractFromResult(result);
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'MediaPipe frame extraction failed';
      return undefined;
    }
  }

  extractFromResult(result: FaceLandmarkerResult): FaceLandmarkFeatures | undefined {
    const blendshapes = result.faceBlendshapes[0]?.categories;
    const landmarks = result.faceLandmarks[0];
    if (!blendshapes || !landmarks) return undefined;
    const score = (name: string) => blendshapes.find((shape) => shape.categoryName === name)?.score ?? 0;
    const matrix = result.facialTransformationMatrixes[0]?.data;
    const headYaw = matrix ? Math.atan2(matrix[8], matrix[10]) : 0;
    const headPitch = matrix ? Math.asin(clamp(-matrix[9], -1, 1)) : 0;
    const headRoll = matrix ? Math.atan2(matrix[1], matrix[5]) : 0;
    const gazeX = clamp((score('eyeLookOutLeft') + score('eyeLookInRight') - score('eyeLookInLeft') - score('eyeLookOutRight')) * 0.5, -1, 1);
    const gazeY = clamp((score('eyeLookUpLeft') + score('eyeLookUpRight') - score('eyeLookDownLeft') - score('eyeLookDownRight')) * 0.5, -1, 1);
    const smileIntensity = clamp((score('mouthSmileLeft') + score('mouthSmileRight')) * 0.5, 0, 1);
    const brow = (score('browInnerUp') + score('browOuterUpLeft') + score('browOuterUpRight')) / 3;

    return {
      blinkLeft: clamp(score('eyeBlinkLeft'), 0, 1),
      blinkRight: clamp(score('eyeBlinkRight'), 0, 1),
      gazeX,
      gazeY,
      headYaw: clamp(headYaw, -0.7, 0.7),
      headPitch: clamp(headPitch, -0.55, 0.55),
      headRoll: clamp(headRoll, -0.55, 0.55),
      smileIntensity,
      expressionIntensity: clamp(Math.max(smileIntensity, brow, score('jawOpen')), 0, 1),
      confidence: clamp(landmarks.length / 478, 0, 1),
      source: 'mediapipe'
    };
  }

  extractFromMvpSnapshot(snapshot: FaceTrackingSnapshot): FaceLandmarkFeatures {
    return {
      blinkLeft: snapshot.blinking ? 1 : 0,
      blinkRight: snapshot.blinking ? 1 : 0,
      gazeX: snapshot.gazeX ?? snapshot.headX * 0.15,
      gazeY: snapshot.gazeY ?? snapshot.headY * 0.12,
      headYaw: snapshot.headX,
      headPitch: snapshot.headY,
      headRoll: snapshot.headTilt,
      smileIntensity: snapshot.smiling ? 0.5 : 0.08,
      expressionIntensity: snapshot.expressionIntensity ?? (snapshot.smiling ? 0.5 : 0.1),
      confidence: snapshot.confidence ?? 0.42,
      source: 'fallback'
    };
  }

  getStatus(): { ready: boolean; error: string } {
    return { ready: Boolean(this.landmarker), error: this.lastError };
  }

  close(): void {
    this.landmarker?.close();
    this.landmarker = undefined;
    this.initialization = undefined;
  }

  private async createLandmarker(): Promise<boolean> {
    try {
      const visionTasks = await import('@mediapipe/tasks-vision');
      const vision = await visionTasks.FilesetResolver.forVisionTasks(WASM_ROOT);
      this.landmarker = await visionTasks.FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      return true;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'MediaPipe initialization failed';
      return false;
    }
  }
}
