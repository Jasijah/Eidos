import { describe, expect, it } from 'vitest';
import { GestureMemoryService } from './GestureMemoryService';

function storageMock(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value)
  };
}

describe('GestureMemoryService', () => {
  it('averages gesture samples and persists them', () => {
    const service = new GestureMemoryService(storageMock());
    const first = service.updateWithSample({ nodFrequency: 1, smileFrequency: 0, headTilt: 0.4, idleMovement: 0.5 });
    const second = service.updateWithSample({ nodFrequency: 0, smileFrequency: 1, headTilt: -0.2, idleMovement: 0.1 }, first);

    expect(second.samples).toBe(2);
    expect(second.nodFrequency).toBeCloseTo(0.5);
    expect(second.smileFrequency).toBeCloseTo(0.5);
    expect(second.headTilt).toBeCloseTo(0.1);
    expect(service.load().samples).toBe(2);
  });

  it('clears stored gesture memory', () => {
    const service = new GestureMemoryService(storageMock());
    service.updateWithSample({ nodFrequency: 1 });
    const cleared = service.clear();

    expect(cleared.samples).toBe(0);
    expect(service.load().samples).toBe(0);
  });
});
