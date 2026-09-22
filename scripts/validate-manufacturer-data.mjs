import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = process.cwd();
const schemaPath = path.join(root, "docs/behind-the-scenes/manufacturing/schemas/manufacturer-capabilities.schema.json");
const dataPath = path.join(root, "docs/behind-the-scenes/manufacturing/reference/manufacturer-capabilities.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(data)) {
  console.error("manufacturer capability schema failed");
  console.error(validate.errors);
  process.exit(1);
}

const failures = [];
for (const manufacturer of data.manufacturers) {
  const refs = new Set(manufacturer.sources.map((source) => source.ref));
  if (refs.size !== manufacturer.sources.length) {
    failures.push(`${manufacturer.id}: duplicate source refs`);
  }

  for (const processEntry of manufacturer.process_fit.processes_offered) {
    if (!refs.has(processEntry.source_ref)) {
      failures.push(`${manufacturer.id}: process references missing source ${processEntry.source_ref}`);
    }
  }

  if (manufacturer.review_status === "accepted") {
    if (manufacturer.process_fit.supports_precious_metal_lost_wax_casting !== true) {
      failures.push(`${manufacturer.id}: accepted candidate lacks confirmed process fit`);
    }
    if (!manufacturer.process_fit.processes_offered.length) {
      failures.push(`${manufacturer.id}: accepted candidate has no sourced process`);
    }
    if (manufacturer.pricing.quote_method === "unknown" || manufacturer.pricing.quote_method == null) {
      failures.push(`${manufacturer.id}: accepted candidate lacks a quote path`);
    }
  }
}

if (failures.length) {
  console.error("manufacturer evidence checks failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`validated ${data.manufacturers.length} manufacturer records`);
