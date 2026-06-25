import { EncryptionService, type EncryptedEnvelope } from './EncryptionService';

interface StoredRecord { key: string; envelope: EncryptedEnvelope; updatedAt: number; }
export class StorageQuotaError extends Error {}

export class SecureIndexedDBStore {
  constructor(private readonly encryption: EncryptionService, private readonly databaseName = 'eidos-secure-beta', private readonly indexedDBFactory: IDBFactory = indexedDB) {}

  async put<T>(key: string, value: T): Promise<void> {
    const envelope = await this.encryption.encrypt(value);
    const database = await this.open();
    try { await transactionPromise(database, 'readwrite', (store) => store.put({ key, envelope, updatedAt: Date.now() } satisfies StoredRecord)); }
    catch (error) { if (isQuotaError(error)) throw new StorageQuotaError('Secure storage quota exceeded. Export or delete older Eidos data.'); throw error; }
    finally { database.close(); }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const record = await this.readRecord(key);
    if (!record) return undefined;
    try { return await this.encryption.decrypt<T>(record.envelope); }
    catch { await this.delete(key); return undefined; }
  }

  async delete(key: string): Promise<boolean> {
    const database = await this.open();
    await transactionPromise(database, 'readwrite', (store) => store.delete(key));
    database.close();
    return !(await this.has(key));
  }

  async has(key: string): Promise<boolean> { return Boolean(await this.readRecord(key)); }

  async exportBackup(): Promise<{ version: 1; exportedAt: string; records: StoredRecord[] }> {
    const database = await this.open();
    const records = await transactionPromise<StoredRecord[]>(database, 'readonly', (store) => store.getAll());
    database.close();
    return { version: 1, exportedAt: new Date().toISOString(), records };
  }

  private async readRecord(key: string): Promise<StoredRecord | undefined> {
    const database = await this.open();
    const record = await transactionPromise<StoredRecord | undefined>(database, 'readonly', (store) => store.get(key));
    database.close();
    return record;
  }

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.indexedDBFactory.open(this.databaseName, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('records')) request.result.createObjectStore('records', { keyPath: 'key' }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

function transactionPromise<T = void>(database: IDBDatabase, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('records', mode);
    const request = operation(transaction.objectStore('records'));
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
function isQuotaError(error: unknown): boolean { return error instanceof DOMException && error.name === 'QuotaExceededError'; }