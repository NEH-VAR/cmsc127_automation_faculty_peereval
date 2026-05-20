#!/usr/bin/env node
/*
Backfill encryption script

Usage:
  node scripts/backfill-encryption.js [--dry-run]

This script will connect using `DATABASE_URL` from the environment and attempt
to encrypt columns that are currently stored in plaintext. It detects whether
a value is already encrypted by attempting decryption — if decryption succeeds
the row is skipped.

WARNING: Always backup your database before running this against production.
*/

const path = require('path');
// Load .env from backend root when running this script directly
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { Client } = require('pg');
const crypto = require('crypto');

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function requireKey(envName) {
  const raw = process.env[envName];
  if (!raw) throw new Error(`${envName} must be set.`);
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error(`${envName} must be 32 bytes (base64).`);
  return key;
}

const MASTER_KEY = requireKey('ENCRYPTION_MASTER_KEY');

function encryptBuffer(plain) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

function tryDecrypt(blob) {
  try {
    if (!Buffer.isBuffer(blob)) return false;
    if (blob.length < IV_LENGTH + TAG_LENGTH) return false;
    const iv = blob.subarray(0, IV_LENGTH);
    const tag = blob.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = blob.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return true;
  } catch (e) {
    return false;
  }
}

async function run() {
  const dryRun = process.argv.includes('--dry-run');
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('DATABASE_URL must be set in environment.');
    process.exit(1);
  }

  const connectionConfig = { connectionString: conn };

  // Some managed Postgres providers (Neon, etc.) require TLS. Pass a
  // permissive `ssl` option so node-postgres will connect when the server
  // presents a certificate that Node cannot verify by default.
  // If you prefer strict verification, set `rejectUnauthorized: true`
  // and provide proper CA certificates.
  try {
    if (/sslmode=/.test(conn) || /neon\.tech/.test(conn)) {
      connectionConfig.ssl = { rejectUnauthorized: false };
    }

    const client = new Client(connectionConfig);
    await client.connect();
    // replace client variable in outer scope
    global.__BACKFILL_PG_CLIENT = client;
  } catch (err) {
    console.error('Failed to connect to the database.');
    console.error('Check your DATABASE_URL, networking/allowlist, and that the DB accepts SSL connections.');
    throw err;
  }

  const client = global.__BACKFILL_PG_CLIENT;

  const tasks = [
    { table: 'users', pk: 'user_id', cols: ['full_name', 'email', 'image'] },
    { table: 'magic_links', pk: 'token_id', cols: ['token_hash'] },
    { table: 'answers', pk: 'answer_id', cols: ['text_response'] },
    {
      table: 'evaluation_summaries',
      pk: 'summary_id',
      cols: ['section_statistics', 'open_ended_comments', 'document_url'],
    },
  ];

  for (const task of tasks) {
    console.log(`Processing table ${task.table}`);
    for (const col of task.cols) {
      console.log(` - column ${col}`);
      const res = await client.query(`SELECT ${task.pk}, ${col} FROM ${task.table} WHERE ${col} IS NOT NULL`);
      let processed = 0;
      let skipped = 0;
      let errors = 0;
      for (const row of res.rows) {
        const pk = row[task.pk];
        const val = row[col];
        const buf = Buffer.isBuffer(val) ? val : Buffer.from(String(val), 'utf8');

        if (tryDecrypt(buf)) {
          skipped++;
          continue;
        }

        // needs encryption
        const encrypted = encryptBuffer(buf);

        if (dryRun) {
          processed++;
          continue;
        }

        try {
          await client.query('BEGIN');
          await client.query(`UPDATE ${task.table} SET ${col} = $1 WHERE ${task.pk} = $2`, [encrypted, pk]);
          await client.query('COMMIT');
          processed++;
        } catch (e) {
          await client.query('ROLLBACK');
          console.error(`Error updating ${task.table}.${col} for id=${pk}:`, e.message);
          errors++;
        }
      }

      console.log(`   done: processed=${processed} skipped=${skipped} errors=${errors}`);
    }
  }

  await client.end();
  console.log('Backfill complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
