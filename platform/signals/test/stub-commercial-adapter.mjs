// a stand-in for a commercial feed (maxmind anonymous ip, ipinfo privacy
// detection). it keeps a vendor-shaped payload internally and maps it to the
// port result, exactly as a real commercial adapter would. the point of the
// swap test is that callers never see the vendor shape.

import { parseIp, isNonPublic, FLAG_NAMES } from '../ip-intelligence.mjs';

/** a vendor-style record. these field names must never appear in a caller. */
const VENDOR_RECORDS = {
  '198.51.100.20': { is_anonymous_vpn: true, is_hosting_provider: true, is_tor_exit_node: false, is_public_proxy: false },
  '203.0.113.30': { is_anonymous_vpn: false, is_hosting_provider: false, is_tor_exit_node: true, is_public_proxy: false },
  '2001:db8::77': { is_anonymous_vpn: true, is_hosting_provider: false, is_tor_exit_node: false, is_public_proxy: false },
};
const CLEAN = { is_anonymous_vpn: false, is_hosting_provider: false, is_tor_exit_node: false, is_public_proxy: false };

export const VENDOR_FIELD_NAMES = Object.freeze(Object.keys(CLEAN));

export class StubCommercialAdapter {
  /** @param {{ failing?: boolean, coverage?: 'full' | 'none' }} [opts] */
  constructor({ failing = false, coverage = 'full' } = {}) {
    this.failing = failing;
    this.coverage = coverage;
  }

  async lookup(ipText) {
    const ip = parseIp(ipText);
    const nonPublic = isNonPublic(ip);
    if (this.failing) throw new Error('vendor api unreachable');

    const record = VENDOR_RECORDS[ipText] ?? CLEAN;
    const source = { id: 'commercial-stub', datasetVersion: 'stub-2026-10' };
    const mapped = {
      proxy: record.is_public_proxy,
      vpn: record.is_anonymous_vpn,
      tor: record.is_tor_exit_node,
      datacenter: record.is_hosting_provider,
    };
    const covered = this.coverage === 'full' && !nonPublic;
    const flags = {};
    const coverage = {};
    const availability = {};
    for (const name of FLAG_NAMES) {
      flags[name] = { value: covered && mapped[name], source: covered ? source : null, confidence: 'high' };
      coverage[name] = covered ? 'full' : 'none'; // a commercial feed covers ipv6 too
      availability[name] = 'ok';
    }
    return {
      adapterVersion: 'commercial-stub-1',
      ipVersion: ip.version,
      addressKind: nonPublic ? 'non_public' : 'public',
      geo: { countryCode: null, subdivisionCode: null, available: false },
      coverage,
      availability,
      flags,
      sources: covered ? FLAG_NAMES.map((flag) => ({ flag, ...source, status: 'positive' })) : [],
    };
  }
}
