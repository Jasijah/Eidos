export interface MediaPipeAssetSource { id: 'local' | 'pinned-cdn'; wasmRoot: string; modelUrl: string; }
export const MEDIAPIPE_VERSION = '0.10.35';

export class MediaPipeAssetResolver {
  sources(baseUrl = '/'): MediaPipeAssetSource[] {
    const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return [
      { id: 'local', wasmRoot: `${root}mediapipe/wasm`, modelUrl: `${root}mediapipe/face_landmarker.task` },
      { id: 'pinned-cdn', wasmRoot: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`, modelUrl: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' }
    ];
  }
}