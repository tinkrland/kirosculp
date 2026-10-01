import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = process.cwd();
const schemaPath = path.join(root, "manufacturing/schemas/manufacturer-capabilities.schema.json");
const dataPath = path.join(root, "manufacturing/reference/manufacturer-capabilities.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const designReleaseSchemaPath = path.join(root, "contracts/design-release.schema.json");
const designReleaseSchema = JSON.parse(fs.readFileSync(designReleaseSchemaPath, "utf8"));
ajv.compile(designReleaseSchema);

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

const marketsSchemaPath = path.join(root, "operations/country-rollout/shipping-markets.schema.json");
const marketsDataPath = path.join(root, "operations/country-rollout/shipping-markets.json");
const marketsSchema = JSON.parse(fs.readFileSync(marketsSchemaPath, "utf8"));
const marketsData = JSON.parse(fs.readFileSync(marketsDataPath, "utf8"));
const validateMarkets = ajv.compile(marketsSchema);
if (!validateMarkets(marketsData)) {
  console.error("shipping market rollout schema failed");
  console.error(validateMarkets.errors);
  process.exit(1);
}

const payoutSchema = JSON.parse(fs.readFileSync(path.join(root, "operations/country-rollout/creator-payout-policy.schema.json"), "utf8"));
const payoutData = JSON.parse(fs.readFileSync(path.join(root, "operations/country-rollout/creator-payout-policy.json"), "utf8"));
const validatePayout = ajv.compile(payoutSchema);
if (!validatePayout(payoutData)) {
  console.error("creator payout policy schema failed");
  console.error(validatePayout.errors);
  process.exit(1);
}

const phaseIds = new Set(marketsData.phases.map((phase) => phase.id));
const countryCodes = new Set();
for (const market of marketsData.markets) {
  if (countryCodes.has(market.country_code)) {
    console.error(`${market.country_code}: duplicate shipping market`);
    process.exit(1);
  }
  countryCodes.add(market.country_code);
  if (!phaseIds.has(market.phase_id)) {
    console.error(`${market.country_code}: unknown rollout phase ${market.phase_id}`);
    process.exit(1);
  }
  if (market.phase_id === "phase_2" && !market.regional_casting_zone_required) {
    console.error(`${market.country_code}: regional casting research market must retain its route dependency`);
    process.exit(1);
  }
  if (market.status === "live" && (!market.capabilities.buyer_checkout || !market.capabilities.delivery)) {
    console.error(`${market.country_code}: live market must enable buyer checkout and delivery`);
    process.exit(1);
  }
}

console.log(`validated the design-release schema, ${data.manufacturers.length} manufacturer records, and ${marketsData.markets.length} shipping market records`);

const creatorTrustSchema = JSON.parse(fs.readFileSync(path.join(root, "contracts/creator-trust.schema.json"), "utf8"));
ajv.compile(creatorTrustSchema);
console.log("validated private creator trust snapshot contract");

const buyerTrustSchema = JSON.parse(fs.readFileSync(path.join(root, "contracts/buyer-trust.schema.json"), "utf8"));
ajv.compile(buyerTrustSchema);
console.log("validated private buyer trust snapshot contract");
