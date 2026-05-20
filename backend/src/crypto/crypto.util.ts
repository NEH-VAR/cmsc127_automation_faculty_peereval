import * as crypto from 'crypto';

let MASTER_KEY: Buffer | null = null;
let LOOKUP_KEY: Buffer | null = null;

function getMasterKey(): Buffer {
  if (!MASTER_KEY) MASTER_KEY = requireKey('ENCRYPTION_MASTER_KEY');
  return MASTER_KEY;
}

function getLookupKey(): Buffer {
  if (!LOOKUP_KEY) LOOKUP_KEY = requireKey('ENCRYPTION_LOOKUP_KEY');
  return LOOKUP_KEY;
}
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const MIN_BLOB_LENGTH = IV_LENGTH + TAG_LENGTH;

function requireKey(envName: string): Buffer {
  const raw = process.env[envName];
  if (!raw) {
    throw new Error(`${envName} must be set.`);
  }

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error(`${envName} must be 32 bytes (base64).`);
  }

  return key;
}

export function encryptBuffer(plain: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', getMasterKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

export function decryptBuffer(blob: Buffer): Buffer {
  if (blob.length < MIN_BLOB_LENGTH) {
    throw new Error('Encrypted payload is too short.');
  }

  const iv = blob.subarray(0, IV_LENGTH);
  const tag = blob.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = blob.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getMasterKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptString(value: string): Buffer {
  return encryptBuffer(Buffer.from(value, 'utf8'));
}

export function decryptString(blob: Buffer): string {
  return decryptBuffer(blob).toString('utf8');
}

export function encryptJson(value: unknown): Buffer {
  return encryptString(JSON.stringify(value));
}

export function decryptJson(blob: Buffer): unknown {
  return JSON.parse(decryptString(blob));
}

export function hashLookup(value: string): string {
  return crypto.createHmac('sha256', getLookupKey()).update(value).digest('hex');
}
