const MASTER_KEY_ENV = 'ENCRYPTION_MASTER_KEY';
const LOOKUP_KEY_ENV = 'ENCRYPTION_LOOKUP_KEY';

function setTestKeys(): void {
  const masterKey = Buffer.alloc(32, 1).toString('base64');
  const lookupKey = Buffer.alloc(32, 2).toString('base64');
  process.env[MASTER_KEY_ENV] = masterKey;
  process.env[LOOKUP_KEY_ENV] = lookupKey;
}

function loadCryptoUtil() {
  jest.resetModules();
  return require('./crypto.util') as typeof import('./crypto.util');
}

describe('crypto.util', () => {
  beforeEach(() => {
    setTestKeys();
  });

  it('round-trips buffers', () => {
    const { encryptBuffer, decryptBuffer } = loadCryptoUtil();
    const plain = Buffer.from('hello world', 'utf8');
    const blob = encryptBuffer(plain);
    const roundTrip = decryptBuffer(blob);
    expect(roundTrip.equals(plain)).toBe(true);
  });

  it('round-trips strings', () => {
    const { encryptString, decryptString } = loadCryptoUtil();
    const plain = 'sample text';
    const blob = encryptString(plain);
    const roundTrip = decryptString(blob);
    expect(roundTrip).toBe(plain);
  });

  it('round-trips json', () => {
    const { encryptJson, decryptJson } = loadCryptoUtil();
    const plain = { a: 1, b: 'two', c: [true, false] };
    const blob = encryptJson(plain);
    const roundTrip = decryptJson(blob);
    expect(roundTrip).toEqual(plain);
  });

  it('rejects short payloads', () => {
    const { decryptBuffer } = loadCryptoUtil();
    const shortBlob = Buffer.from('short', 'utf8');
    expect(() => decryptBuffer(shortBlob)).toThrow('Encrypted payload is too short.');
  });

  it('produces deterministic lookup hashes', () => {
    const { hashLookup } = loadCryptoUtil();
    const value = 'user@example.com';
    const hashA = hashLookup(value);
    const hashB = hashLookup(value);
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });
});
