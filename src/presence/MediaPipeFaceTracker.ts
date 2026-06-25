import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import { MediaPipeFeatureMapper, type MediaPipePresenceFeatures } from './MediaPipeFeatureMapper';
import { MediaPipeAssetResolver, type MediaPipeAssetSource } from './MediaPipeAssetResolver';

export class MediaPipeFaceTracker {
  private landmarker?: FaceLandmarker;
  private initialization?: Promise<boolean>;
  private lastError = '';
  private activeSource?: MediaPipeAssetSource['id'];
  private mapper = new MediaPipeFeatureMapper();

  constructor(private readonly assetResolver = new MediaPipeAssetResolver()) {}

  async initialize(): Promise<boolean> {
    if (this.landmarker) return true;
    if (this.initialization) return this.initialization;
    this.initialization = this.create();
    return this.initialization;
  }

  async track(video: HTMLVideoElement, timestamp = performance.now()): Promise<MediaPipePresenceFeatures | undefined> {
    if (!await this.initialize() || !this.landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return undefined;
    try { return this.mapper.mapResult(this.landmarker.detectForVideo(video, timestamp), timestamp); }
    catch (error) { this.lastError = error instanceof Error ? error.message : 'MediaPipe tracking failed'; return undefined; }
  }

  status(): { available: boolean; error: string; mode: 'mediapipe' | 'fallback'; source?: MediaPipeAssetSource['id'] } {
    return { available: Boolean(this.landmarker), error: this.lastError, mode: this.landmarker ? 'mediapipe' : 'fallback', source: this.activeSource };
  }

  close(): void { this.landmarker?.close(); this.landmarker = undefined; this.initialization = undefined; this.activeSource = undefined; }

  private async create(): Promise<boolean> {
    const errors: string[] = [];
    const tasks = await import('@mediapipe/tasks-vision');
    for (const source of this.assetResolver.sources(import.meta.env.BASE_URL)) {
      try {
        const vision = await tasks.FilesetResolver.forVisionTasks(source.wasmRoot);
        this.landmarker = await tasks.FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: source.modelUrl, delegate: 'GPU' }, runningMode: 'VIDEO', numFaces: 1,
          outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true,
          minFaceDetectionConfidence: 0.5, minFacePresenceConfidence: 0.5, minTrackingConfidence: 0.5
        });
        this.activeSource = source.id;
        this.lastError = '';
        return true;
      } catch (error) { errors.push(`${source.id}: ${error instanceof Error ? error.message : 'initialization failed'}`); }
    }
    this.lastError = errors.join(' | ');
    return false;
  }
}