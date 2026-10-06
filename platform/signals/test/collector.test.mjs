// batch 3 tests: the client collector contract. a fake Thumbmark stands in for the
// library, so no browser, no network and no third-party code runs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createDeviceSignalCollector, thumbmarkOptions, sanitizeForUpload, MoneyMomentError,
  MONEY_MOMENTS, CLIENT_COMPONENTS, CLIENT_EXCLUDED_COMPONENTS, DISCLOSURE, THUMBMARK_PINNED_VERSION,
} from '../collector.mjs';
import { desktopPayload, excludedComponents, RAW_MARKER } from './fixtures.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** a fake library that records how it was constructed and called. */
function fakeThumbmark(result, { fail = false, hang = false } = {}) {
  const calls = { constructed: 0, got: 0, options: [] };
  class Fake {
    constructor(options) { calls.constructed++; calls.options.push(options); }
    async get() {
      calls.got++;
      if (hang) return new Promise(() => {});
      if (fail) throw new Error(`library failure ${RAW_MARKER}`);
      return result;
    }
  }
  return { Fake, calls };
}

test('positive: the options switch off library telemetry and set no api key', () => {
  const o = thumbmarkOptions();
  assert.equal(o.logging, false, 'no sampled telemetry');
  assert.equal(o.collect_beacon, false, 'no collect beacon');
  assert.equal(o.cache_lifetime_in_ms, 0);
  assert.equal(o.performance, false);
  for (const forbidden of ['api_key', 'simple_request', 'api_endpoint', 'collect_endpoint', 'metadata']) {
    assert.equal(Object.hasOwn(o, forbidden), false, `${forbidden} is never set`);
  }
  assert.deepEqual([...o.exclude].sort(), ['locales', 'permissions', 'speech']);
  assert.equal(Object.isFrozen(o), true, 'a caller cannot turn telemetry back on');
  assert.throws(() => { 'use strict'; o.logging = true; }, TypeError);
});

test('positive: the excluded set matches the server-side exclusions', async () => {
  const { EXCLUDED_COMPONENTS, ALLOWED_COMPONENTS } = await import('../device-processor.mjs');
  assert.deepEqual([...CLIENT_EXCLUDED_COMPONENTS].sort(), Object.keys(EXCLUDED_COMPONENTS).sort());
  assert.deepEqual([...CLIENT_COMPONENTS].sort(), [...ALLOWED_COMPONENTS].sort());
});

test('positive: collection works at both money moments and returns only allowlisted components', async () => {
  for (const moment of MONEY_MOMENTS) {
    const { Fake, calls } = fakeThumbmark({
      ...desktopPayload(), ...{ components: { ...desktopPayload().components, ...excludedComponents() } },
      thumbmark: 'library-hash', info: { classification: { vpn: false } }, visitorId: 'v1',
    });
    const collector = createDeviceSignalCollector({ Thumbmark: Fake });
    const payload = await collector.collect({ moment, submissionId: 'sub-1' });
    assert.equal(calls.constructed, 1, moment);
    assert.deepEqual(Object.keys(payload).sort(), ['components', 'version']);
    assert.deepEqual(Object.keys(payload.components).sort(), [...CLIENT_COMPONENTS].sort());
    for (const dropped of ['permissions', 'locales', 'speech']) {
      assert.equal(Object.hasOwn(payload.components, dropped), false, `${dropped} never leaves the browser`);
    }
    assert.equal(calls.options[0].logging, false);
  }
});

test('negative: collection outside the two money moments throws before the library is touched', async () => {
  const { Fake, calls } = fakeThumbmark(desktopPayload());
  const collector = createDeviceSignalCollector({ Thumbmark: Fake });
  for (const moment of ['signup', 'browse', 'listing_create', 'checkout', 'login', 'page_view', '', undefined, null, 42]) {
    await assert.rejects(() => collector.collect({ moment, submissionId: 's' }), MoneyMomentError, String(moment));
  }
  await assert.rejects(() => collector.collect(), MoneyMomentError);
  assert.equal(calls.constructed, 0, 'the library was never constructed');
  assert.equal(calls.got, 0, 'the library never ran');
});

test('negative: a failing library yields null, not a thrown error or a fabricated fingerprint', async () => {
  const { Fake } = fakeThumbmark(null, { fail: true });
  const collector = createDeviceSignalCollector({ Thumbmark: Fake });
  const out = await collector.collect({ moment: 'payout_request', submissionId: 's' });
  assert.equal(out, null);
});

test('negative: a hanging library times out to null', async () => {
  const { Fake } = fakeThumbmark(null, { hang: true });
  const collector = createDeviceSignalCollector({ Thumbmark: Fake, timeoutMs: 20 });
  const started = Date.now();
  const out = await collector.collect({ moment: 'payout_onboarding', submissionId: 's' });
  assert.equal(out, null);
  assert.ok(Date.now() - started < 2000, 'returned promptly');
});

test('negative: malformed library output becomes null', async () => {
  for (const bad of [null, undefined, 'x', 7, [], {}, { components: null }, { components: [] }]) {
    const { Fake } = fakeThumbmark(bad);
    const out = await createDeviceSignalCollector({ Thumbmark: Fake }).collect({ moment: 'payout_request', submissionId: 's' });
    assert.ok(out === null || (out && Object.keys(out.components).length === 0), JSON.stringify(bad));
  }
  assert.equal(sanitizeForUpload({ components: null }), null);
});

test('negative: a collector cannot be built without a constructor, and a request needs a submission id', async () => {
  assert.throws(() => createDeviceSignalCollector({}), TypeError);
  const { Fake } = fakeThumbmark(desktopPayload());
  await assert.rejects(() => createDeviceSignalCollector({ Thumbmark: Fake }).collect({ moment: 'payout_request' }), TypeError);
});

test('positive: the disclosure is plain language, non-blocking, and does not require a click', () => {
  assert.equal(DISCLOSURE.blocking, false);
  assert.equal(DISCLOSURE.requiresAcknowledgement, false);
  assert.ok(DISCLOSURE.text.length > 60 && DISCLOSURE.text.length < 600);
  assert.equal(DISCLOSURE.text, DISCLOSURE.text.toLowerCase(), 'lowercase house style');
  assert.ok(!DISCLOSURE.text.includes('\u2014'), 'no em dash');
  for (const promise of ['camera', 'microphone', 'location']) assert.match(DISCLOSURE.text, new RegExp(promise));
  assert.match(DISCLOSURE.text, /12 months/, 'states the retention period');
  assert.equal(Object.isFrozen(DISCLOSURE), true);
});

test('negative: the collector itself contains no network code', () => {
  const source = fs.readFileSync(path.join(here, '..', 'collector.mjs'), 'utf8');
  for (const api of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource', 'import(']) {
    assert.ok(!source.includes(api), `collector.mjs must not use ${api}`);
  }
  assert.ok(!/^\s*import\s/m.test(source), 'and it imports nothing, including thumbmarkjs');
});

test('positive: the pinned version is recorded and matches the source ledger', () => {
  assert.equal(THUMBMARK_PINNED_VERSION, '1.12.0');
  const ledger = fs.readFileSync(path.join(here, '../../../research/sources/sources.jsonl'), 'utf8');
  assert.match(ledger, /v1\.12\.0 last modified 2026-09-25/);
});
