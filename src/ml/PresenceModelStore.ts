import type { TrainedPresenceModel } from './PresenceModelTrainer';

const KEY = 'eidos.presence-model.beta.v1';

export class PresenceModelStore {
  load(storage: Storage = window.localStorage): TrainedPresenceModel | undefined {
    const raw = storage.getItem(KEY);
    if (!raw) return undefined;
    try { return JSON.parse(raw) as TrainedPresenceModel; } catch { return undefined; }
  }
  save(model: TrainedPresenceModel, storage: Storage = window.localStorage): void { storage.setItem(KEY, JSON.stringify(model)); }
  delete(storage: Storage = window.localStorage): void { storage.removeItem(KEY); }
}
