// key-ring.mjs
//
// server-held hmac keys for the device hash and the ip digest (ruling 6):
// hmac-sha256, a key id on every hash row, quarterly rotation.
//
// key material never leaves this object. it is not serialized, logged, inspected
// or stored in a row. only the key id travels with a hash. no key is committed;
// tests generate random keys at runtime.
//
// a retired key must stay loaded until every row it produced has purged
// (12 months), otherwise an old hash can no longer be compared or verified.

import crypto from 'node:crypto';
import { inspect } from 'node:util';

/** matches the hash_key_id check constraint in migration 0011. */
export const KEY_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;

/** hmac-sha256 keys shorter than the hash output add little. */
export const MIN_KEY_BYTES = 32;

/** what a digest is for. the purpose is prefixed to the message, so a value
 *  hashed for one purpose can never equal the same value hashed for another. */
export const PURPOSES = Object.freeze(['device', 'ip']);

export class UnknownKeyIdError extends Error {
  constructor(keyId) {
    super(`no key material is loaded for key id ${keyId}`);
    this.name = 'UnknownKeyIdError';
    this.code = 'unknown_key_id';
  }
}

export class KeyRingConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'KeyRingConfigError';
    this.code = 'key_ring_config';
  }
}

export class KeyRing {
  #keys = new Map();
  #active;

  /**
   * @param {{ activeKeyId: string, keys: Record<string, Uint8Array | Buffer> }} config
   */
  constructor({ activeKeyId, keys }) {
    if (!keys || typeof keys !== 'object') throw new KeyRingConfigError('keys are required');
    for (const [id, material] of Object.entries(keys)) {
      if (!KEY_ID_PATTERN.test(id)) throw new KeyRingConfigError(`invalid key id ${id}`);
      if (!(material instanceof Uint8Array)) {
        throw new KeyRingConfigError(`key ${id} must be bytes, not a string`);
      }
      if (material.length < MIN_KEY_BYTES) {
        throw new KeyRingConfigError(`key ${id} is shorter than ${MIN_KEY_BYTES} bytes`);
      }
      this.#keys.set(id, Buffer.from(material)); // copy, so the caller cannot mutate it later
    }
    if (!this.#keys.has(activeKeyId)) {
      throw new KeyRingConfigError(`active key id ${activeKeyId} has no key material`);
    }
    this.#active = activeKeyId;
  }

  /**
   * SIGNALS_HMAC_ACTIVE_KEY_ID = k-2026-q4
   * SIGNALS_HMAC_KEYS          = k-2026-q3:<base64>,k-2026-q4:<base64>
   * @param {Record<string, string | undefined>} env
   */
  static fromEnv(env = process.env) {
    const activeKeyId = env.SIGNALS_HMAC_ACTIVE_KEY_ID;
    const raw = env.SIGNALS_HMAC_KEYS;
    if (!activeKeyId || !raw) {
      throw new KeyRingConfigError('SIGNALS_HMAC_ACTIVE_KEY_ID and SIGNALS_HMAC_KEYS are required');
    }
    const keys = {};
    for (const pair of raw.split(',')) {
      const at = pair.indexOf(':');
      if (at < 1) throw new KeyRingConfigError('SIGNALS_HMAC_KEYS entries must be id:base64');
      keys[pair.slice(0, at).trim()] = Buffer.from(pair.slice(at + 1).trim(), 'base64');
    }
    return new KeyRing({ activeKeyId, keys });
  }

  get activeKeyId() {
    return this.#active;
  }

  /** @returns {string[]} ids only, never material. */
  get keyIds() {
    return [...this.#keys.keys()].sort();
  }

  has(keyId) {
    return this.#keys.has(keyId);
  }

  /**
   * hmac-sha256 of `data` under the subkey for `purpose`. hex, 64 characters.
   * an unknown key id throws instead of silently hashing with a different key.
   * @param {'device' | 'ip'} purpose
   * @param {string} data
   * @param {string} [keyId] defaults to the active key
   */
  digest(purpose, data, keyId = this.#active) {
    if (!PURPOSES.includes(purpose)) throw new KeyRingConfigError(`unknown purpose ${purpose}`);
    const material = this.#keys.get(keyId);
    if (!material) throw new UnknownKeyIdError(keyId);
    // plain hmac-sha256 under the held key. the purpose is a message prefix, so the
    // digest can be reproduced with any standard hmac and no custom derivation.
    return crypto
      .createHmac('sha256', material)
      .update(`sculptura-signals:${purpose}:v1\n${data}`, 'utf8')
      .digest('hex');
  }

  // serialization and inspection expose ids only.
  toJSON() {
    return { activeKeyId: this.#active, keyIds: this.keyIds };
  }

  [inspect.custom]() {
    return `KeyRing { activeKeyId: '${this.#active}', keyIds: [${this.keyIds.join(', ')}] }`;
  }
}

/** @param {Date} [date] @returns {string} for example k-2026-q4 */
export function quarterKeyId(date = new Date()) {
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `k-${date.getUTCFullYear()}-q${quarter}`;
}

/**
 * quarterly rotation check. advisory only: it never blocks a payout, because a
 * late rotation is an operations problem, not a reason to fail a creator.
 * @param {KeyRing} ring
 * @param {Date} [now]
 */
export function keyRotationStatus(ring, now = new Date()) {
  const expected = quarterKeyId(now);
  return { activeKeyId: ring.activeKeyId, expectedKeyId: expected, due: ring.activeKeyId !== expected };
}
