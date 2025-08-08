// encryption.ts

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const IV_LENGTH = 12; // AES-GCM standard nonce size

export interface EncryptedPayload {
  iv: string; // hex
  content: string; // hex
}

function assertHexString(hexString: string, expectedLengthBytes?: number): void {
  if (typeof hexString !== 'string' || hexString.length === 0) {
    throw new Error('Expected non-empty hex string');
  }
  if (hexString.length % 2 !== 0) {
    throw new Error('Hex string must have an even length');
  }
  if (!/^[0-9a-fA-F]+$/.test(hexString)) {
    throw new Error('Hex string contains invalid characters');
  }
  if (typeof expectedLengthBytes === 'number' && hexString.length !== expectedLengthBytes * 2) {
    throw new Error(`Hex string must be ${expectedLengthBytes * 2} characters (${expectedLengthBytes} bytes)`);
  }
}

function hexToBytes(hexString: string): Uint8Array {
  assertHexString(hexString);
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
  }
  return byteArray;
}

function bytesToHex(bytes: Uint8Array | ArrayBuffer): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let hex = '';
  for (let i = 0; i < view.length; i++) {
    hex += view[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Import a raw hex key string into a CryptoKey for AES-GCM.
 * @param hexKey 64-char hex string (32 bytes)
 */
export async function importKey(hexKey: string): Promise<CryptoKey> {
  assertHexString(hexKey, 32);
  const keyBytes = hexToBytes(hexKey);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext string with AES-GCM.
 * @returns hex strings for iv and content
 */
export async function encrypt(plaintext: string, hexMasterKey: string): Promise<EncryptedPayload> {
  if (typeof plaintext !== 'string') {
    throw new Error('Plaintext must be a string');
  }
  const key = await importKey(hexMasterKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedText = encoder.encode(plaintext);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );

  return {
    iv: bytesToHex(iv),
    content: bytesToHex(encryptedBuffer),
  };
}

/**
 * Decrypt AES-GCM encrypted payload.
 * @returns decrypted plaintext
 */
export async function decrypt(encrypted: EncryptedPayload, hexMasterKey: string): Promise<string> {
  if (!encrypted || typeof encrypted !== 'object') {
    throw new Error('Encrypted payload must be an object with iv and content');
  }
  assertHexString(encrypted.iv, IV_LENGTH);
  assertHexString(encrypted.content);

  const key = await importKey(hexMasterKey);
  const iv = hexToBytes(encrypted.iv);
  const ciphertext = hexToBytes(encrypted.content);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return decoder.decode(decryptedBuffer);
}
