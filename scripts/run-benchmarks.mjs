// run-benchmarks.mjs
// the paracraft benchmark harness.
//
// what it does:
//   1. checks that the pinned openscad docker image is available (refuses to run without it)
//   2. compiles each benchmarks/*.scad file to a binary stl via the pinned image
//   3. loads and measures each stl using paracraft/measure/measurements.js
//   4. validates each measurement against the profile in research/profiles/
//   5. compares the actual validation status against the expected verdict in benchmarks/manifest.json
//   6. writes benchmarks/report.json and benchmarks/report.md
//
// design rules:
//   - deterministic: same inputs produce the same bytes in the report body.
//     no timestamps, no random values, no date functions in the report body.
//     run metadata (docker image digest, host platform) goes in a separate
//     metadata field and does not appear in the per-model result rows.
//   - verdict mismatch is a harness failure: per the spec, "a rule set that
//     produces unexpected verdicts on the pathological set is wrong, not the
//     pieces."
//   - the harness never reconciles conflicts or invents constraint values.
//     it measures what is there and reports what it finds.
//   - one stl is compiled per family scad file. the family file renders all
//     variants together (that is how the scad files are structured). the
//     measurement applies to the combined mesh. for families with multiple
//     manifest entries, the actual validation status is compared against each
//     entry's expected verdict; a mismatch on any entry is a harness failure.
//     this is the correct interpretation because the five ready measurements
//     (topology, nested, clearance, wall, bounding_box) apply to the mesh as
//     a whole and the manifest documents what the harness should find.
//
// toolchain pins:
//   openscad image: openscad/openscad:2021.01
//   image digest:   pinned at build time via "docker inspect" (see PINNED_IMAGE below)
//   measurement library: paracraft/measure/measurements.js (this repo)
//   validation library:  paracraft/validate/validate.js (this repo)
//
// invocation: node scripts/run-benchmarks.mjs [--no-compile] [--family <name>]
//   --no-compile  skip docker compile; use existing stl files in benchmarks/stl/
//   --family      run only one family by name (e.g. wall-ladder)

import { execSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { measure } from "../paracraft/measure/measurements.js";
import { loadSTL } from "../paracraft/measure/mesh.js";
import { validate } from "../paracraft/validate/validate.js";

// ---- toolchain pins --------------------------------------------------------

const PINNED_IMAGE = "openscad/openscad:2021.01";
// image digest is recorded at runtime via "docker inspect" into the metadata.
// we do not hardcode a digest here because the image may be pulled from
// multiple registries and the digest observed locally is the authoritative pin.
// the harness refuses to run with a different image tag.

const OPENSCAD_EXPORT_FORMAT = "binstl";

// ---- paths -----------------------------------------------------------------

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BENCHMARKS_DIR = path.join(ROOT, "benchmarks");
const STL_DIR = path.join(BENCHMARKS_DIR, "stl");
const MANIFEST_PATH = path.join(BENCHMARKS_DIR, "manifest.json");
const REPORT_JSON_PATH = path.join(BENCHMARKS_DIR, "report.json");
const REPORT_MD_PATH = path.join(BENCHMARKS_DIR, "report.md");

// ---- helpers ---------------------------------------------------------------

function die(msg) {
  process.stderr.write(`run-benchmarks: error: ${msg}\n`);
  process.exit(1);
}

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

// map manifest "expected" labels to the status strings validate() returns.
// manifest uses: "fail", "warning", "needs-manual-review"
// validate() returns: "invalid", "warning", "manual_review", "valid"
const EXPECTED_MAP = {
  "fail":                "invalid",
  "warning":             "warning",
  "needs-manual-review": "manual_review",
  "pass":                "valid",
};

function canonicalExpected(raw) {
  return EXPECTED_MAP[raw] ?? raw;
}

// stable json serialiser: keys sorted, no trailing spaces.
function stableJson(obj) {
  return JSON.stringify(obj, sortedReplacer, 2);
}

function sortedReplacer(key, value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
    );
  }
  return value;
}

// sha256 of a file for provenance recording.
function sha256File(filePath) {
  const buf = readFileSync(filePath);
  return createHash("sha256").update(buf).digest("hex");
}

// sha256 of a string.
function sha256Str(str) {
  return createHash("sha256").update(str, "utf8").digest("hex");
}

// ---- docker guard ----------------------------------------------------------

function checkDockerAvailable() {
  const result = spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], {
    encoding: "utf8",
    timeout: 10000,
  });
  if (result.error || result.status !== 0) {
    die(
      "docker is not available on this machine. the harness requires:\n" +
      `  docker image: ${PINNED_IMAGE}\n` +
      "  to run headless openscad compilation.\n\n" +
      "  if docker is installed but not on PATH, add it and retry.\n" +
      "  if docker is not installed, install docker desktop and pull the image:\n" +
      `    docker pull ${PINNED_IMAGE}\n\n` +
      "  to skip compilation and use existing stl files, run with --no-compile.\n" +
      "  note: --no-compile results are only valid if the stl files were previously\n" +
      "  produced by the pinned image. see benchmarks/stl/provenance.json."
    );
  }
  return result.stdout.trim();
}

function getImageDigest() {
  const result = spawnSync(
    "docker",
    ["inspect", "--format", "{{index .RepoDigests 0}}", PINNED_IMAGE],
    { encoding: "utf8", timeout: 15000 }
  );
  if (result.error || result.status !== 0) {
    // image may not be pulled yet; return a placeholder
    return "not-pulled";
  }
  const digest = result.stdout.trim();
  return digest || "not-available";
}

function pullImageIfNeeded() {
  const result = spawnSync("docker", ["image", "inspect", PINNED_IMAGE], {
    encoding: "utf8",
    timeout: 10000,
  });
  if (result.status !== 0) {
    log(`pulling ${PINNED_IMAGE} ...`);
    const pull = spawnSync("docker", ["pull", PINNED_IMAGE], {
      stdio: "inherit",
      timeout: 300000, // 5 minutes
    });
    if (pull.status !== 0) {
      die(`could not pull ${PINNED_IMAGE}. check your docker configuration.`);
    }
  }
}

// ---- openscad compile -------------------------------------------------------

// parseDefines: turn "case=p001a" into ["-D", 'case="p001a"'] for openscad.
// each token is "key=value"; the value is passed as a quoted string.
// "default" and "" are ignored (no -D override).
function parseDefines(paramStr) {
  if (!paramStr || paramStr === "default") return [];
  const defs = [];
  for (const token of paramStr.trim().split(/\s+/)) {
    const eq = token.indexOf("=");
    if (eq < 0) continue;
    const key = token.slice(0, eq);
    const val = token.slice(eq + 1);
    // pass string values quoted so openscad parses them as strings not identifiers
    defs.push("-D", `${key}="${val}"`);
  }
  return defs;
}

function compileScad(scadPath, stlPath, paramStr) {
  // mount the repo root as /workdir; openscad reads from /workdir/benchmarks/
  const relScad = path.relative(ROOT, scadPath).replace(/\\/g, "/");
  const relStl = path.relative(ROOT, stlPath).replace(/\\/g, "/");
  const defines = parseDefines(paramStr);

  // openscad cli: openscad -o output.stl --export-format binstl [-D ...] input.scad
  const args = [
    "run", "--rm",
    "--volume", `${ROOT}:/workdir`,
    PINNED_IMAGE,
    "openscad",
    "--export-format", OPENSCAD_EXPORT_FORMAT,
    "-o", `/workdir/${relStl}`,
    ...defines,
    `/workdir/${relScad}`,
  ];

  const label = defines.length ? `${path.basename(scadPath)} (${paramStr})` : path.basename(scadPath);
  log(`  compiling ${label} ...`);
  const result = spawnSync("docker", args, {
    encoding: "utf8",
    timeout: 120000, // 2 minutes per file
  });

  if (result.status !== 0) {
    return {
      ok: false,
      stderr: result.stderr ?? "",
      stdout: result.stdout ?? "",
    };
  }
  return { ok: true, stderr: result.stderr ?? "" };
}

// ---- verdict comparison -----------------------------------------------------

// a "mismatch" is when the actual validation status does not match the expected.
// the comparison is lenient for the "needs-manual-review" / "manual_review" case:
// if expected is manual_review and actual is also manual_review, that is a match.
// if expected is warning and actual is warning, that is a match.
// if expected is invalid and actual is invalid, that is a match.
// the harness never promotes a mismatch to a pass.
function verdictMatch(expected, actualStatus) {
  const canonical = canonicalExpected(expected);
  if (canonical === actualStatus) return true;
  // "warning" in the manifest means ctr-wall-001 fires; validate() returns
  // "warning" only when there are warnings but no errors and no unmeasured.
  // the manifest notes say "warning or manual_review" for most warning entries.
  // we allow manual_review to satisfy a warning expectation because unmeasured
  // constraints are present in every compile. see notes in manifest.json.
  if (canonical === "warning" && actualStatus === "manual_review") return true;
  // "fail" means invalid; no leniency there.
  return false;
}

// ---- main harness -----------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const noCompile = args.includes("--no-compile");
  const familyFilter = (() => {
    const idx = args.indexOf("--family");
    return idx >= 0 ? args[idx + 1] : null;
  })();

  // load manifest
  if (!existsSync(MANIFEST_PATH)) {
    die(`manifest not found: ${MANIFEST_PATH}`);
  }
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

  // load all profiles referenced by manifest rule_sets
  const profiles = {};
  for (const rs of manifest.rule_sets) {
    const profilePath = path.join(ROOT, rs.file);
    if (!existsSync(profilePath)) {
      die(`profile not found: ${profilePath}`);
    }
    const profile = JSON.parse(readFileSync(profilePath, "utf8"));
    const key = `${rs.id}@${rs.version}`;
    profiles[key] = profile;
  }

  // docker check
  let dockerVersion = null;
  let imageDigest = null;
  if (!noCompile) {
    log("checking docker ...");
    dockerVersion = checkDockerAvailable();
    pullImageIfNeeded();
    imageDigest = getImageDigest();
    log(`  docker server: ${dockerVersion}`);
    log(`  image: ${PINNED_IMAGE}`);
    log(`  digest: ${imageDigest}`);
  } else {
    log("--no-compile: skipping docker. using existing stl files.");
  }

  // ensure stl output dir
  if (!existsSync(STL_DIR)) {
    mkdirSync(STL_DIR, { recursive: true });
  }

  // filter families
  const families = familyFilter
    ? manifest.families.filter((f) => f.family === familyFilter)
    : manifest.families;

  if (families.length === 0) {
    die(`no families matched${familyFilter ? ` filter: ${familyFilter}` : ""}`);
  }

  // per-family results, stable order from manifest
  const familyResults = [];
  let totalModels = 0;
  let passedModels = 0;
  let mismatchedModels = 0;
  let errorModels = 0;

  // measureStl: load an stl and validate it against all rule sets.
  // returns { stl_sha256, measurements, validation } or null if file missing.
  function measureStl(stlPath) {
    if (!existsSync(stlPath)) return null;
    const sha = sha256File(stlPath);
    const buf = readFileSync(stlPath);
    const mesh = loadSTL(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const m = measure(mesh);
    const validation = {};
    for (const rs of manifest.rule_sets) {
      const key = `${rs.id}@${rs.version}`;
      validation[key] = validate(m, profiles[key]);
    }
    return { stl_sha256: sha, measurements: m, validation };
  }

  // isPerModel: true when any model in the family has a non-default parameter.
  // per-model families compile one stl per model using -D overrides.
  function isPerModel(family) {
    return family.models.some((m) => m.parameter && m.parameter !== "default");
  }

  for (const family of families) {
    const scadPath = path.join(ROOT, family.file);
    if (!existsSync(scadPath)) {
      die(`scad file not found: ${scadPath}`);
    }

    const perModel = isPerModel(family);

    const familyResult = {
      family: family.family,
      scad_file: family.file,
      stl_file: perModel ? "per-model" : `benchmarks/stl/${family.family}.stl`,
      compile: { ok: true, stderr_tail: "" },
      stl_sha256: perModel ? null : null,
      measurements: perModel ? null : null,
      validation: perModel ? null : {},
      model_results: [],
    };

    if (perModel) {
      // ---- per-model mode: one stl per manifest model entry ----
      log(`  ${family.family}: per-model compilation (${family.models.length} models)`);

      for (const model of family.models) {
        totalModels += 1;
        const stlName = `${family.family}-${model.id}.stl`;
        const stlPath = path.join(STL_DIR, stlName);

        let compileOk = true;
        let stderrTail = "";
        if (!noCompile) {
          const cr = compileScad(scadPath, stlPath, model.parameter);
          compileOk = cr.ok;
          stderrTail = cr.stderr ? cr.stderr.trim().split("\n").slice(-5).join("\n") : "";
          if (!compileOk) log(`    compile failed for ${model.id}`);
        }

        const measured = measureStl(stlPath);
        const modelResult = {
          id: model.id,
          description: model.description,
          parameter: model.parameter,
          compile: { ok: compileOk, stderr_tail: stderrTail },
          stl_file: `benchmarks/stl/${stlName}`,
          stl_sha256: measured?.stl_sha256 ?? null,
          results: {},
        };

        if (!measured) {
          errorModels += 1;
          for (const rsKey of Object.keys(model.verdicts)) {
            modelResult.results[rsKey] = {
              expected: model.verdicts[rsKey].expected,
              actual: "stl-missing",
              match: false,
              note: "stl not available; compile failed",
            };
          }
        } else {
          for (const rsKey of Object.keys(model.verdicts)) {
            const expected = model.verdicts[rsKey].expected;
            const validation = measured.validation[rsKey];
            if (!validation) {
              modelResult.results[rsKey] = {
                expected,
                actual: "no-validation",
                match: false,
                note: "rule set not in harness profiles",
              };
              mismatchedModels += 1;
              continue;
            }
            const actual = validation.status;
            const match = verdictMatch(expected, actual);
            modelResult.results[rsKey] = { expected, actual, match };
            if (match) {
              passedModels += 1;
            } else {
              mismatchedModels += 1;
              log(`    MISMATCH ${model.id}: expected=${expected} actual=${actual}`);
            }
          }
          log(`    ${model.id}: status=${measured.validation[Object.keys(model.verdicts)[0]]?.status}`);
        }

        familyResult.model_results.push(modelResult);
      }

    } else {
      // ---- family mode: one stl for the whole family ----
      const stlName = `${family.family}.stl`;
      const stlPath = path.join(STL_DIR, stlName);
      familyResult.stl_file = `benchmarks/stl/${stlName}`;

      let compileResult = { ok: true, stderr: "" };
      if (!noCompile) {
        compileResult = compileScad(scadPath, stlPath);
        if (!compileResult.ok) log(`  compile failed for ${family.family}`);
      }
      familyResult.compile = {
        ok: compileResult.ok,
        stderr_tail: compileResult.stderr
          ? compileResult.stderr.trim().split("\n").slice(-5).join("\n")
          : "",
      };

      const measured = measureStl(stlPath);
      if (measured) {
        familyResult.stl_sha256 = measured.stl_sha256;
        familyResult.measurements = measured.measurements;
        familyResult.validation = measured.validation;
        for (const rs of manifest.rule_sets) {
          const key = `${rs.id}@${rs.version}`;
          log(`  ${family.family} / ${key}: status=${measured.validation[key].status}`);
        }

        for (const model of family.models) {
          totalModels += 1;
          const modelResult = {
            id: model.id,
            description: model.description,
            parameter: model.parameter,
            results: {},
          };
          for (const rsKey of Object.keys(model.verdicts)) {
            const expected = model.verdicts[rsKey].expected;
            const validation = measured.validation[rsKey];
            if (!validation) {
              modelResult.results[rsKey] = {
                expected,
                actual: "no-validation",
                match: false,
                note: "rule set not in harness profiles",
              };
              mismatchedModels += 1;
              continue;
            }
            const actual = validation.status;
            const match = verdictMatch(expected, actual);
            modelResult.results[rsKey] = { expected, actual, match };
            if (match) {
              passedModels += 1;
            } else {
              mismatchedModels += 1;
              log(`  MISMATCH ${model.id}: expected=${expected} actual=${actual}`);
            }
          }
          familyResult.model_results.push(modelResult);
        }
      } else {
        log(`  no stl for ${family.family} (compile failed and no cached file)`);
        for (const model of family.models) {
          totalModels += 1;
          errorModels += 1;
          familyResult.model_results.push({
            id: model.id,
            description: model.description,
            parameter: model.parameter,
            results: Object.fromEntries(
              Object.keys(model.verdicts).map((rsKey) => [
                rsKey,
                {
                  expected: model.verdicts[rsKey].expected,
                  actual: "stl-missing",
                  match: false,
                  note: "stl not available; compile failed",
                },
              ])
            ),
          });
        }
      }
    }

    familyResults.push(familyResult);
    log("");
  }

  // ---- build report --------------------------------------------------------

  const allMatch = mismatchedModels === 0 && errorModels === 0;

  // metadata (run context, not interleaved with results)
  const metadata = {
    harness_version: "1",
    schema: "benchmark-report-v1",
    pinned_image: PINNED_IMAGE,
    image_digest: imageDigest ?? "skipped",
    docker_server_version: dockerVersion ?? "skipped",
    measurement_library: "paracraft/measure/measurements.js",
    validation_library: "paracraft/validate/validate.js",
    manifest_sha256: sha256File(MANIFEST_PATH),
    no_compile_mode: noCompile,
  };

  // strip non-deterministic fields from measurements in the report body.
  // at_face, at_point etc. are deterministic for a given mesh; they are kept.
  // nothing from the runtime environment appears in the body.

  const report = {
    schema: "benchmark-report-v1",
    summary: {
      total_models: totalModels,
      passed: passedModels,
      mismatched: mismatchedModels,
      errors: errorModels,
      all_match: allMatch,
    },
    families: familyResults,
    metadata,
  };

  // write report.json (stable key order)
  const reportJson = stableJson(report);
  writeFileSync(REPORT_JSON_PATH, reportJson + "\n", "utf8");

  // write report.md
  writeFileSync(REPORT_MD_PATH, buildMarkdownReport(report), "utf8");

  // provenance file for stl dir
  if (!noCompile && imageDigest) {
    const provenancePath = path.join(STL_DIR, "provenance.json");
    // collect stl entries from both family-level and per-model results
    const stlEntries = [];
    for (const f of familyResults) {
      if (f.stl_sha256) {
        stlEntries.push({ file: f.stl_file, sha256: f.stl_sha256 });
      }
      for (const mr of f.model_results ?? []) {
        if (mr.stl_sha256) {
          stlEntries.push({ file: mr.stl_file, sha256: mr.stl_sha256 });
        }
      }
    }
    const provenance = stableJson({
      pinned_image: PINNED_IMAGE,
      image_digest: imageDigest,
      docker_server_version: dockerVersion,
      stl_files: stlEntries,
    });
    writeFileSync(provenancePath, provenance + "\n", "utf8");
  }

  log(`summary: ${totalModels} models, ${passedModels} matched, ${mismatchedModels} mismatched, ${errorModels} errors`);
  log(`report: ${REPORT_JSON_PATH}`);
  log(`report: ${REPORT_MD_PATH}`);

  if (!allMatch) {
    log("");
    log("harness failure: verdict mismatches detected. see report for details.");
    log("per spec: a rule set that produces unexpected verdicts is wrong, not the pieces.");
    process.exit(1);
  }
  log("all verdicts matched.");
}

// ---- markdown report builder -----------------------------------------------

function buildMarkdownReport(report) {
  const s = report.summary;
  const lines = [];

  lines.push("# paracraft benchmark report");
  lines.push("");
  lines.push("## summary");
  lines.push("");
  lines.push(`- total models: ${s.total_models}`);
  lines.push(`- matched: ${s.passed}`);
  lines.push(`- mismatched: ${s.mismatched}`);
  lines.push(`- errors: ${s.errors}`);
  lines.push(`- all match: ${s.all_match}`);
  lines.push("");
  lines.push("## families");
  lines.push("");

  for (const fam of report.families) {
    lines.push(`### ${fam.family}`);
    lines.push("");
    lines.push(`- file: \`${fam.scad_file}\``);
    lines.push(`- stl: \`${fam.stl_file}\``);
    lines.push(`- compile ok: ${fam.compile.ok}`);
    if (fam.stl_sha256) {
      lines.push(`- stl sha256: \`${fam.stl_sha256}\``);
    }
    if (fam.measurements) {
      const m = fam.measurements;
      lines.push(`- vertices: ${m.vertex_count}, faces: ${m.face_count}`);
      lines.push(`- topology: manifold=${m.topology.manifold}, watertight=${m.topology.watertight}`);
      lines.push(`- components: ${m.components.count}`);
      lines.push(`- nested components: ${m.nested_components.count}`);
      const wt = m.wall_thickness.min_mm;
      lines.push(`- minimum wall thickness: ${wt !== null ? `${wt.toFixed(4)} mm` : "null"}`);
      const cl = m.clearance.min_mm;
      lines.push(`- clearance: ${cl !== null ? `${cl.toFixed(4)} mm` : "n/a (single component)"}`);
    }
    if (fam.compile.stderr_tail) {
      lines.push(`- compile warnings:`);
      lines.push("```");
      lines.push(fam.compile.stderr_tail);
      lines.push("```");
    }
    lines.push("");
    lines.push("#### model verdicts");
    lines.push("");
    lines.push("| id | expected | actual | match |");
    lines.push("|---|---|---|---|");
    for (const model of fam.model_results) {
      for (const [rsKey, res] of Object.entries(model.results)) {
        const matchStr = res.match ? "ok" : "MISMATCH";
        lines.push(`| ${model.id} | ${res.expected} | ${res.actual} | ${matchStr} |`);
      }
    }
    lines.push("");
  }

  lines.push("## provenance");
  lines.push("");
  lines.push(`- pinned image: \`${report.metadata.pinned_image}\``);
  lines.push(`- image digest: \`${report.metadata.image_digest}\``);
  lines.push(`- measurement library: \`${report.metadata.measurement_library}\``);
  lines.push(`- validation library: \`${report.metadata.validation_library}\``);
  lines.push(`- manifest sha256: \`${report.metadata.manifest_sha256}\``);
  lines.push("");

  return lines.join("\n") + "\n";
}

main().catch((err) => {
  process.stderr.write(`run-benchmarks: unhandled error: ${err.stack ?? err}\n`);
  process.exit(1);
});
