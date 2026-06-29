import { EncryptionService } from './EncryptionService';
import { SecureIndexedDBStore } from './SecureIndexedDBStore';

const KEY_HANDLE = 'eidos.secure-key.beta.v1';
export const SECURE_AVATAR_KEY = 'avatar-identity';
export const SECURE_BEHAVIOR_KEY = 'behavior-profile';

export interface SecureKeyBackend { kind:'os-protected'|'browser-fallback'; label:string; }
export async function getSecureKeyBackend():Promise<SecureKeyBackend>{
  if(window.eidosDesktop){const status=await window.eidosDesktop.getSecureKeyStatus();if(status.available)return{kind:'os-protected',label:status.backend};}
  return{kind:'browser-fallback',label:'Browser localStorage fallback'};
}
export async function deleteEidosSecureKey(storage:Storage=window.localStorage):Promise<boolean>{
  storage.removeItem(KEY_HANDLE); if(window.eidosDesktop)return (await window.eidosDesktop.deleteSecureKey()).deleted; return !storage.getItem(KEY_HANDLE);
}
export async function createEidosSecureStorage(storage: Storage = window.localStorage, factory: IDBFactory = indexedDB): Promise<SecureIndexedDBStore> {
  let encoded:string|undefined;
  if(window.eidosDesktop){encoded=await window.eidosDesktop.loadSecureKey();if(!encoded){const migrated=storage.getItem(KEY_HANDLE);if(migrated){const saved=await window.eidosDesktop.saveSecureKey(migrated);if(saved.saved){encoded=migrated;storage.removeItem(KEY_HANDLE);}}}}
  encoded ??= storage.getItem(KEY_HANDLE) ?? undefined;
  if (!encoded) {
    const service = await EncryptionService.create(); encoded = bytesToBase64(await service.exportRawKey());
    if(window.eidosDesktop){const saved=await window.eidosDesktop.saveSecureKey(encoded);if(!saved.saved)storage.setItem(KEY_HANDLE,encoded);}else storage.setItem(KEY_HANDLE, encoded);
    return new SecureIndexedDBStore(service, 'eidos-secure-beta', factory);
  }
  return new SecureIndexedDBStore(await EncryptionService.fromRawKey(base64ToBytes(encoded)), 'eidos-secure-beta', factory);
}
function bytesToBase64(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)); }
function base64ToBytes(value: string): Uint8Array { return Uint8Array.from(atob(value), (character) => character.charCodeAt(0)); }