import type { FaceTrackingSnapshot, GestureProfile } from '../types';

export class FaceTrackingService {
  private previousBrightness = 0;
  private previousY = 0;

  estimateFromFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): FaceTrackingSnapshot | undefined {
    if (!video.videoWidth || !video.videoHeight) return undefined;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return undefined;

    canvas.width = 96;
    canvas.height = 72;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;
    let brightness = 0;

    for (let y = 0; y < canvas.height; y += 3) {
      for (let x = 0; x < canvas.width; x += 3) {
        const i = (y * canvas.width + x) * 4;
        const value = (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
        brightness += value;
        if (x < canvas.width / 2) left += value;
        else right += value;
        if (y < canvas.height / 2) top += value;
        else bottom += value;
      }
    }

    const average = brightness / ((canvas.width / 3) * (canvas.height / 3));
    const headX = clamp((right - left) / 180000, -1, 1);
    const headY = clamp((bottom - top) / 160000, -1, 1);
    const headTilt = clamp((right - left) / 140000, -0.6, 0.6);
    const blinking = average < this.previousBrightness * 0.82;
    const nodding = Math.abs(headY - this.previousY) > 0.16;
    const smiling = average > this.previousBrightness * 1.04 && average > 75;

    this.previousBrightness = average || this.previousBrightness;
    this.previousY = headY;

    return { headX, headY, nodding, blinking, smiling, headTilt };
  }

  snapshotToGestureSample(snapshot: FaceTrackingSnapshot): Partial<GestureProfile> {
    return {
      nodFrequency: snapshot.nodding ? 1 : 0,
      smileFrequency: snapshot.smiling ? 1 : 0,
      headTilt: snapshot.headTilt,
      idleMovement: Math.min(1, Math.abs(snapshot.headX) + Math.abs(snapshot.headY)),
      handGestureEvents: 0
    };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
