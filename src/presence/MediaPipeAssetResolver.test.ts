import { describe, expect, it } from 'vitest';
import { MEDIAPIPE_VERSION, MediaPipeAssetResolver } from './MediaPipeAssetResolver';

describe('MediaPipeAssetResolver', () => {
  it('prefers locally hosted pinned assets and retains a pinned fallback', () => {
    const sources = new MediaPipeAssetResolver().sources('/eidos/');
    expect(sources[0]).toMatchObject({ id: 'local', modelUrl: '/eidos/mediapipe/face_landmarker.task' });
    expect(sources[1].wasmRoot).toContain(MEDIAPIPE_VERSION);
    expect(sources[1].modelUrl).not.toContain('/latest/');
  });
});