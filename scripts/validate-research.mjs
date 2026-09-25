import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = process.cwd();
const profilesDir = path.join(root, "research/profiles");
const schemaPath = path.join(profilesDir, "profile.schema.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateProfile = ajv.compile(JSON.parse(fs.readFileSync(schemaPath, "utf8")));

// lineage registries
const readJsonl = (file) =>
  fs
    .readFileSync(path.join(root, "research", file), "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));

const evidenceIds = new Set(readJsonl("evidence/evidence.jsonl").map((r) => r.evidence_id));
const sourceIds = new Set(readJsonl("sources/sources.jsonl").map((r) => r.source_id));

const failures = [];
const profiles = fs
  .readdirSync(profilesDir)
  .filter((f) => f.startsWith("profile-") && f.endsWith(".json"));

for (const file of profiles) {
  const profile = JSON.parse(fs.readFileSync(path.join(profilesDir, file), "utf8"));

  if (!validateProfile(profile)) {
    failures.push(`${file}: schema failure`);
    for (const err of validateProfile.errors) {
      failures.push(`${file}: ${err.instancePath || "(root)"} ${err.message}`);
    }
    continue;
  }

  const seen = new Set();
  for (const constraint of profile.constraints) {
    if (seen.has(constraint.constraint_id)) {
      failures.push(`${file}: duplicate constraint_id ${constraint.constraint_id}`);
    }
    seen.add(constraint.constraint_id);

    for (const id of constraint.evidence) {
      if (!evidenceIds.has(id)) {
        failures.push(`${file}: ${constraint.constraint_id} cites unknown evidence ${id}`);
      }
    }
  }

  for (const id of profile.source_lineage) {
    if (!sourceIds.has(id)) {
      failures.push(`${file}: source_lineage cites unknown source ${id}`);
    }
  }
}

// every evidence id ever cited must exist even if a profile is not yet written:
// constraints referenced in the taxonomy md are prose; the registry check above
// only governs machine-readable profiles.

if (failures.length) {
  console.error("research profile validation failed:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`research profiles valid: ${profiles.length} checked (${profiles.join(", ")})`);
