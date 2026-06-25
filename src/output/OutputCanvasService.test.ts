import { describe, expect, it, vi } from 'vitest';
import { OutputCanvasService } from './OutputCanvasService';
import { defaultOutputSettings, dimensionsFor } from './OutputSettings';

describe('output canvas and virtual camera settings', () => {
  it('resolves production output dimensions', () => {
    expect(dimensionsFor({ ...defaultOutputSettings, resolution: '720p' })).toEqual({ width: 1280, height: 720 });
    expect(dimensionsFor({ ...defaultOutputSettings, resolution: '1080p' })).toEqual({ width: 1920, height: 1080 });
    expect(dimensionsFor({ ...defaultOutputSettings, resolution: 'square' })).toEqual({ width: 1080, height: 1080 });
  });
  it('captures at the selected frame rate', () => {
    const stream = {} as MediaStream; const canvas = document.createElement('canvas'); const capture = vi.fn().mockReturnValue(stream);
    Object.defineProperty(canvas, 'captureStream', { value: capture });
    expect(new OutputCanvasService().capture(canvas, 30)).toBe(stream); expect(capture).toHaveBeenCalledWith(30);
  });
});