import type { FaceTrackingSnapshot, GestureProfile } from '../types';
import { MediaPipeFaceTracker } from '../presence/MediaPipeFaceTracker';
import { MediaPipeFeatureMapper, type MediaPipePresenceFeatures } from '../presence/MediaPipeFeatureMapper';

export interface FaceTrackingResult {
  snapshot: FaceTrackingSnapshot;
  features: MediaPipePresenceFeatures;
}

export class FaceTrackingService {
  private previousBrightness = 0;
  private previousY = 0;
  private tracker = new MediaPipeFaceTracker();
  private mapper = new MediaPipeFeatureMapper();

  async estimateFromFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<FaceTrackingResult | undefined> {
    if (!video.videoWidth || !video.videoHeight) return undefined;
    const mediapipe = await this.tracker.track(video);
    if (mediapipe) return { features: mediapipe, snapshot: this.featuresToSnapshot(mediapipe) };
    const snapshot = this.estimateFallback(video, canvas);
    if (!snapshot) return undefined;
    return { snapshot, features: this.mapper.mapFallback(snapshot, performance.now()) };
  }

  snapshotToGestureSample(snapshot: FaceTrackingSnapshot): Partial<GestureProfile> {
    return { nodFrequency: snapshot.nodding ? 1 : 0, smileFrequency: snapshot.smiling ? 1 : 0, headTilt: snapshot.headTilt, idleMovement: Math.min(1, Math.abs(snapshot.headX) + Math.abs(snapshot.headY)), handGestureEvents: 0 };
  }

  getExtractorStatus(): { ready: boolean; error: string; mode: 'mediapipe' | 'fallback' } {
    const status = this.tracker.status();
    return { ready: status.available, error: status.error, mode: status.mode };
  }

  private featuresToSnapshot(features: MediaPipePresenceFeatures): FaceTrackingSnapshot {
    const nodding = Math.abs(features.headPitch - this.previousY) > 0.08;
    this.previousY = features.headPitch;
    return { headX: features.headYaw, headY: features.headPitch, headTilt: features.headRoll, nodding, blinking: features.blinkLeft > 0.62 && features.blinkRight > 0.62, smiling: features.smileIntensity > 0.3, gazeX: features.gazeX, gazeY: features.gazeY, expressionIntensity: features.expressionIntensity, confidence: features.faceConfidence, source: features.source };
  }

  private estimateFallback(video: HTMLVideoElement, canvas: HTMLCanvasElement): FaceTrackingSnapshot | undefined {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return undefined;
    canvas.width = 96; canvas.height = 72;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    let left = 0; let right = 0; let top = 0; let bottom = 0; let brightness = 0;
    for (let y = 0; y < canvas.height; y += 3) for (let x = 0; x < canvas.width; x += 3) {
      const i = (y * canvas.width + x) * 4;
      const value = (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
      brightness += value;
      if (x < canvas.width / 2) left += value; else right += value;
      if (y < canvas.height / 2) top += value; else bottom += value;
    }
    const average = brightness / ((canvas.width / 3) * (canvas.height / 3));
    const headX = clamp((right - left) / 180000, -1, 1);
    const headY = clamp((bottom - top) / 160000, -1, 1);
    const snapshot: FaceTrackingSnapshot = { headX, headY, headTilt: clamp((right - left) / 140000, -0.6, 0.6), blinking: average < this.previousBrightness * 0.82, nodding: Math.abs(headY - this.previousY) > 0.16, smiling: average > this.previousBrightness * 1.04 && average > 75, confidence: 0.35, source: 'fallback' };
    this.previousBrightness = average || this.previousBrightness;
    this.previousY = headY;
    return snapshot;
  }
}

function clamp(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, value)); }
