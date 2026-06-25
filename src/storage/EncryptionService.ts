export interface EncryptedEnvelope { version: 1; iv: string; ciphertext: string; }

export class EncryptionService {
  constructor(private readonly key: CryptoKey) {}

  static async create(): Promise<EncryptionService> {
    return new EncryptionService(await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']));
  }

  static async fromRawKey(raw: Uint8Array): Promise<EncryptionService> {
    return new EncryptionService(await crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt']));
  }

  async exportRawKey(): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.exportKey('raw', this.key));
  }

  async encrypt(value: unknown): Promise<EncryptedEnvelope> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(value));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, this.key, plaintext as BufferSource);
    return { version: 1, iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) };
  }

  async decrypt<T>(envelope: EncryptedEnvelope): Promise<T> {
    if (envelope.version !== 1) throw new Error('Unsupported encrypted record version.');
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(envelope.iv) as BufferSource }, this.key, fromBase64(envelope.ciphertext) as BufferSource);
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  }
}

function toBase64(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)); }
function fromBase64(value: string): Uint8Array { return Uint8Array.from(atob(value), (character) => character.charCodeAt(0)); }