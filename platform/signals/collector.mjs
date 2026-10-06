// collector.mjs
//
// client-side contract for collecting a device signal with thumbmarkjs at the
// two money moments, and nowhere else. this file holds no network code and does
// not import thumbmarkjs: the constructor is injected, so a browser build passes
// the real library and tests pass a fake. the server repo takes no browser-only
// dependency.
//
// platform payout client package, when that surface exists:
//   npm install --save-exact @thumbmarkjs/thumbmarkjs@1.12.0
//
// facts about thumbmarkjs 1.12.0 that shape this file (read from the published
// package, src-0021):
//   - by default it samples 0.01% of runs to api.thumbmarkjs.com and may fetch a
//     script from experimental.thumbmarkjs.com. that is third-party egress from a
//     creator's browser, so `logging` is forced off.
//   - with an api_key it can send a collect beacon to collect.thumbmarkjs.com.
//     no api_key is ever set and `collect_beacon` is forced off.
//   - its `permissions` component reads camera, microphone and geolocation
//     permission states, `locales` reads timezone and language, and `speech`
//     lists installed voices. all three are excluded from the fingerprint so they
//     are never computed.

export const THUMBMARK_PINNED_VERSION = '1.12.0';

/** the only moments a device signal may be collected. */
export const MONEY_MOMENTS = Object.freeze(['payout_onboarding', 'payout_request']);

/** components kept client-side. the server allowlists again; this keeps the rest off the wire. */
export const CLIENT_COMPONENTS = Object.freeze([
  'audio', 'canvas', 'fonts', 'hardware', 'math', 'plugins', 'screen', 'system', 'webgl', 'webrtc',
]);

export const CLIENT_EXCLUDED_COMPONENTS = Object.freeze(['permissions', 'locales', 'speech']);

export const DEFAULT_TIMEOUT_MS = 5000;

export class MoneyMomentError extends Error {
  constructor(moment) {
    super('device signals are collected only at payout onboarding and payout request');
    this.name = 'MoneyMomentError';
    this.code = 'not_a_money_moment';
    this.moment = typeof moment === 'string' ? moment.slice(0, 40) : null;
  }
}

/**
 * plain-language disclosure for the payout flow (ruling 3). shown inline, never
 * as a blocking modal, and collection does not wait for a click.
 * the wording is a draft for owner and legal review.
 */
export const DISCLOSURE = Object.freeze({
  blocking: false,
  requiresAcknowledgement: false,
  text:
    'to help keep payouts safe, we check a few technical details of this browser, ' +
    'such as screen and graphics settings. we do not read your camera, microphone, ' +
    'location or files. we keep a scrambled code made from those details, not the ' +
    'details themselves, and we delete it after 12 months.',
});

/**
 * options passed to the thumbmarkjs constructor. frozen so a caller cannot turn
 * telemetry back on.
 */
export function thumbmarkOptions({ timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return Object.freeze({
    logging: false, // no sampled telemetry, no experimental script fetch
    collect_beacon: false, // never send the collect beacon
    exclude: [...CLIENT_EXCLUDED_COMPONENTS],
    timeout: timeoutMs,
    cache_lifetime_in_ms: 0, // no stored api response
    performance: false,
    // deliberately absent: api_key, simple_request, api_endpoint, collect_endpoint, metadata.
  });
}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** keep only `components` entries on the allowlist. nothing else leaves the browser. */
export function sanitizeForUpload(result) {
  if (!isPlainObject(result) || !isPlainObject(result.components)) return null;
  const components = {};
  for (const name of CLIENT_COMPONENTS) {
    if (Object.hasOwn(result.components, name) && result.components[name] != null) {
      components[name] = result.components[name];
    }
  }
  return {
    version: typeof result.version === 'string' ? result.version.slice(0, 32) : undefined,
    components,
  };
}

/**
 * @param {{ Thumbmark: new (options: object) => { get(): Promise<any> }, timeoutMs?: number }} deps
 */
export function createDeviceSignalCollector({ Thumbmark, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  if (typeof Thumbmark !== 'function') throw new TypeError('a Thumbmark constructor is required');

  return {
    /**
     * returns the sanitized payload, or null when collection fails or times out.
     * null is sent to the server as a missing payload, which becomes
     * `collection_unavailable` and `needs_review`. it is never replaced with a
     * fabricated fingerprint.
     * @param {{ moment: string, submissionId: string }} request
     */
    async collect({ moment, submissionId } = {}) {
      if (!MONEY_MOMENTS.includes(moment)) throw new MoneyMomentError(moment);
      if (typeof submissionId !== 'string' || submissionId.length === 0) {
        throw new TypeError('a submission id is required');
      }
      let timer;
      try {
        const tm = new Thumbmark(thumbmarkOptions({ timeoutMs }));
        const result = await Promise.race([
          tm.get(),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('collection timed out')), timeoutMs + 500);
          }),
        ]);
        return sanitizeForUpload(result);
      } catch {
        return null;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
