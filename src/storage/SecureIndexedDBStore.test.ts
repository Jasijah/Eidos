import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { EncryptionService } from './EncryptionService';
import { SecureIndexedDBStore } from './SecureIndexedDBStore';

describe('SecureIndexedDBStore', () => {
  beforeEach(async () => { await new Promise<void>((resolve) => { const request = indexedDB.deleteDatabase('eidos-secure-test'); request.onsuccess = () => resolve(); request.onerror = () => resolve(); }); });

  it('encrypts records and decrypts them for the caller', async () => {
    const store = new SecureIndexedDBStore(await EncryptionService.create(), 'eidos-secure-test');
    await store.put('profile', { blinkRate: 15 });
    expect(await store.get('profile')).toEqual({ blinkRate: 15 });
    const backup = await store.exportBackup();
    expect(JSON.stringify(backup)).not.toContain('blinkRate');
  });

  it('verifies deletion', async () => {
    const store = new SecureIndexedDBStore(await EncryptionService.create(), 'eidos-secure-test');
    await store.put('avatar', { private: true });
    expect(await store.delete('avatar')).toBe(true);
    expect(await store.get('avatar')).toBeUndefined();
  });

  it('removes records that cannot be decrypted with the current key', async () => {
    const first = new SecureIndexedDBStore(await EncryptionService.create(), 'eidos-secure-test');
    await first.put('profile', { smile: 0.2 });
    const second = new SecureIndexedDBStore(await EncryptionService.create(), 'eidos-secure-test');
    expect(await second.get('profile')).toBeUndefined();
    expect(await second.has('profile')).toBe(false);
  });
});