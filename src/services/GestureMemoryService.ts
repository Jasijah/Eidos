import type { GestureProfile } from '../types';

const STORAGE_KEY = 'eidos.gesture-profile.v1';

export const emptyGestureProfile = (): GestureProfile => ({
  nodFrequency: 0,
  smileFrequency: 0,
  headTilt: 0,
  idleMovement: 0.18,
  handGestureEvents: 0,
  samples: 0,
  updatedAt: new Date(0).toISOString()
});

export class GestureMemoryService {
  constructor(private storage: Storage = window.localStorage) {}

  load(): GestureProfile {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return emptyGestureProfile();
    try {
      return { ...emptyGestureProfile(), ...JSON.parse(raw) };
    } catch {
      return emptyGestureProfile();
    }
  }

  save(profile: GestureProfile): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  updateWithSample(sample: Partial<GestureProfile>, current = this.load()): GestureProfile {
    const samples = current.samples + 1;
    const blend = (oldValue: number, newValue = 0) => oldValue + (newValue - oldValue) / samples;
    const next: GestureProfile = {
      nodFrequency: blend(current.nodFrequency, sample.nodFrequency),
      smileFrequency: blend(current.smileFrequency, sample.smileFrequency),
      headTilt: blend(current.headTilt, sample.headTilt),
      idleMovement: blend(current.idleMovement, sample.idleMovement),
      handGestureEvents: current.handGestureEvents + (sample.handGestureEvents ?? 0),
      samples,
      updatedAt: new Date().toISOString()
    };
    this.save(next);
    return next;
  }

  addHandGestureEvent(current = this.load()): GestureProfile {
    return this.updateWithSample({ handGestureEvents: 1 }, current);
  }

  clear(): GestureProfile {
    this.storage.removeItem(STORAGE_KEY);
    return emptyGestureProfile();
  }
}
