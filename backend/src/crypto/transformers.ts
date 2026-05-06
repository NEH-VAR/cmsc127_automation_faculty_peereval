import { ValueTransformer } from 'typeorm';
import {
  decryptBuffer,
  decryptJson,
  decryptString,
  encryptBuffer,
  encryptJson,
  encryptString,
} from './crypto.util';

export const EncryptedStringTransformer: ValueTransformer = {
  to: (value?: string | null) => (value == null ? null : encryptString(value)),
  from: (value?: Buffer | null) => (value == null ? null : decryptString(value)),
};

export const EncryptedBufferTransformer: ValueTransformer = {
  to: (value?: Buffer | null) => (value == null ? null : encryptBuffer(value)),
  from: (value?: Buffer | null) => (value == null ? null : decryptBuffer(value)),
};

export const EncryptedJsonTransformer: ValueTransformer = {
  to: (value?: unknown | null) => (value == null ? null : encryptJson(value)),
  from: (value?: Buffer | null) => (value == null ? null : decryptJson(value)),
};
