// synthetic fixtures for the signals tests. nothing here is a real browser
// identity, a real ip address (documentation ranges only), or a secret.
// component shapes follow @thumbmarkjs/thumbmarkjs 1.12.0.

import crypto from 'node:crypto';
import { KeyRing } from '../key-ring.mjs';

/** a distinctive string the tests search for in rows, logs and errors. */
export const RAW_MARKER = 'RAWMARKER-7f3a91c2';

/** a key ring with random keys generated at runtime. no key is ever committed. */
export function makeKeyRing(activeKeyId = 'k-2026-q4', extraKeyIds = ['k-2026-q3']) {
  const keys = { [activeKeyId]: crypto.randomBytes(32) };
  for (const id of extraKeyIds) keys[id] = crypto.randomBytes(32);
  return new KeyRing({ activeKeyId, keys });
}

const CHROME_WINDOWS_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** a complete desktop payload: all ten allowed components usable. */
export function desktopPayload(overrides = {}) {
  const base = {
    version: '1.12.0',
    components: {
      audio: { sampleHash: 124.0434, maxChannels: 2, channelCountMode: 'max' },
      canvas: { commonPixelsHash: 'px-aa11', text: RAW_MARKER },
      fonts: { Arial: 'f1', Verdana: 'f2', [RAW_MARKER]: 'f3' },
      hardware: {
        videocard: { vendor: 'Google Inc.', renderer: 'ANGLE (NVIDIA, GeForce GTX)', version: 'WebGL 1.0' },
        architecture: 127,
        deviceMemory: '8',
        jsHeapSizeLimit: 2172649472,
      },
      math: { acos: 1.0471975511965979, sin: 0.0001, tan: 0.0002 },
      plugins: { plugins: ['PDF Viewer|internal-pdf-viewer|Portable Document Format'] },
      screen: { is_touchscreen: false, maxTouchPoints: 0, colorDepth: 24, mediaMatches: ['dark'] },
      system: {
        platform: 'Win32',
        productSub: '20030107',
        product: 'Gecko',
        useragent: CHROME_WINDOWS_UA,
        hardwareConcurrency: 8,
        browser: { name: 'Chrome', version: '120.0.0.0' },
        mobile: false,
        applePayVersion: 0,
        cookieEnabled: true,
      },
      webgl: { commonPixelsHash: 'gl-bb22' },
      webrtc: {
        codecsSupported: { audio: ['opus', 'G722'], video: ['VP8', 'H264'] },
        extensions: ['urn:ietf:params:rtp-hdrext:ssrc-audio-level'],
      },
    },
  };
  return structuredCloneWith(base, overrides);
}

/** shallow-merge overrides onto top level, and component overrides into components. */
function structuredCloneWith(base, overrides) {
  const out = structuredClone(base);
  for (const [key, value] of Object.entries(overrides)) {
    if (key === 'components') Object.assign(out.components, value);
    else out[key] = value;
  }
  return out;
}

/** a payload where only a few components resolved. */
export function partialPayload() {
  const full = desktopPayload();
  const keep = ['system', 'screen', 'math', 'hardware', 'webgl'];
  return {
    version: full.version,
    components: Object.fromEntries(keep.map((k) => [k, full.components[k]])),
  };
}

/** a headless chrome with a software renderer. */
export function headlessPayload() {
  return desktopPayload({
    components: {
      system: {
        ...desktopPayload().components.system,
        useragent: CHROME_WINDOWS_UA.replace('Chrome/', 'HeadlessChrome/'),
      },
      hardware: {
        videocard: { vendor: 'Google Inc.', renderer: 'Google SwiftShader', version: 'WebGL 1.0' },
        architecture: 127,
        deviceMemory: '8',
        jsHeapSizeLimit: 2172649472,
      },
    },
  });
}

/** platform says mac, user agent says windows. */
export function mismatchedPayload() {
  return desktopPayload({
    components: { system: { ...desktopPayload().components.system, platform: 'MacIntel' } },
  });
}

/** components the library emits but this leg never uses. */
export function excludedComponents() {
  return {
    permissions: { camera: 'denied', microphone: 'granted', geolocation: 'prompt' },
    locales: { languages: 'en-US', timezone: 'Asia/Dhaka' },
    speech: { voiceCount: 3, voices: 'voice-a,voice-b' },
  };
}
