import type { OutputFrameRate } from './OutputSettings';

export class OutputCanvasService {
  capture(canvas: HTMLCanvasElement, frameRate: OutputFrameRate): MediaStream {
    if (typeof canvas.captureStream !== 'function') throw new Error('Canvas captureStream is unavailable in this browser.');
    return canvas.captureStream(frameRate);
  }

  isCaptureSupported(canvas?: HTMLCanvasElement): boolean {
    return Boolean(canvas && typeof canvas.captureStream === 'function');
  }
}
