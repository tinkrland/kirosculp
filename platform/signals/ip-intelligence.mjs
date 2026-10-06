// ip-intelligence.mjs
//
// provider-agnostic ip intelligence (requirements req-4, req-5, req-9).
//
// callers depend on the result shape below and nothing else. a commercial feed
// (maxmind anonymous ip, ipinfo privacy detection, ip2proxy commercial) is
// swapped in by writing another adapter that returns the same shape. no caller
// changes, no vendor field names in a caller.
//
// hard rules carried from the spec:
//   - a flag whose coverage is `none` was NOT evaluated. it is never clean.
//   - a source error is `unavailable`, never a negative.
//   - a negative from one source never erases a positive from another.
//   - every evaluated flag carries the source and dataset version that decided it.
//   - geo is returned for routing and compliance records only. it is not persisted
//     in v1 and must never feed trust.

import net from 'node:net';

export const ADAPTER_VERSION = 'free-ip-intelligence-1';

export const FLAG_NAMES = Object.freeze(['proxy', 'vpn', 'tor', 'datacenter']);
export const COVERAGE_VALUES = Object.freeze(['full', 'partial', 'none']);
export const AVAILABILITY_VALUES = Object.freeze(['ok', 'unavailable']);
export const CONFIDENCE_VALUES = Object.freeze(['low', 'medium', 'high']);

export class InvalidIpError extends Error {
  constructor() {
    super('not a valid ip address');
    this.name = 'InvalidIpError';
    this.code = 'invalid_ip';
  }
}

export class AdapterContractError extends Error {
  constructor(reason) {
    super(`ip intelligence adapter broke the contract: ${reason}`);
    this.name = 'AdapterContractError';
    this.code = 'adapter_contract';
  }
}

// ---------------------------------------------------------------- ip parsing

const MAX_V4 = (1n << 32n) - 1n;
const MAX_V6 = (1n << 128n) - 1n;

function v4ToText(value) {
  return [24n, 16n, 8n, 0n].map((shift) => String((value >> shift) & 255n)).join('.');
}

function v4ToBigInt(text) {
  return text.split('.').reduce((acc, octet) => (acc << 8n) | BigInt(Number(octet)), 0n);
}

function v6ToBigInt(input) {
  let s = input.toLowerCase();
  const lastColon = s.lastIndexOf(':');
  const tail = s.slice(lastColon + 1);
  if (tail.includes('.')) {
    const o = tail.split('.').map(Number);
    s = `${s.slice(0, lastColon + 1)}${((o[0] << 8) | o[1]).toString(16)}:${((o[2] << 8) | o[3]).toString(16)}`;
  }
  const [head, rest] = s.split('::');
  const h = head ? head.split(':') : [];
  const t = rest ? rest.split(':') : [];
  const groups = rest === undefined ? h : [...h, ...Array(8 - h.length - t.length).fill('0'), ...t];
  return groups.reduce((acc, g) => (acc << 16n) | BigInt(parseInt(g, 16)), 0n);
}

/**
 * @param {unknown} input
 * @returns {{ version: 4 | 6, value: bigint, mapped: boolean }}
 *   an ipv4-mapped ipv6 address (::ffff:a.b.c.d) is returned as ipv4, so a
 *   dual-stack socket cannot push an ipv4 client into the uncovered ipv6 path.
 */
export function parseIp(input) {
  if (typeof input !== 'string' || input.length === 0 || input.length > 45) throw new InvalidIpError();
  if (/[\s%/\\]/.test(input)) throw new InvalidIpError(); // no zone ids, prefixes or whitespace
  const kind = net.isIP(input);
  if (kind === 4) return { version: 4, value: v4ToBigInt(input), mapped: false };
  if (kind === 6) {
    const value = v6ToBigInt(input);
    if (value >> 32n === 0xffffn) return { version: 4, value: value & MAX_V4, mapped: true };
    return { version: 6, value, mapped: false };
  }
  throw new InvalidIpError();
}

// ---------------------------------------------------------------- range sets

/** sorted, merged, non-overlapping inclusive intervals with binary-search lookup. */
export class RangeSet {
  #ranges = [];

  /** @param {Array<[bigint, bigint]>} ranges */
  constructor(ranges = []) {
    const sorted = [...ranges].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    for (const [from, to] of sorted) {
      const last = this.#ranges[this.#ranges.length - 1];
      if (last && from <= last[1] + 1n) {
        if (to > last[1]) last[1] = to;
      } else {
        this.#ranges.push([from, to]);
      }
    }
  }

  get size() {
    return this.#ranges.length;
  }

  contains(value) {
    let lo = 0;
    let hi = this.#ranges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const [from, to] = this.#ranges[mid];
      if (value < from) hi = mid - 1;
      else if (value > to) lo = mid + 1;
      else return true;
    }
    return false;
  }
}

/** @returns {{ version: 4 | 6, from: bigint, to: bigint } | null} */
export function parseCidrOrHost(text) {
  const slash = text.indexOf('/');
  const addr = slash === -1 ? text : text.slice(0, slash);
  let ip;
  try {
    ip = parseIp(addr);
  } catch {
    return null;
  }
  if (ip.mapped) return null; // feeds carry native addresses
  const bits = ip.version === 4 ? 32 : 128;
  let prefix = bits;
  if (slash !== -1) {
    const p = text.slice(slash + 1);
    if (!/^\d{1,3}$/.test(p)) return null;
    prefix = Number(p);
    if (prefix > bits) return null;
  }
  const hostBits = BigInt(bits - prefix);
  const span = (1n << hostBits) - 1n;
  const base = (ip.value >> hostBits) << hostBits;
  return { version: ip.version, from: base, to: base | span };
}

/**
 * parses a one-entry-per-line list of cidr blocks or bare addresses (x4bnet,
 * the tor bulk exit list). comments and blank lines are skipped. a bad line is
 * counted, not thrown, so one bad line cannot sink a feed; the loader rejects a
 * feed with too many bad lines.
 * @returns {{ v4: Array<[bigint, bigint]>, v6: Array<[bigint, bigint]>, entries: number, invalidLines: number }}
 */
export function parseIpList(text) {
  const out = { v4: [], v6: [], entries: 0, invalidLines: 0 };
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const parsed = parseCidrOrHost(line);
    if (!parsed) {
      out.invalidLines++;
      continue;
    }
    (parsed.version === 4 ? out.v4 : out.v6).push([parsed.from, parsed.to]);
    out.entries++;
  }
  return out;
}

function splitCsvLine(line) {
  const cells = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { cells.push(cur); cur = ''; }
    else cur += c;
  }
  cells.push(cur);
  return cells;
}

/**
 * parses the ip2proxy lite csv: "ip_from","ip_to","proxy_type","country_code","country_name".
 * ip_from and ip_to are integers. one file holds one address family, so the
 * caller says which. the file lists every range, and a range that is not a proxy
 * has type "-", which is skipped without comment. only the open proxy type (PUB)
 * is kept: the lite edition carries nothing else. a vpn, tor or datacenter type
 * means a commercial file was loaded; those rows are counted in
 * `unexpectedTypes` and ignored, because this source only backs the proxy flag.
 * country columns are read past and never kept.
 * @param {string} text
 * @param {{ family: 4 | 6 }} opts
 */
export function parseIp2ProxyCsv(text, { family }) {
  const max = family === 4 ? MAX_V4 : MAX_V6;
  const ranges = [];
  let entries = 0;
  let invalidLines = 0;
  let unexpectedTypes = 0;
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const cells = splitCsvLine(line);
    if (cells.length < 3 || !/^\d+$/.test(cells[0]) || !/^\d+$/.test(cells[1])) {
      invalidLines++;
      continue;
    }
    const from = BigInt(cells[0]);
    const to = BigInt(cells[1]);
    if (from > to || to > max) { invalidLines++; continue; }
    const type = cells[2].trim().toUpperCase();
    if (type === '-') continue; // a range that is not a proxy
    if (type !== 'PUB') { unexpectedTypes++; continue; }
    ranges.push([from, to]);
    entries++;
  }
  return { ranges, entries, invalidLines, unexpectedTypes };
}

// ------------------------------------------------------------ range sources

/**
 * a range-list source for one flag. implements the small interface the adapter
 * uses, so a test (or a different feed) can supply its own:
 *   { id, datasetVersion, confidence, covers(version), contains(ip) }
 * `contains` may throw; the adapter treats that as the source being unavailable.
 */
export function createRangeSource({
  id, datasetVersion, confidence = 'medium', v4 = null, v6 = null,
}) {
  if (!id || !datasetVersion) throw new TypeError('a source needs an id and a dataset version');
  if (!CONFIDENCE_VALUES.includes(confidence)) throw new TypeError('invalid confidence');
  const sets = { 4: v4 ? new RangeSet(v4) : null, 6: v6 ? new RangeSet(v6) : null };
  return Object.freeze({
    id,
    datasetVersion,
    confidence,
    /** does this feed have data for the address family? false means not evaluated. */
    covers: (version) => sets[version] !== null,
    contains: (ip) => {
      const set = sets[ip.version];
      if (!set) throw new Error('family not covered');
      return set.contains(ip.value);
    },
  });
}

// --------------------------------------------------------- non-public blocks

const NON_PUBLIC_CIDRS = [
  // documentation ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24, 2001:db8::/32)
  // are deliberately treated as routable: they never occur in real traffic and
  // the test fixtures use them.
  '0.0.0.0/8', '10.0.0.0/8', '100.64.0.0/10', '127.0.0.0/8', '169.254.0.0/16',
  '172.16.0.0/12', '192.0.0.0/24', '192.168.0.0/16', '198.18.0.0/15', '224.0.0.0/4', '240.0.0.0/4',
  '::/128', '::1/128', 'fc00::/7', 'fe80::/10', 'ff00::/8',
].map(parseCidrOrHost);

const NON_PUBLIC = {
  4: new RangeSet(NON_PUBLIC_CIDRS.filter((c) => c.version === 4).map((c) => [c.from, c.to])),
  6: new RangeSet(NON_PUBLIC_CIDRS.filter((c) => c.version === 6).map((c) => [c.from, c.to])),
};

/** private, loopback, link-local, multicast and reserved addresses. */
export function isNonPublic(ip) {
  return NON_PUBLIC[ip.version].contains(ip.value);
}

// ------------------------------------------------------------------ adapter

function evaluateFlag(sources, ip) {
  const attempts = sources.map((source) => {
    try {
      if (!source.covers(ip.version)) return { source, status: 'not_covered' };
      return { source, status: source.contains(ip) ? 'positive' : 'negative' };
    } catch {
      return { source, status: 'unavailable' };
    }
  });
  const positives = attempts.filter((a) => a.status === 'positive');
  const evaluated = attempts.filter((a) => a.status === 'positive' || a.status === 'negative');
  const coverage =
    evaluated.length === 0 ? 'none' : evaluated.length === sources.length ? 'full' : 'partial';
  const primary = positives[0] ?? evaluated[0] ?? null;
  return {
    attempts,
    value: positives.length > 0,
    coverage,
    availability: attempts.some((a) => a.status === 'unavailable') ? 'unavailable' : 'ok',
    primary,
  };
}

/**
 * the free-source adapter. v1 maps: proxy from ip2proxy lite, vpn and datacenter
 * from x4bnet, tor from the tor bulk exit list. each flag takes a list of
 * sources so a second feed can be added without touching this code.
 * @param {{ sources?: Partial<Record<'proxy'|'vpn'|'tor'|'datacenter', any[]>>, geo?: any, adapterVersion?: string }} config
 */
export class FreeIpIntelligenceAdapter {
  #sources;
  #geo;
  #version;

  constructor({ sources = {}, geo = null, adapterVersion = ADAPTER_VERSION } = {}) {
    this.#sources = Object.fromEntries(FLAG_NAMES.map((f) => [f, [...(sources[f] ?? [])]]));
    this.#geo = geo;
    this.#version = adapterVersion;
  }

  /**
   * @param {string} ipText
   * @param {{ moment?: string, observedAt?: string }} [_context]
   */
  async lookup(ipText, _context = {}) {
    const ip = parseIp(ipText); // throws InvalidIpError; nothing is looked up for a bad address
    const nonPublic = isNonPublic(ip);

    const flags = {};
    const coverage = {};
    const availability = {};
    const sources = [];
    for (const name of FLAG_NAMES) {
      if (nonPublic) {
        // a private or reserved address cannot be judged by a public feed.
        flags[name] = { value: false, source: null, confidence: 'low' };
        coverage[name] = 'none';
        availability[name] = 'ok';
        continue;
      }
      const r = evaluateFlag(this.#sources[name], ip);
      flags[name] = {
        value: r.value,
        source: r.primary ? { id: r.primary.source.id, datasetVersion: r.primary.source.datasetVersion } : null,
        confidence: r.primary ? r.primary.source.confidence : 'low',
      };
      coverage[name] = r.coverage;
      availability[name] = r.availability;
      for (const a of r.attempts) {
        sources.push({ flag: name, id: a.source.id, datasetVersion: a.source.datasetVersion, status: a.status });
      }
    }

    // geo follows the same attribution shape as the network flags: coverage
    // `none` means not evaluated (no source configured, source threw, or a
    // non-public address), never conflated with "evaluated and found nothing".
    // a source that answers with no match (an anonymous network, a satellite
    // range) is a normal result, attributed and coverage `full`, countryCode
    // null. see geo-reader.mjs and the embargoed-territory check for why this
    // distinction matters: "no geo" must never silently look like "evaluated".
    let geo = { countryCode: null, subdivisionCode: null, coverage: 'none', source: null };
    if (this.#geo && !nonPublic) {
      try {
        // an ipv4 client on a dual-stack socket is looked up as the dotted ipv4
        // it really is, not in ::ffff: form, so the reader never has to guess.
        const text = ip.version === 4 ? v4ToText(ip.value) : ipText;
        const g = this.#geo.lookup({ ...ip, text });
        geo = {
          countryCode: g?.countryCode ?? null,
          subdivisionCode: g?.subdivisionCode ?? null,
          coverage: 'full',
          source: { id: this.#geo.id ?? 'geo', datasetVersion: this.#geo.datasetVersion ?? 'unknown' },
        };
      } catch {
        geo = { countryCode: null, subdivisionCode: null, coverage: 'none', source: null };
      }
    }

    return {
      adapterVersion: this.#version,
      ipVersion: ip.version,
      addressKind: nonPublic ? 'non_public' : 'public',
      geo,
      coverage,
      availability,
      flags,
      sources,
    };
  }
}

// ----------------------------------------------------------------- contract

/**
 * checks that a result (from any adapter) honours the port contract. the service
 * calls this on every result, so a buggy or compromised adapter cannot smuggle
 * an unattributed positive or a "clean" unevaluated flag past the policy.
 * @returns {object} the same result, when valid
 */
export function assertIpIntelligenceResult(result) {
  const fail = (why) => { throw new AdapterContractError(why); };
  if (result === null || typeof result !== 'object') fail('result is not an object');
  if (typeof result.adapterVersion !== 'string' || !result.adapterVersion || result.adapterVersion.length > 64) fail('adapterVersion');
  if (result.ipVersion !== 4 && result.ipVersion !== 6) fail('ipVersion');
  for (const name of FLAG_NAMES) {
    const flag = result.flags?.[name];
    if (flag === null || typeof flag !== 'object') fail(`flag ${name} missing`);
    if (typeof flag.value !== 'boolean') fail(`flag ${name} value`);
    if (!COVERAGE_VALUES.includes(result.coverage?.[name])) fail(`coverage ${name}`);
    if (!AVAILABILITY_VALUES.includes(result.availability?.[name])) fail(`availability ${name}`);
    if (result.coverage[name] === 'none' && flag.value) fail(`flag ${name} is true but was not evaluated`);
    if (result.coverage[name] !== 'none') {
      const s = flag.source;
      if (!s || typeof s.id !== 'string' || !s.id || typeof s.datasetVersion !== 'string' || !s.datasetVersion) {
        fail(`flag ${name} was evaluated without source attribution`);
      }
    }
  }
  const geo = result.geo;
  if (geo === null || typeof geo !== 'object') fail('geo missing');
  if (!COVERAGE_VALUES.includes(geo.coverage) || geo.coverage === 'partial') fail('geo coverage');
  if (geo.countryCode !== null && !(typeof geo.countryCode === 'string' && /^[A-Z]{2}$/.test(geo.countryCode))) {
    fail('geo countryCode must be an upper-case iso 3166-1 alpha-2 code');
  }
  if (geo.coverage === 'none' && geo.countryCode !== null) fail('geo has a country but coverage is none');
  if (geo.coverage === 'full') {
    const s = geo.source;
    if (!s || typeof s.id !== 'string' || !s.id || typeof s.datasetVersion !== 'string' || !s.datasetVersion) {
      fail('geo was evaluated without source attribution');
    }
  }
  return result;
}

/**
 * converts a valid result's geo field to the jsonb stored on a decision
 * (migration 0012, valid_geo_evidence). never a plaintext ip, never a trust
 * field. coverage `none` is a normal condition (no source, non-public address,
 * or a source that could not answer) and is stored exactly as attribution,
 * never as a reason the embargoed-territory check can fire on.
 */
export function toStoredGeoEvidence(result) {
  assertIpIntelligenceResult(result);
  const geo = result.geo;
  return {
    country_code: geo.countryCode,
    coverage: geo.coverage,
    source_id: geo.source?.id ?? null,
    dataset_version: geo.source?.datasetVersion ?? null,
  };
}

/**
 * converts a valid result to the jsonb stored on a decision (migration 0011,
 * valid_network_flags). geo is not included.
 */
export function toStoredNetworkFlags(result) {
  assertIpIntelligenceResult(result);
  return Object.fromEntries(
    FLAG_NAMES.map((name) => {
      const flag = result.flags[name];
      return [name, {
        value: flag.value,
        coverage: result.coverage[name],
        source_id: flag.source?.id ?? null,
        dataset_version: flag.source?.datasetVersion ?? null,
      }];
    }),
  );
}
