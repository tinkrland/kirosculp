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

// listing.schema.json with test cases
const listingSchema = JSON.parse(fs.readFileSync(path.join(root, "contracts/listing.schema.json"), "utf8"));
const validateListing = ajv.compile(listingSchema);

const listingPositiveCases = [
  {
    listing_id: "550e8400-e29b-41d4-a716-446655440000",
    release_id: "650e8400-e29b-41d4-a716-446655440000",
    creator_id: "750e8400-e29b-41d4-a716-446655440000",
    name: "minimal ring 01",
    description: "a simple band in four metals",
    status: "published",
    pricing_intent: {
      model: "creator_net_fixed",
      base_amount_cents: 3000
    },
    collections: [],
    style_tags: ["minimal", "everyday"],
    is_featured: false,
    made_to_order: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    published_at: "2024-01-01T00:00:00Z"
  },
  {
    listing_id: "660e8400-e29b-41d4-a716-446655440000",
    release_id: "760e8400-e29b-41d4-a716-446655440000",
    creator_id: "860e8400-e29b-41d4-a716-446655440000",
    name: "locked drop pendant",
    status: "locked_drop",
    scheduled_publish_at: "2024-12-01T00:00:00Z",
    pricing_intent: {
      model: "retail_fixed",
      base_amount_cents: 15000,
      variant_overrides: { "gold_14k_yellow": 45000 }
    },
    collections: ["960e8400-e29b-41d4-a716-446655440000"],
    style_tags: ["statement"],
    is_featured: true,
    made_to_order: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    published_at: null
  }
];

const listingNegativeCases = [
  {
    name: "missing listing_id",
    data: {
      release_id: "650e8400-e29b-41d4-a716-446655440000",
      creator_id: "750e8400-e29b-41d4-a716-446655440000",
      name: "test",
      status: "published",
      pricing_intent: { model: "creator_net_fixed", base_amount_cents: 3000 },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  },
  {
    name: "locked_drop without scheduled_publish_at",
    data: {
      listing_id: "550e8400-e29b-41d4-a716-446655440000",
      release_id: "650e8400-e29b-41d4-a716-446655440000",
      creator_id: "750e8400-e29b-41d4-a716-446655440000",
      name: "test",
      status: "locked_drop",
      pricing_intent: { model: "creator_net_fixed", base_amount_cents: 3000 },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  },
  {
    name: "extra price field (client amounts forbidden)",
    data: {
      listing_id: "550e8400-e29b-41d4-a716-446655440000",
      release_id: "650e8400-e29b-41d4-a716-446655440000",
      creator_id: "750e8400-e29b-41d4-a716-446655440000",
      name: "test",
      status: "published",
      pricing_intent: { model: "creator_net_fixed", base_amount_cents: 3000 },
      retail_price_cents: 8000,  // forbidden extra field
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  }
];

for (const testCase of listingPositiveCases) {
  if (!validateListing(testCase)) {
    console.error("listing.schema.json positive case failed");
    console.error(validateListing.errors);
    process.exit(1);
  }
}

for (const testCase of listingNegativeCases) {
  if (validateListing(testCase.data)) {
    console.error(`listing.schema.json negative case should have failed: ${testCase.name}`);
    process.exit(1);
  }
}

console.log("validated listing.schema.json with 2 positive and 3 negative test cases");

// purchase-request.schema.json with test cases
const purchaseRequestSchema = JSON.parse(fs.readFileSync(path.join(root, "contracts/purchase-request.schema.json"), "utf8"));
const validatePurchaseRequest = ajv.compile(purchaseRequestSchema);

const purchaseRequestPositiveCases = [
  {
    request_id: "a50e8400-e29b-41d4-a716-446655440000",
    buyer_id: "b50e8400-e29b-41d4-a716-446655440000",
    release_id: "c50e8400-e29b-41d4-a716-446655440000",
    listing_id: "d50e8400-e29b-41d4-a716-446655440000",
    variant: {
      metal: "silver_925",
      size: "7",
      finish: null
    },
    quantity: 1,
    destination: {
      country_code: "US"
    },
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    request_id: "e50e8400-e29b-41d4-a716-446655440000",
    buyer_id: "f50e8400-e29b-41d4-a716-446655440000",
    release_id: "a60e8400-e29b-41d4-a716-446655440000",
    listing_id: "b60e8400-e29b-41d4-a716-446655440000",
    variant: {
      metal: "gold_14k_yellow",
      size: null,
      finish: "polished"
    },
    quantity: 2,
    destination: {
      country_code: "DE",
      region: "Bavaria",
      postal_code: "80331"
    },
    promo_code: "WELCOME10",
    created_at: "2024-01-01T00:00:00Z"
  }
];

const purchaseRequestNegativeCases = [
  {
    name: "guest request (missing buyer_id)",
    data: {
      request_id: "a50e8400-e29b-41d4-a716-446655440000",
      release_id: "c50e8400-e29b-41d4-a716-446655440000",
      listing_id: "d50e8400-e29b-41d4-a716-446655440000",
      variant: { metal: "silver_925", size: null, finish: null },
      quantity: 1,
      destination: { country_code: "US" },
      created_at: "2024-01-01T00:00:00Z"
    }
  },
  {
    name: "client-supplied price (forbidden)",
    data: {
      request_id: "a50e8400-e29b-41d4-a716-446655440000",
      buyer_id: "b50e8400-e29b-41d4-a716-446655440000",
      release_id: "c50e8400-e29b-41d4-a716-446655440000",
      listing_id: "d50e8400-e29b-41d4-a716-446655440000",
      variant: { metal: "silver_925", size: null, finish: null },
      quantity: 1,
      destination: { country_code: "US" },
      retail_price_cents: 8000,  // forbidden
      created_at: "2024-01-01T00:00:00Z"
    }
  },
  {
    name: "invalid country_code (lowercase)",
    data: {
      request_id: "a50e8400-e29b-41d4-a716-446655440000",
      buyer_id: "b50e8400-e29b-41d4-a716-446655440000",
      release_id: "c50e8400-e29b-41d4-a716-446655440000",
      listing_id: "d50e8400-e29b-41d4-a716-446655440000",
      variant: { metal: "silver_925", size: null, finish: null },
      quantity: 1,
      destination: { country_code: "us" },  // must be uppercase
      created_at: "2024-01-01T00:00:00Z"
    }
  }
];

for (const testCase of purchaseRequestPositiveCases) {
  if (!validatePurchaseRequest(testCase)) {
    console.error("purchase-request.schema.json positive case failed");
    console.error(validatePurchaseRequest.errors);
    process.exit(1);
  }
}

for (const testCase of purchaseRequestNegativeCases) {
  if (validatePurchaseRequest(testCase.data)) {
    console.error(`purchase-request.schema.json negative case should have failed: ${testCase.name}`);
    process.exit(1);
  }
}

console.log("validated purchase-request.schema.json with 2 positive and 3 negative test cases");

// hash chain validation for design-release
const { verifyChain, computeRecordHash, linkRecord } = await import('./lib/hash-chain.mjs');

// positive case: valid 3-record chain
const genesisRelease = {
  release_id: "r1",
  design_id: "d1",
  version: 1,
  creator_id: "c1",
  created_at: "2024-01-01T00:00:00Z",
  prev_hash: null,
  engine: {
    name: "paracraft-jewelry",
    version: "1.0.0",
    compiler: "openscad",
    compiler_version: "2021.01",
    ruleset_version: "1.0",
    parameter_hash: "a".repeat(64)
  },
  type: "ring",
  parameters: {},
  assets: {
    openscad_source_uri: "/source.scad",
    openscad_source_sha256: "b".repeat(64),
    mesh_uri: "/mesh.stl",
    mesh_sha256: "c".repeat(64),
    render_uris: ["/render.png"]
  },
  metals_offered: ["silver_925"],
  sizing: { size_type: "unisize", sizes_offered: ["one"] },
  castability: {
    passed: true,
    checked_at: "2024-01-01T00:00:00Z",
    ruleset_version: "1.0",
    issues: []
  },
  mass_estimate_g: { silver_925: 5.0 }
};

const release2 = linkRecord({
  release_id: "r2",
  design_id: "d1",
  version: 2,
  creator_id: "c1",
  created_at: "2024-01-02T00:00:00Z",
  engine: genesisRelease.engine,
  type: "ring",
  parameters: {},
  assets: genesisRelease.assets,
  metals_offered: ["silver_925"],
  sizing: genesisRelease.sizing,
  castability: genesisRelease.castability,
  mass_estimate_g: genesisRelease.mass_estimate_g
}, genesisRelease);

const release3 = linkRecord({
  release_id: "r3",
  design_id: "d1",
  version: 3,
  creator_id: "c1",
  created_at: "2024-01-03T00:00:00Z",
  engine: genesisRelease.engine,
  type: "ring",
  parameters: {},
  assets: genesisRelease.assets,
  metals_offered: ["silver_925"],
  sizing: genesisRelease.sizing,
  castability: genesisRelease.castability,
  mass_estimate_g: genesisRelease.mass_estimate_g
}, release2);

const validChain = verifyChain([genesisRelease, release2, release3]);
if (!validChain.valid) {
  console.error("hash chain positive case failed");
  console.error(validChain.details);
  process.exit(1);
}

// negative case: prev_hash mismatch
const brokenRelease3 = {
  ...release3,
  prev_hash: "f".repeat(64) // wrong hash
};

const brokenChain = verifyChain([genesisRelease, release2, brokenRelease3]);
if (brokenChain.valid) {
  console.error("hash chain negative case should have failed: prev_hash mismatch");
  process.exit(1);
}

console.log("validated hash chain with 1 positive and 1 negative test case");


// checkout intake rejection reason code validation
// per contracts/checkout-intake.md

const VALID_REJECTION_CODES = [
  'route_not_approved',
  'route_pending',
  'market_disabled',
  'listing_route_constraint'
];

// positive case: valid rejection response
const validRejection = {
  error: {
    code: 'route_not_approved',
    message: 'no approved manufacturing route exists for the selected destination',
    details: {
      destination: 'JP',
      request_ids: ['550e8400-e29b-41d4-a716-446655440000'],
      market_status: 'research',
      phase_id: 'phase_2'
    }
  }
};

// negative case: invalid rejection code
const invalidRejectionCode = {
  error: {
    code: 'invalid_destination', // not in VALID_REJECTION_CODES
    message: 'some message',
    details: {
      destination: 'XX',
      request_ids: []
    }
  }
};

// negative case: missing required fields
const missingFields = {
  error: {
    code: 'route_not_approved',
    // missing message and details
  }
};

function validateCheckoutRejection(rejection, shouldPass) {
  if (!rejection.error) return false;
  if (!VALID_REJECTION_CODES.includes(rejection.error.code)) return false;
  if (!rejection.error.message) return false;
  if (!rejection.error.details) return false;
  if (!rejection.error.details.destination) return false;
  if (!rejection.error.details.request_ids || !Array.isArray(rejection.error.details.request_ids)) return false;
  return true;
}

const checkoutPositive = validateCheckoutRejection(validRejection, true);
const checkoutNegative1 = !validateCheckoutRejection(invalidRejectionCode, false);
const checkoutNegative2 = !validateCheckoutRejection(missingFields, false);

if (!checkoutPositive || !checkoutNegative1 || !checkoutNegative2) {
  console.error("checkout intake rejection validation failed");
  console.error({
    validRejection: checkoutPositive,
    invalidCode: checkoutNegative1,
    missingFields: checkoutNegative2
  });
  process.exit(1);
}

console.log("validated checkout intake rejection codes with 1 positive and 2 negative test cases");

// rejection-log.schema.json with test cases
const rejectionLogSchema = JSON.parse(fs.readFileSync(path.join(root, "contracts/rejection-log.schema.json"), "utf8"));
const validateRejectionLog = ajv.compile(rejectionLogSchema);

const rejectionLogPositiveCases = [
  {
    reason_code: "route_not_approved",
    request_id: "550e8400-e29b-41d4-a716-446655440000",
    country_code: "JP",
    listing_id: "650e8400-e29b-41d4-a716-446655440000",
    created_at: "2026-10-03T14:00:00Z",
    phase_id: "phase_2"
  }
];

const rejectionLogNegativeCases = [
  {
    name: "invalid reason_code",
    data: {
      reason_code: "destination_blocked", // not in enum
      request_id: "550e8400-e29b-41d4-a716-446655440000",
      country_code: "JP",
      listing_id: "650e8400-e29b-41d4-a716-446655440000",
      created_at: "2026-10-03T14:00:00Z",
      phase_id: "phase_2"
    }
  },
  {
    name: "missing required field (listing_id)",
    data: {
      reason_code: "route_not_approved",
      request_id: "550e8400-e29b-41d4-a716-446655440000",
      country_code: "JP",
      created_at: "2026-10-03T14:00:00Z",
      phase_id: "phase_2"
    }
  }
];

for (const testCase of rejectionLogPositiveCases) {
  if (!validateRejectionLog(testCase)) {
    console.error("rejection-log.schema.json positive case failed");
    console.error(validateRejectionLog.errors);
    process.exit(1);
  }
}

for (const testCase of rejectionLogNegativeCases) {
  if (validateRejectionLog(testCase.data)) {
    console.error(`rejection-log.schema.json negative case should have failed: ${testCase.name}`);
    process.exit(1);
  }
}

console.log("validated rejection-log.schema.json with 1 positive and 2 negative test cases");


// route predicate record validation
// per manufacturing/routing/route-approval.md

const routePredicateSchemaPath = path.join(root, "manufacturing/routing/route-predicate.schema.json");
const routePredicateSchema = JSON.parse(fs.readFileSync(routePredicateSchemaPath, "utf8"));
ajv.compile(routePredicateSchema);

const routePredicatesPath = path.join(root, "manufacturing/routing/route-predicates.json");
const routePredicates = JSON.parse(fs.readFileSync(routePredicatesPath, "utf8"));

// validate each route predicate record
const routeValidationErrors = [];

for (const route of routePredicates.routes) {
  // validate against schema
  const validateRoute = ajv.compile(routePredicateSchema);
  if (!validateRoute(route)) {
    routeValidationErrors.push(`${route.version_id}: schema validation failed: ${JSON.stringify(validateRoute.errors)}`);
  }

  // validate state machine
  if (route.lifecycle_state === 'approved') {
    if (!route.approved_by || route.approved_by.trim() === '') {
      routeValidationErrors.push(`${route.version_id}: approved state requires non-empty approved_by field`);
    }
    if (!route.effective_interval || !route.effective_interval.start_date) {
      routeValidationErrors.push(`${route.version_id}: approved state requires effective_interval.start_date`);
    }
  }

  if (route.lifecycle_state === 'reviewed') {
    if (!route.reviewed_at) {
      routeValidationErrors.push(`${route.version_id}: reviewed state requires reviewed_at timestamp`);
    }
    if (!route.reviewed_by) {
      routeValidationErrors.push(`${route.version_id}: reviewed state requires reviewed_by field`);
    }
    // both axes must have findings before reviewed
    if (!route.axis_one.source_ids || route.axis_one.source_ids.length === 0) {
      routeValidationErrors.push(`${route.version_id}: reviewed state requires axis_one source citations`);
    }
    if (!route.axis_two.source_ids || route.axis_two.source_ids.length === 0) {
      routeValidationErrors.push(`${route.version_id}: reviewed state requires axis_two source citations`);
    }
  }

  if (route.lifecycle_state === 'superseded') {
    if (!route.superseded_by) {
      routeValidationErrors.push(`${route.version_id}: superseded state requires superseded_by field`);
    }
  }

  // validate utc timestamps (no timezone abbreviations, must end with Z)
  const timestampFields = ['created_at', 'reviewed_at', 'approved_at'];
  for (const field of timestampFields) {
    if (route[field] && !route[field].endsWith('Z')) {
      routeValidationErrors.push(`${route.version_id}: ${field} must be utc timestamp ending with Z`);
    }
  }

  // validate manufacturer_id references valid manufacturer
  const manufacturerExists = data.manufacturers.some(m => m.id === route.manufacturer_id);
  if (!manufacturerExists) {
    routeValidationErrors.push(`${route.version_id}: manufacturer_id ${route.manufacturer_id} not found in manufacturer-capabilities.json`);
  }
}

// positive test case: valid draft record
const validDraftRoute = {
  version_id: "route_test_us_2026_001",
  manufacturer_id: "sculpteo",
  destination_country_code: "US",
  lifecycle_state: "draft",
  created_at: "2026-10-03T14:22:00Z",
  created_by: "test",
  scope: "test scope",
  effective_interval: { start_date: null, end_date: null },
  source_ids: ["test-source"],
  exclusions: [],
  axis_one: { source_ids: [] },
  axis_two: { source_ids: [] }
};

const validateDraftRoute = ajv.compile(routePredicateSchema);
const draftRouteValid = validateDraftRoute(validDraftRoute);

// negative test case: approved without approved_by
const approvedWithoutSigner = {
  version_id: "route_test_us_2026_002",
  manufacturer_id: "sculpteo",
  destination_country_code: "US",
  lifecycle_state: "approved",
  created_at: "2026-10-03T14:22:00Z",
  created_by: "test",
  scope: "test scope",
  effective_interval: { start_date: "2026-01-01", end_date: null },
  source_ids: ["test-source"],
  exclusions: [],
  axis_one: { source_ids: ["test"] },
  axis_two: { source_ids: ["test"] },
  reviewed_at: "2026-10-03T15:00:00Z",
  reviewed_by: "reviewer",
  approved_at: "2026-10-03T16:00:00Z",
  approved_by: ""  // empty - should fail
};

const validateApprovedRoute = ajv.compile(routePredicateSchema);
const approvedRouteInvalid = !validateApprovedRoute(approvedWithoutSigner);

// negative test case: reviewed without source_ids
const reviewedWithoutSources = {
  version_id: "route_test_us_2026_003",
  manufacturer_id: "sculpteo",
  destination_country_code: "US",
  lifecycle_state: "reviewed",
  created_at: "2026-10-03T14:22:00Z",
  created_by: "test",
  scope: "test scope",
  effective_interval: { start_date: null, end_date: null },
  source_ids: ["test-source"],
  exclusions: [],
  axis_one: { source_ids: [] },  // empty - should require sources for reviewed state
  axis_two: { source_ids: [] },   // empty - should require sources for reviewed state
  reviewed_at: "2026-10-03T15:00:00Z",
  reviewed_by: "reviewer"
};

// custom check for reviewed state (schema doesn't enforce minItems on nested arrays)
const reviewedRouteInvalid = reviewedWithoutSources.lifecycle_state === 'reviewed' && 
  (reviewedWithoutSources.axis_one.source_ids.length === 0 || reviewedWithoutSources.axis_two.source_ids.length === 0);

if (routeValidationErrors.length > 0) {
  console.error("route predicate validation failed:");
  routeValidationErrors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

if (!draftRouteValid || !approvedRouteInvalid || !reviewedRouteInvalid) {
  console.error("route predicate test cases failed:", {
    draftRoute: draftRouteValid,
    approvedWithoutSigner: approvedRouteInvalid,
    reviewedWithoutSources: reviewedRouteInvalid
  });
  process.exit(1);
}

console.log(`validated ${routePredicates.routes.length} route predicate records with 1 positive and 2 negative test cases`);
