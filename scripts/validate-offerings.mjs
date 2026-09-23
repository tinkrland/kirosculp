import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const backs = read('../offerings/earrings/backings.json');
const bases = read('../offerings/configure/archetypes.json');
const release = read('../contracts/design-release.schema.json');
const families = new Set(['stud', 'hoop', 'drop', 'climber', 'crawler', 'cuff', 'wrap', 'threader']);

assert.equal(backs.status, 'research');
assert.equal(bases.status, 'research');
assert.ok(backs.findings.length >= 8);
assert.ok(bases.ring_bases.length >= 5);
const seenBacks = new Set();
for (const finding of backs.findings) {
  assert.match(finding.id, /^[a-z][a-z0-9_]*$/);
  assert.ok(!seenBacks.has(finding.id), `duplicate finding: ${finding.id}`);
  seenBacks.add(finding.id);
  assert.ok(finding.attachment && finding.families.length && finding.requires.length);
  for (const family of finding.families) assert.ok(families.has(family), `unknown family: ${family}`);
  assert.ok(finding.buyer_selectable !== true, `${finding.id} has no approved supply or release`);
}
assert.deepEqual(new Set(backs.findings.find((x) => x.id === 'none').families), new Set(['cuff', 'wrap', 'threader']));
assert.deepEqual(backs.findings.find((x) => x.id === 'screw_back').attachment, 'threaded_post');
const seenBases = new Set();
for (const base of bases.ring_bases) {
  assert.match(base.id, /^[a-z][a-z0-9_]*$/);
  assert.ok(!seenBases.has(base.id), `duplicate base: ${base.id}`);
  seenBases.add(base.id);
  assert.ok(base.motif && base.allowed_personalization.length && base.studio_checks.length);
  assert.ok(base.buyer_selectable !== true, `${base.id} is an unvalidated concept`);
}
for (const id of ['signet', 'affinity_connected', 'promise', 'double_heart', 'claddagh']) assert.ok(seenBases.has(id), `missing base: ${id}`);
for (const id of ['ring', 'earring', 'bracelet', 'pendant']) assert.ok(release.properties.type.enum.includes(id), `missing release type: ${id}`);
assert.ok(!release.properties.type.enum.includes('chain'), 'chain enablement needs a separate validated contract change');
console.log(`validated ${backs.findings.length} candidate findings and ${bases.ring_bases.length} research ring bases`);
