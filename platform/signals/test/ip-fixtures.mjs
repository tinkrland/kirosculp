// synthetic ip feed fixtures. documentation ranges only (RFC 5737, RFC 3849).
// no real provider data, no real user address. every range is built with the
// production cidr parser so the fixtures cannot drift from the code under test.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseCidrOrHost } from '../ip-intelligence.mjs';
import { buildManifest, MANIFEST_NAME } from '../feeds.mjs';

/** addresses used across tests, each with a known answer. */
export const IPS = Object.freeze({
  residential: '192.0.2.10', // in no list
  vpn: '198.51.100.20', // vpn list and datacenter list
  datacenterOnly: '198.51.100.130', // datacenter list only
  tor: '203.0.113.30', // tor list
  openProxy: '203.0.113.200', // ip2proxy lite pub range, v4
  openProxyV6: '2001:db8:1::5', // ip2proxy lite pub range, v6
  residentialV6: '2001:db8:ffff::1', // in no list
  privateV4: '10.1.2.3',
  loopbackV6: '::1',
  mappedV4Vpn: '::ffff:198.51.100.20', // an ipv4 client on a dual-stack socket
});

/** filler /24 blocks in a private-use first octet, so a list clears the loader's size floor. */
const filler = (firstOctet, count) =>
  Array.from({ length: count }, (_, i) => `${firstOctet}.${Math.floor(i / 256)}.${i % 256}.0/24`);

export const FEED_TEXT = {
  // x4bnet shape: one cidr per line
  vpn: ['198.51.100.0/27', ...filler(101, 2100)].join('\n') + '\n',
  datacenter: ['198.51.100.0/25', '198.51.100.128/25', ...filler(102, 10100)].join('\n') + '\n',
  // tor bulk exit list shape: one bare address per line
  tor: ['203.0.113.30', ...Array.from({ length: 1100 }, (_, i) => `103.${Math.floor(i / 256)}.${i % 256}.1`)].join('\n') + '\n',
};

/** one csv row: ip2proxy lite stores the range as two integers. */
function csvRow(cidr, type) {
  const r = parseCidrOrHost(cidr);
  return `"${r.from}","${r.to}","${type}","-","-"`;
}

const proxyCsv = (family, padding = 150) => {
  const rows =
    family === 4
      ? [csvRow('203.0.113.200/29', 'PUB'), csvRow('192.0.2.0/24', '-'), ...filler(104, padding).map((c) => csvRow(c, 'PUB'))]
      : [csvRow('2001:db8:1::/48', 'PUB'), csvRow('2001:db8:ffff::/48', '-'),
         ...Array.from({ length: padding }, (_, i) => csvRow(`2001:db8:ee${(i % 256).toString(16).padStart(2, '0')}:${Math.floor(i / 256).toString(16)}::/64`, 'PUB'))];
  return rows.join('\n') + '\n';
};

export const PROXY_CSV = { v4: () => proxyCsv(4), v6: () => proxyCsv(6) };

/**
 * writes a complete set of feed files and a manifest into a fresh temp dir.
 * @param {{ retrievedAt?: string, datasetVersion?: string, skip?: string[] }} [opts]
 *   skip entries look like 'ip2proxy-lite-px2:6'
 * @returns {{ dir: string, cleanup: () => void, file: (name: string) => string }}
 */
export function writeFeedDir({ retrievedAt = new Date().toISOString(), datasetVersion = '2026-10-06', skip = [] } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-feeds-'));
  const files = [
    { id: 'x4bnet-vpn', family: 4, file: 'x4bnet-vpn-ipv4.txt', text: FEED_TEXT.vpn },
    { id: 'x4bnet-datacenter', family: 4, file: 'x4bnet-datacenter-ipv4.txt', text: FEED_TEXT.datacenter },
    { id: 'tor-bulk-exit', family: 4, file: 'tor-bulk-exit-ipv4.txt', text: FEED_TEXT.tor },
    { id: 'ip2proxy-lite-px2', family: 4, file: 'ip2proxy-lite-px2-ipv4.csv', text: PROXY_CSV.v4() },
    { id: 'ip2proxy-lite-px2', family: 6, file: 'ip2proxy-lite-px2-ipv6.csv', text: PROXY_CSV.v6() },
  ].filter((f) => !skip.includes(`${f.id}:${f.family}`));
  for (const f of files) fs.writeFileSync(path.join(dir, f.file), f.text);
  const manifest = buildManifest(
    files.map((f) => ({ id: f.id, family: f.family, file: f.file, datasetVersion, retrievedAt })),
    dir,
  );
  fs.writeFileSync(path.join(dir, MANIFEST_NAME), JSON.stringify(manifest, null, 2));
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }), file: (name) => path.join(dir, name) };
}
