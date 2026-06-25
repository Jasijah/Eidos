import type { AvatarIdentityModel } from './AvatarIdentityModel';
import { deleteAvatarIdentityModel, loadAvatarIdentityModel, saveAvatarIdentityModel } from './AvatarIdentityModel';

export class AvatarIdentityManager {
  load(storage: Storage = window.localStorage): AvatarIdentityModel | undefined { return loadAvatarIdentityModel(storage); }
  save(model: AvatarIdentityModel, storage: Storage = window.localStorage): void { saveAvatarIdentityModel(model, storage); }
  delete(storage: Storage = window.localStorage): boolean { deleteAvatarIdentityModel(storage); return loadAvatarIdentityModel(storage) === undefined; }
  deleteImages(model: AvatarIdentityModel): AvatarIdentityModel { return { ...model, sourceImages: model.sourceImages.map((image) => ({ ...image, dataUrl: '', storedLocally: false })), updatedAt: new Date().toISOString() }; }
  export(model: AvatarIdentityModel): string { return JSON.stringify(model, null, 2); }
}
