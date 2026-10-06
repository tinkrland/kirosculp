// device-processor.mjs
//
// turns a transient thumbmarkjs payload into durable derived evidence:
// a keyed hash and a bounded feature set. the raw payload is never stored,
// logged, or echoed in an error (requirements req-2, ruling 6).
//
// scope rules, verified against @thumbmarkjs/thumbmarkjs 1.12.0:
//   - only allowlisted components are hashed. unknown components are dropped, so
//     a library upgrade cannot smuggle a new attribute into the hash or storage.
//   - permissions (camera, microphone, geolocation, sensor states), locales
//     (timezone, language) and speech (voice lists) are excluded even though the
//     library includes them in its own hash. they are sensor-adjacent or
//     geography proxies.
//   - the library's own `thumbmark`, `info` and `visitorId` fields are ignored.
//     the server recomputes everything. a client-sent trust level or score is
//     ignored the same way.
//   - automation and inconsistency indicators are recorded for admin review.
//     they do not change the check outcome.

import { Buffer } from 'node:buffer';

export const PROCESSOR_VERSION = 'device-processor-1';
export const FEATURE_SCHEMA_VERSION = '1';

/** components that may contribute to the hash and the features. */
export const ALLOWED_COMPONENTS = Object.freeze([
  'audio', 'canvas', 'fonts', 'hardware', 'math', 'plugins', 'screen', 'system', 'webgl', 'webrtc',
]);

/** components the library can emit that are never used, with the reason. */
export const EXCLUDED_COMPONENTS = Object.freeze({
  permissions: 'sensor and media permission states (camera, microphone, geolocation)',
  locales: 'timezone and language are geography proxies',
  speech: 'installed voice lists reveal language and locale',
});

export const LIMITS = Object.freeze({
  maxPayloadBytes: 32 * 1024,
  maxNodes: 5000,
  maxDepth: 8,
  maxStringLength: 4000,
  /** share of the ten allowed components that must be usable for `complete`. */
  completeThreshold: 0.8,
});

/** key names that mark a biometric or body-adjacent attribute. matched by token. */
const SENSITIVE_KEY_TOKENS = new Set([
  'biometric', 'biometrics', 'face', 'faceid', 'touchid', 'fingerprint', 'skin', 'body',
  'camera', 'microphone', 'mic', 'voice', 'retina', 'iris', 'gait', 'heartrate', 'heart', 'pulse',
]);

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** @typedef {'complete' | 'partial' | 'unavailable'} CollectionStatus */

/**
 * @typedef {object} ProcessedDeviceSignal
 * @property {CollectionStatus} collectionStatus
 * @property {string | null} deviceHash   hmac-sha256 hex, null when unavailable
 * @property {string} hashKeyId
 * @property {{ schema_version: string, component_coverage: number,
 *              automation_indicators: string[], inconsistency_indicators: string[] }} features
 * @property {string} processorVersion
 * @property {{ reason: string | null, droppedComponentCount: number, excludedPresent: boolean,
 *              sensitiveDropped: boolean, ipLeakDropped: boolean, ignoredTopLevelCount: number }} diagnostics
 *   diagnostics carry counts and fixed reason codes only, never client-supplied names or values.
 */

const NO_FEATURES = () => ({
  schema_version: FEATURE_SCHEMA_VERSION,
  component_coverage: 0,
  automation_indicators: [],
  inconsistency_indicators: [],
});

function unavailable(keyRing, reason, diagnostics = {}) {
  return {
    collectionStatus: 'unavailable',
    deviceHash: null,
    hashKeyId: keyRing.activeKeyId,
    features: NO_FEATURES(),
    processorVersion: PROCESSOR_VERSION,
    diagnostics: {
      droppedComponentCount: 0,
      excludedPresent: false,
      sensitiveDropped: false,
      ipLeakDropped: false,
      ignoredTopLevelCount: 0,
      ...diagnostics,
      // last, so a caller-supplied diagnostics object can never blank the reason.
      reason,
    },
  };
}

// ---------------------------------------------------------------- shape walk

/**
 * walks the value once, enforcing type, depth, node, string and prototype rules.
 * returns null when the value is acceptable, otherwise a fixed reason code.
 */
function shapeProblem(value) {
  let nodes = 0;
  const walk = (v, depth) => {
    if (++nodes > LIMITS.maxNodes) return 'payload_too_large';
    if (depth > LIMITS.maxDepth) return 'payload_malformed';
    if (v === null || typeof v === 'boolean') return null;
    if (typeof v === 'number') return Number.isFinite(v) ? null : 'payload_malformed';
    if (typeof v === 'string') return v.length > LIMITS.maxStringLength ? 'payload_too_large' : null;
    if (Array.isArray(v)) {
      for (const item of v) {
        const p = walk(item, depth + 1);
        if (p) return p;
      }
      return null;
    }
    if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
      for (const key of Object.keys(v)) {
        if (FORBIDDEN_KEYS.has(key)) return 'payload_malformed';
        const p = walk(v[key], depth + 1);
        if (p) return p;
      }
      return null;
    }
    return 'payload_malformed'; // functions, symbols, bigint, class instances, dates
  };
  return walk(value, 0);
}

// ------------------------------------------------------------- canonical form

/** deterministic json: keys sorted at every level, no whitespace. */
export function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`;
}

// ------------------------------------------------------------ content filters

function hasSensitiveKey(value) {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(hasSensitiveKey);
  return Object.keys(value).some((key) => {
    const tokens = key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/[^a-z0-9]+/);
    return tokens.some((t) => SENSITIVE_KEY_TOKENS.has(t)) || hasSensitiveKey(value[key]);
  });
}

const IPV4 = /(?<![0-9.])(?:(?:25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(?![0-9.])/;
const IPV6_FULL = /(?<![0-9a-f:])(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}(?![0-9a-f:])/i;
const IPV6_COMPRESSED = /(?<![0-9a-f:])(?:[0-9a-f]{1,4}:){1,7}:(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){0,6})?(?![0-9a-f:])|(?<![0-9a-f:])::(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){0,6})(?![0-9a-f:])/i;

/**
 * the webrtc component is the one place a library can leak a network address.
 * version 1.12.0 reads codec and extension lines only, but if an address ever
 * appears the component is dropped. scanned for webrtc only: a reduced chrome
 * user agent such as Chrome/120.0.0.0 looks like an ipv4 address.
 */
function containsIpAddress(component) {
  const text = canonicalize(component);
  return IPV4.test(text) || IPV6_FULL.test(text) || IPV6_COMPRESSED.test(text);
}

function isUsable(component) {
  if (component === null || component === undefined) return false;
  if (typeof component !== 'object') return false;
  const keys = Object.keys(component);
  if (keys.length === 0) return false;
  // the library reports a failed component as { webgl: 'unsupported' } or { supported: false, error }.
  if (component.supported === false) return false;
  if (keys.length === 1 && component[keys[0]] === 'unsupported') return false;
  return true;
}

// ----------------------------------------------------------------- features

function osFromPlatform(platform) {
  const p = String(platform ?? '').toLowerCase();
  if (p.startsWith('win')) return 'windows';
  if (p.startsWith('mac')) return 'mac';
  if (p.includes('iphone') || p.includes('ipad') || p.includes('ipod')) return 'ios';
  if (p.includes('android') || p.startsWith('linux arm') || p.startsWith('linux aarch')) return 'android';
  if (p.includes('linux') || p.includes('x11')) return 'linux';
  return null;
}

function osFromUserAgent(ua) {
  const u = String(ua ?? '').toLowerCase();
  if (u.includes('iphone') || u.includes('ipad') || u.includes('ipod')) return 'ios';
  if (u.includes('android')) return 'android';
  if (u.includes('windows')) return 'windows';
  if (u.includes('macintosh') || u.includes('mac os x')) return 'mac';
  if (u.includes('linux') || u.includes('x11')) return 'linux';
  return null;
}

/** @param {Record<string, any>} components allowed components that survived filtering */
export function extractFeatures(components) {
  const system = components.system ?? {};
  const hardware = components.hardware ?? {};
  const ua = String(system.useragent ?? '');
  const renderer = String(
    hardware.videocard?.renderer ?? hardware.videocard?.rendererUnmasked ?? '',
  ).toLowerCase();

  const automation = new Set();
  if (/headlesschrome|headless/i.test(ua)) automation.add('headless_user_agent');
  if (/selenium|webdriver|phantomjs|puppeteer|playwright|cypress/i.test(ua)) automation.add('automation_user_agent');
  if (/swiftshader|llvmpipe|mesa offscreen|software rasterizer/.test(renderer)) automation.add('software_renderer');

  const inconsistency = new Set();
  const platformOs = osFromPlatform(system.platform);
  const uaOs = osFromUserAgent(ua);
  if (platformOs && uaOs && platformOs !== uaOs) inconsistency.add('platform_user_agent_mismatch');
  if (typeof system.mobile === 'boolean' && (platformOs === 'windows' || platformOs === 'mac')
      && system.mobile === true) {
    inconsistency.add('mobile_flag_mismatch');
  }

  return {
    automation_indicators: [...automation].sort(),
    inconsistency_indicators: [...inconsistency].sort(),
  };
}

// ------------------------------------------------------------------ process

/**
 * @param {unknown} raw     the client payload: { version?, components: {...} }
 * @param {import('./key-ring.mjs').KeyRing} keyRing
 * @returns {ProcessedDeviceSignal}
 */
export function processDevicePayload(raw, keyRing) {
  try {
    if (raw === null || raw === undefined) return unavailable(keyRing, 'payload_missing');
    if (typeof raw !== 'object' || Array.isArray(raw)) return unavailable(keyRing, 'payload_malformed');

    const problem = shapeProblem(raw);
    if (problem) return unavailable(keyRing, problem);
    if (Buffer.byteLength(JSON.stringify(raw), 'utf8') > LIMITS.maxPayloadBytes) {
      return unavailable(keyRing, 'payload_too_large');
    }

    const components = raw.components;
    if (components === null || typeof components !== 'object' || Array.isArray(components)) {
      return unavailable(keyRing, 'payload_malformed');
    }

    // only `components` is read. every other top-level key, including a
    // client-sent trust level, score or the library's own hash, is ignored.
    const ignoredTopLevelCount = Object.keys(raw).filter((k) => k !== 'components' && k !== 'version').length;

    const kept = {};
    let dropped = 0;
    let excludedPresent = false;
    let sensitiveDropped = false;
    let ipLeakDropped = false;

    for (const name of Object.keys(components)) {
      if (Object.hasOwn(EXCLUDED_COMPONENTS, name)) { excludedPresent = true; dropped++; continue; }
      if (!ALLOWED_COMPONENTS.includes(name)) { dropped++; continue; }
      const component = components[name];
      if (hasSensitiveKey(component)) { sensitiveDropped = true; dropped++; continue; }
      if (name === 'webrtc' && isUsable(component) && containsIpAddress(component)) {
        ipLeakDropped = true; dropped++; continue;
      }
      kept[name] = component;
    }

    const usable = Object.keys(kept).filter((name) => isUsable(kept[name]));
    const diagnostics = {
      reason: null,
      droppedComponentCount: dropped,
      excludedPresent,
      sensitiveDropped,
      ipLeakDropped,
      ignoredTopLevelCount,
    };

    if (usable.length === 0) {
      return unavailable(keyRing, 'no_usable_components', diagnostics);
    }

    const usableOnly = Object.fromEntries(usable.map((name) => [name, kept[name]]));
    const coverage = Math.round((usable.length / ALLOWED_COMPONENTS.length) * 100) / 100;
    const { automation_indicators, inconsistency_indicators } = extractFeatures(usableOnly);

    return {
      collectionStatus: coverage >= LIMITS.completeThreshold ? 'complete' : 'partial',
      deviceHash: keyRing.digest('device', canonicalize(usableOnly)),
      hashKeyId: keyRing.activeKeyId,
      features: {
        schema_version: FEATURE_SCHEMA_VERSION,
        component_coverage: coverage,
        automation_indicators,
        inconsistency_indicators,
      },
      processorVersion: PROCESSOR_VERSION,
      diagnostics,
    };
  } catch (error) {
    // never echo the message: it could quote part of the payload.
    return unavailable(keyRing, 'processor_error', { errorClass: error?.name ?? 'Error' });
  }
}

// ----------------------------------------------------------------- disposal

/**
 * best-effort disposal of the raw payload after processing. javascript cannot
 * zero memory, so this removes every reference the object graph holds; the
 * caller must also drop its own reference. nothing here persists the payload.
 */
export function disposeRawPayload(raw) {
  const clear = (v, seen) => {
    if (v === null || typeof v !== 'object' || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) {
      for (const item of v) clear(item, seen);
      v.length = 0;
      return;
    }
    for (const key of Object.keys(v)) {
      clear(v[key], seen);
      delete v[key];
    }
  };
  clear(raw, new WeakSet());
}

/** log-safe description of an error: class and code only, never the message. */
export function describeErrorSafely(error) {
  return { errorClass: error?.name ?? 'Error', code: error?.code ?? null };
}
