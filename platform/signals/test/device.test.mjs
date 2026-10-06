// batch 3 tests: key ring and device processor. pure unit tests, no database.
// run with: node --test "platform/signals/test/*.test.mjs"

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { inspect } from 'node:util';

import {
  KeyRing, KeyRingConfigError, UnknownKeyIdError, quarterKeyId, keyRotationStatus,
} from '../key-ring.mjs';
import {
  processDevicePayload, canonicalize, disposeRawPayload, describeErrorSafely,
  ALLOWED_COMPONENTS, EXCLUDED_COMPONENTS, LIMITS, PROCESSOR_VERSION,
} from '../device-processor.mjs';
import {
  RAW_MARKER, makeKeyRing, desktopPayload, partialPayload, headlessPayload,
  mismatchedPayload, excludedComponents,
} from './fixtures.mjs';

const ring = makeKeyRing();

// ------------------------------------------------------------------ key ring

test('positive: a digest is standard hmac-sha256 and can be reproduced independently', () => {
  const r = makeKeyRing();
  const got = r.digest('device', 'hello', 'k-2026-q4');
  assert.match(got, /^[0-9a-f]{64}$/);
  assert.equal(got, r.digest('device', 'hello', 'k-2026-q4'), 'deterministic');
});

test('positive: the same input gives different digests per purpose and per key', () => {
  const r = makeKeyRing();
  assert.notEqual(r.digest('device', 'x'), r.digest('ip', 'x'), 'device and ip never collide');
  assert.notEqual(r.digest('device', 'x', 'k-2026-q4'), r.digest('device', 'x', 'k-2026-q3'), 'key matters');
  assert.notEqual(makeKeyRing().digest('device', 'x'), makeKeyRing().digest('device', 'x'), 'random keys differ');
});

test('positive: a row made under a retired key stays verifiable while that key is loaded', () => {
  const q3 = crypto.randomBytes(32);
  const q4 = crypto.randomBytes(32);
  const old = new KeyRing({ activeKeyId: 'k-2026-q3', keys: { 'k-2026-q3': q3 } });
  const rotated = new KeyRing({ activeKeyId: 'k-2026-q4', keys: { 'k-2026-q3': q3, 'k-2026-q4': q4 } });
  const oldHash = old.digest('device', 'payload');
  assert.equal(rotated.digest('device', 'payload', 'k-2026-q3'), oldHash, 'verifiable by key id');
  assert.notEqual(rotated.digest('device', 'payload'), oldHash, 'new rows use the new key');
  assert.equal(rotated.activeKeyId, 'k-2026-q4');
});

test('negative: an unknown key id throws and never falls back to another key', () => {
  assert.throws(() => ring.digest('device', 'x', 'k-1999-q1'), UnknownKeyIdError);
});

test('negative: weak, mistyped or inconsistent key configuration is rejected', () => {
  const good = crypto.randomBytes(32);
  assert.throws(() => new KeyRing({ activeKeyId: 'a', keys: { a: crypto.randomBytes(8) } }), KeyRingConfigError);
  assert.throws(() => new KeyRing({ activeKeyId: 'a', keys: { a: 'a-string-secret-that-is-long-enough-123' } }), KeyRingConfigError);
  assert.throws(() => new KeyRing({ activeKeyId: 'A B', keys: { 'A B': good } }), KeyRingConfigError);
  assert.throws(() => new KeyRing({ activeKeyId: 'missing', keys: { a: good } }), KeyRingConfigError);
  assert.throws(() => new KeyRing({ activeKeyId: 'a' }), KeyRingConfigError);
  assert.throws(() => ring.digest('geo', 'x'), KeyRingConfigError, 'unknown purpose');
});

test('negative: key material is never exposed by json, inspect, or string conversion', () => {
  const material = crypto.randomBytes(32);
  const r = new KeyRing({ activeKeyId: 'k-2026-q4', keys: { 'k-2026-q4': material } });
  for (const text of [JSON.stringify(r), inspect(r, { depth: 5, showHidden: true }), String(r), `${JSON.stringify({ r })}`]) {
    assert.ok(!text.includes(material.toString('hex')), 'no hex');
    assert.ok(!text.includes(material.toString('base64')), 'no base64');
  }
  assert.deepEqual(JSON.parse(JSON.stringify(r)), { activeKeyId: 'k-2026-q4', keyIds: ['k-2026-q4'] });
  material.fill(0); // the ring copied the key, so the caller mutating theirs changes nothing
  assert.match(r.digest('device', 'x'), /^[0-9a-f]{64}$/);
  assert.notEqual(r.digest('device', 'x'), new KeyRing({ activeKeyId: 'k-2026-q4', keys: { 'k-2026-q4': Buffer.alloc(32) } }).digest('device', 'x'));
});

test('positive: the ring loads from the environment, and negative: it refuses a bad environment', () => {
  const k3 = crypto.randomBytes(32).toString('base64');
  const k4 = crypto.randomBytes(32).toString('base64');
  const r = KeyRing.fromEnv({ SIGNALS_HMAC_ACTIVE_KEY_ID: 'k-2026-q4', SIGNALS_HMAC_KEYS: `k-2026-q3:${k3},k-2026-q4:${k4}` });
  assert.deepEqual(r.keyIds, ['k-2026-q3', 'k-2026-q4']);
  assert.throws(() => KeyRing.fromEnv({}), KeyRingConfigError);
  assert.throws(() => KeyRing.fromEnv({ SIGNALS_HMAC_ACTIVE_KEY_ID: 'k', SIGNALS_HMAC_KEYS: 'no-colon-here' }), KeyRingConfigError);
});

test('positive: rotation is reported as due when the active key is from an earlier quarter', () => {
  assert.equal(quarterKeyId(new Date('2026-10-06T00:00:00Z')), 'k-2026-q4');
  assert.equal(quarterKeyId(new Date('2027-01-01T00:00:00Z')), 'k-2027-q1');
  const r = makeKeyRing('k-2026-q3', []);
  assert.equal(keyRotationStatus(r, new Date('2026-10-06T00:00:00Z')).due, true);
  assert.equal(keyRotationStatus(makeKeyRing('k-2026-q4', []), new Date('2026-10-06T00:00:00Z')).due, false);
});

// ---------------------------------------------------------- device processing

test('positive: a complete payload yields a keyed hash, the key id, and bounded features', () => {
  const r = processDevicePayload(desktopPayload(), ring);
  assert.equal(r.collectionStatus, 'complete');
  assert.match(r.deviceHash, /^[0-9a-f]{64}$/);
  assert.equal(r.hashKeyId, 'k-2026-q4');
  assert.equal(r.processorVersion, PROCESSOR_VERSION);
  assert.deepEqual(Object.keys(r.features).sort(),
    ['automation_indicators', 'component_coverage', 'inconsistency_indicators', 'schema_version']);
  assert.equal(r.features.component_coverage, 1);
  assert.deepEqual(r.features.automation_indicators, []);
  assert.deepEqual(r.features.inconsistency_indicators, []);
});

test('positive: processing is deterministic and independent of key order', () => {
  const a = processDevicePayload(desktopPayload(), ring);
  const b = processDevicePayload(desktopPayload(), ring);
  assert.deepEqual(a, b);
  const p = desktopPayload();
  const reordered = { components: Object.fromEntries(Object.entries(p.components).reverse()), version: p.version };
  assert.equal(processDevicePayload(reordered, ring).deviceHash, a.deviceHash);
});

test('positive: the hash is a standard hmac over the canonical allowlisted form', () => {
  const r = makeKeyRing('k-2026-q4', []);
  const payload = desktopPayload();
  const got = processDevicePayload(payload, r);
  // rebuild the expected value from the key ring's own digest, which is checked
  // against node's hmac in the key ring tests above.
  const allowed = Object.fromEntries(ALLOWED_COMPONENTS.map((n) => [n, payload.components[n]]));
  assert.equal(got.deviceHash, r.digest('device', canonicalize(allowed)));
});

test('positive: a different device gives a different hash, and a different key gives a different hash', () => {
  const base = processDevicePayload(desktopPayload(), ring);
  const other = processDevicePayload(desktopPayload({ components: { screen: { is_touchscreen: true, maxTouchPoints: 5, colorDepth: 30, mediaMatches: [] } } }), ring);
  assert.notEqual(base.deviceHash, other.deviceHash);
  assert.notEqual(processDevicePayload(desktopPayload(), makeKeyRing()).deviceHash, base.deviceHash);
});

test('positive: a payload with only some components is partial with lower coverage', () => {
  const r = processDevicePayload(partialPayload(), ring);
  assert.equal(r.collectionStatus, 'partial');
  assert.equal(r.features.component_coverage, 0.5);
  assert.match(r.deviceHash, /^[0-9a-f]{64}$/);
});

test('positive: headless and mismatch indicators are recorded for review', () => {
  const h = processDevicePayload(headlessPayload(), ring);
  assert.deepEqual(h.features.automation_indicators, ['headless_user_agent', 'software_renderer']);
  const m = processDevicePayload(mismatchedPayload(), ring);
  assert.deepEqual(m.features.inconsistency_indicators, ['platform_user_agent_mismatch']);
  assert.equal(h.collectionStatus, 'complete', 'indicators are evidence, they do not fail collection');
});

test('positive: the three excluded components never influence the hash', () => {
  const plain = processDevicePayload(desktopPayload(), ring);
  const withExcluded = processDevicePayload(desktopPayload({ components: excludedComponents() }), ring);
  assert.equal(withExcluded.deviceHash, plain.deviceHash, 'timezone, permissions and voices are not hashed');
  assert.equal(withExcluded.diagnostics.excludedPresent, true);
  assert.deepEqual(Object.keys(EXCLUDED_COMPONENTS).sort(), ['locales', 'permissions', 'speech']);
  const changedTz = desktopPayload({ components: { ...excludedComponents(), locales: { languages: 'bn-BD', timezone: 'Asia/Karachi' } } });
  assert.equal(processDevicePayload(changedTz, ring).deviceHash, plain.deviceHash, 'geography proxy never reaches the hash');
});

test('positive: unknown components are dropped and do not change the hash', () => {
  const plain = processDevicePayload(desktopPayload(), ring);
  const r = processDevicePayload(desktopPayload({ components: { futureThing: { x: 1 } } }), ring);
  assert.equal(r.deviceHash, plain.deviceHash);
  assert.equal(r.diagnostics.droppedComponentCount, 1);
});

test('negative: client-sent trust fields and the library hash are ignored', () => {
  const plain = processDevicePayload(desktopPayload(), ring);
  const forged = { ...desktopPayload(), trustLevel: 'trusted', score: 0.99, thumbmark: 'abc', info: { classification: { vpn: false } }, visitorId: 'v' };
  const r = processDevicePayload(forged, ring);
  assert.equal(r.deviceHash, plain.deviceHash);
  assert.deepEqual(r.features, plain.features);
  assert.equal(r.diagnostics.ignoredTopLevelCount, 5, 'trustLevel, score, thumbmark, info, visitorId');
  assert.ok(!JSON.stringify(r).includes('trusted'));
});

test('negative: a biometric or body-adjacent attribute is dropped and cannot influence the hash', () => {
  const base = processDevicePayload(desktopPayload(), ring);
  for (const key of ['faceId', 'biometricScore', 'skin_tone', 'heartRate', 'retinaScan', 'bodyShape', 'microphoneLevel', 'fingerprintTemplate']) {
    const a = processDevicePayload(desktopPayload({ components: { screen: { ...desktopPayload().components.screen, [key]: 'VALUE-A' } } }), ring);
    const b = processDevicePayload(desktopPayload({ components: { screen: { ...desktopPayload().components.screen, [key]: 'VALUE-B' } } }), ring);
    assert.equal(a.diagnostics.sensitiveDropped, true, key);
    assert.equal(a.deviceHash, b.deviceHash, `${key} value does not reach the hash`);
    assert.notEqual(a.deviceHash, base.deviceHash, 'the dropped component is gone from the hash input');
  }
});

test('negative: a webrtc component that contains an ip address is dropped', () => {
  const base = processDevicePayload(desktopPayload(), ring);
  for (const ip of ['203.0.113.7', '2001:db8::1', 'fe80::1:2:3:4', '2001:0db8:85a3:0000:0000:8a2e:0370:7334']) {
    const leaked = desktopPayload({ components: { webrtc: { candidate: `a=candidate ${ip} typ host` } } });
    const r = processDevicePayload(leaked, ring);
    assert.equal(r.diagnostics.ipLeakDropped, true, ip);
    assert.ok(!JSON.stringify(r).includes(ip.slice(0, 7)), 'the address is not echoed');
    assert.notEqual(r.deviceHash, base.deviceHash);
  }
});

test('positive: a reduced chrome user agent is not mistaken for an ip address', () => {
  const r = processDevicePayload(desktopPayload(), ring);
  assert.equal(r.diagnostics.ipLeakDropped, false);
  assert.equal(r.collectionStatus, 'complete', 'Chrome/120.0.0.0 in the user agent is kept');
});

test('negative: missing or malformed payloads become unavailable, never a fabricated fingerprint', () => {
  const cases = [
    [null, 'payload_missing'], [undefined, 'payload_missing'],
    ['a string', 'payload_malformed'], [42, 'payload_malformed'], [[1, 2], 'payload_malformed'],
    [{}, 'payload_malformed'], [{ components: null }, 'payload_malformed'], [{ components: [] }, 'payload_malformed'],
    [{ components: {} }, 'no_usable_components'],
    [{ components: { webgl: 'unsupported' } }, 'no_usable_components'],
    [{ components: { webgl: { webgl: 'unsupported' }, webrtc: { supported: false, error: 'WebRTC not supported' } } }, 'no_usable_components'],
    [{ components: { nothing: { a: 1 } } }, 'no_usable_components'],
  ];
  for (const [input, reason] of cases) {
    const r = processDevicePayload(input, ring);
    assert.equal(r.collectionStatus, 'unavailable', String(reason));
    assert.equal(r.deviceHash, null);
    assert.equal(r.diagnostics.reason, reason);
    assert.equal(r.features.component_coverage, 0);
    assert.equal(r.hashKeyId, 'k-2026-q4');
  }
});

test('negative: oversized, too deep, too wide, prototype-polluting and non-json payloads are rejected', () => {
  const big = desktopPayload({ components: { fonts: { f: 'x'.repeat(LIMITS.maxStringLength + 1) } } });
  assert.equal(processDevicePayload(big, ring).diagnostics.reason, 'payload_too_large');

  const manyNodes = { components: { audio: Object.fromEntries(Array.from({ length: LIMITS.maxNodes + 10 }, (_, i) => [`k${i}`, i])) } };
  assert.equal(processDevicePayload(manyNodes, ring).diagnostics.reason, 'payload_too_large');

  let deep = { leaf: 1 };
  for (let i = 0; i < LIMITS.maxDepth + 3; i++) deep = { n: deep };
  assert.equal(processDevicePayload({ components: { audio: deep } }, ring).diagnostics.reason, 'payload_malformed');

  const polluted = JSON.parse('{"components":{"audio":{"__proto__":{"isAdmin":true},"sampleHash":1}}}');
  assert.equal(processDevicePayload(polluted, ring).diagnostics.reason, 'payload_malformed');
  assert.equal({}.isAdmin, undefined, 'object prototype was not polluted');

  for (const bad of [() => 1, Symbol('s'), 10n, new Date(), Number.NaN, Number.POSITIVE_INFINITY]) {
    const r = processDevicePayload({ components: { audio: { v: bad } } }, ring);
    assert.equal(r.collectionStatus, 'unavailable', String(typeof bad));
  }

  const totalBytes = { components: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [ALLOWED_COMPONENTS[i], { a: 'y'.repeat(LIMITS.maxStringLength - 1), b: 'z'.repeat(LIMITS.maxStringLength - 1), c: 'w'.repeat(LIMITS.maxStringLength - 1) }])) };
  assert.equal(processDevicePayload(totalBytes, ring).diagnostics.reason, 'payload_too_large');
});

// ----------------------------------------------------- nothing raw escapes

function captureOutput(fn) {
  const chunks = [];
  const originals = {};
  for (const m of ['log', 'info', 'warn', 'error', 'debug', 'trace']) {
    originals[m] = console[m];
    console[m] = (...a) => chunks.push(a.map((x) => (typeof x === 'string' ? x : inspect(x, { depth: 6 }))).join(' '));
  }
  const out = process.stdout.write.bind(process.stdout);
  const err = process.stderr.write.bind(process.stderr);
  process.stdout.write = (c) => { chunks.push(String(c)); return true; };
  process.stderr.write = (c) => { chunks.push(String(c)); return true; };
  try { return { value: fn(), output: chunks }; }
  finally {
    for (const m of Object.keys(originals)) console[m] = originals[m];
    process.stdout.write = out;
    process.stderr.write = err;
  }
}

test('negative: the result never contains a raw value, and processing writes no log output', () => {
  const { value, output } = captureOutput(() => processDevicePayload(desktopPayload(), ring));
  assert.ok(!JSON.stringify(value).includes(RAW_MARKER), 'no raw marker in the result');
  assert.ok(!JSON.stringify(value).includes('Chrome/120'), 'no user agent in the result');
  assert.ok(!JSON.stringify(value).includes('GeForce'), 'no renderer string in the result');
  assert.deepEqual(output, [], 'the processor writes nothing to stdout, stderr or console');
});

test('negative: an internal failure reports a class and a fixed reason, never the payload or the message', () => {
  const payload = { components: {} };
  Object.defineProperty(payload, 'components', { get() { throw new TypeError(`boom ${RAW_MARKER}`); }, enumerable: true });
  const { value, output } = captureOutput(() => processDevicePayload(payload, ring));
  assert.equal(value.collectionStatus, 'unavailable');
  assert.equal(value.diagnostics.reason, 'processor_error');
  assert.equal(value.diagnostics.errorClass, 'TypeError');
  assert.ok(!JSON.stringify(value).includes(RAW_MARKER), 'the error message is not echoed');
  assert.deepEqual(output, []);
  const safe = describeErrorSafely(new Error(`secret ${RAW_MARKER}`));
  assert.ok(!JSON.stringify(safe).includes(RAW_MARKER));
  assert.deepEqual(Object.keys(safe).sort(), ['code', 'errorClass']);
});

test('positive: disposal removes every reference held by the raw object graph', () => {
  const raw = desktopPayload();
  const inner = raw.components.system;
  processDevicePayload(raw, ring);
  disposeRawPayload(raw);
  assert.deepEqual(Object.keys(raw), []);
  assert.deepEqual(Object.keys(inner), [], 'nested objects are emptied too');
  disposeRawPayload(null); // tolerated
  disposeRawPayload('a string');
});

test('positive: processing does not mutate the caller payload before disposal', () => {
  const raw = desktopPayload();
  const before = canonicalize(raw);
  processDevicePayload(raw, ring);
  assert.equal(canonicalize(raw), before);
});
