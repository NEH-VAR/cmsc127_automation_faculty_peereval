import * as crypto from 'crypto';

const MASTER_KEY = requireKey('ENCRYPTION_MASTER_KEY');
const LOOKUP_KEY = requireKey('ENCRYPTION_LOOKUP_KEY');

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
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

export function decryptBuffer(blob: Buffer): Buffer {
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const ciphertext = blob.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
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
  return crypto.createHmac('sha256', LOOKUP_KEY).update(value).digest('hex');
}
