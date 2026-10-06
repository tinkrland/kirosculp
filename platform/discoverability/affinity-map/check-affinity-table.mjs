#!/usr/bin/env node
// affinity-map v0.1: the sanity check and reader for the structural table.
//
// verifies the committed affinity-table.json against a fresh rebuild from
// the pinned inputs (determinism), checks the structural integrity of the
// explanation objects, asserts the owner's sanity anchors, and prints the
// confusable cross-check with every drift named plus the full
// top-neighbors map so the owner can read the table.
//
// glossary drift does not fail this check: drift is a vocabulary finding,
// reported with the computed neighbors named, for the owner to resolve by
// authoring vocabulary or corpus edges. the check fails on anything that
// means the table is wrong: hash mismatches, coverage gaps, unexplained
// neighbors, missing cross-check entries, or a failed sanity anchor.
//
// usage: node platform/discoverability/affinity-map/check-affinity-table.mjs

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  buildTable,
  canonicalize,
  CONFIG_PATH,
  OUTPUT_PATH,
  REPO_ROOT,
  roundTo,
  sha256,
  sha256File,
} from "./build-affinity-table.mjs";

const TOLERANCE = 1e-8;

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, passed: Boolean(condition), detail });
}

function main() {
  const { config, configSha, table: rebuilt, inputHash, outputHash } = buildTable();
  const committedText = fs.readFileSync(OUTPUT_PATH, "utf8");
  const committed = JSON.parse(committedText);

  // determinism: a fresh rebuild must be byte-identical to the committed
  // table, and the recorded hashes must match both the rebuild and the
  // files on disk.
  const rebuiltText = `${JSON.stringify(rebuilt, null, 2)}\n`;
  check(
    "rebuild is byte-identical to the committed table",
    rebuiltText === committedText,
    "same inputs and config must produce the same bytes",
  );
  check(
    "recorded output hash matches the rebuilt table",
    committed.determinism.output_hash === outputHash,
    `committed ${committed.determinism.output_hash}, rebuilt ${outputHash}`,
  );
  check(
    "recorded input hash matches the rebuilt input hash",
    committed.determinism.input_hash === inputHash,
    `committed ${committed.determinism.input_hash}, rebuilt ${inputHash}`,
  );
  check(
    "committed table's own serialization seals to its recorded output hash",
    sha256(canonicalize(committed)) === committed.determinism.output_hash,
    "the artifact must carry a self-verifiable hash",
  );

  // staleness: the committed table must have been built from the exact
  // vocabulary files and config currently on disk.
  for (const vocab of committed.vocabularies) {
    const onDisk = sha256File(path.join(REPO_ROOT, vocab.path));
    check(
      `vocabulary file unchanged since the recorded run: ${vocab.path}`,
      onDisk === vocab.sha256,
      "rebuild the table after vocabulary changes",
    );
  }
  check(
    "config unchanged since the recorded run",
    sha256File(CONFIG_PATH) === configSha && committed.config.sha256 === configSha,
    "rebuild the table after config changes",
  );

  // version pinning.
  for (const vocab of committed.vocabularies) {
    check(
      `vocabulary versions pinned: ${vocab.key}`,
      vocab.records > 0 && Object.keys(vocab.versions).length > 0,
    );
  }
  check(
    "every term row pins its record version",
    committed.terms.every((row) => row.version !== null && row.version !== undefined),
  );

  // coverage: every vocabulary record has exactly one row.
  const rowIds = new Set(committed.terms.map((row) => row.term));
  const vocabInputs = [];
  for (const input of config.inputs) {
    const text = fs.readFileSync(path.join(REPO_ROOT, input.path), "utf8");
    const records = text.split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l));
    vocabInputs.push({ input, records });
    for (const record of records) {
      const id = record[input.term_id_field];
      check(`term present in table: ${id}`, rowIds.has(id));
    }
    const rows = committed.terms.filter((row) => row.vocabulary === input.key);
    check(
      `row count matches record count: ${input.key}`,
      rows.length === records.length,
      `${rows.length} rows, ${records.length} records`,
    );
  }
  check("term ids unique", committed.terms.length === rowIds.size);

  // neighbor list structure and explanation audit.
  const topK = config.scoring.top_k;
  let neighborCount = 0;
  for (const row of committed.terms) {
    const list = row.neighbors;
    check(`neighbor list length within top_k: ${row.term}`, list.length <= topK);
    let sortedOk = true;
    for (let i = 1; i < list.length; i += 1) {
      const prev = list[i - 1];
      const cur = list[i];
      if (cur.score > prev.score) sortedOk = false;
      if (cur.score === prev.score && cur.term < prev.term) sortedOk = false;
    }
    check(`neighbors ranked score descending, term id tiebreak: ${row.term}`, sortedOk);
    let structureOk = true;
    let detail = "";
    for (const neighbor of list) {
      neighborCount += 1;
      if (neighbor.term === row.term) { structureOk = false; detail = "self neighbor"; }
      if (neighbor.shared_facets.length === 0) { structureOk = false; detail = "neighbor without shared facets"; }
      if (neighbor.score <= config.scoring.min_score) { structureOk = false; detail = "neighbor at or below min_score"; }
      // every score is recomputable from its explanation object alone.
      let dot = 0;
      for (const facet of neighbor.shared_facets) {
        const recomputed = Math.sqrt(facet.left_weight * facet.right_weight) * facet.left * facet.right;
        if (Math.abs(recomputed - facet.contribution) > TOLERANCE) {
          structureOk = false;
          detail = `facet ${facet.facet} contribution mismatch`;
        }
        dot += facet.contribution;
      }
      const scoreFromExplanation = dot / (neighbor.norms[0] * neighbor.norms[1]);
      if (Math.abs(scoreFromExplanation - neighbor.score) > TOLERANCE) {
        structureOk = false;
        detail = "score not recomputable from explanation";
      }
    }
    check(`neighbor structure and explanations verify: ${row.term}`, structureOk, detail);
  }
  check(
    "summary neighbor edge count matches the rows",
    committed.summary.neighbor_edge_count === neighborCount,
  );

  // honest thin neighborhoods: the wear-context vocabulary carries no
  // facet content in v0.1, so its rows must have empty lists, not padded
  // or invented neighbors.
  for (const row of committed.terms.filter((r) => r.vocabulary === "wear-context")) {
    check(
      `wear-context neighborhood honestly empty: ${row.term}`,
      row.neighbors.length === 0 && row.facet_count === 0,
    );
  }

  // confusable cross-check completeness: every authored edge from the
  // vocabulary files appears exactly once, no extras, no unknown targets,
  // and every drift names its computed neighbors.
  const authored = [];
  for (const { input, records } of vocabInputs) {
    for (const record of records) {
      if (!Array.isArray(record.confusable_with)) continue;
      for (const target of record.confusable_with) {
        authored.push(`${record[input.term_id_field]}->${target}`);
      }
    }
  }
  const reported = committed.confusable_cross_check.map((e) => `${e.term}->${e.target}`);
  check(
    "every authored confusable edge is reported exactly once",
    authored.length === reported.length && authored.every((edge, i) => reported.includes(edge)),
    `authored ${authored.length}, reported ${reported.length}`,
  );
  check(
    "no unknown confusable targets",
    committed.summary.confusable_unknown_targets === 0,
  );
  check(
    "every drift entry names its computed neighbors",
    committed.confusable_cross_check
      .filter((e) => e.status === "drift")
      .every((e) => Array.isArray(e.computed_neighbors) && e.computed_neighbors.length > 0),
  );

  // owner sanity anchors.
  const top = (term, n = 1) => committed.terms.find((r) => r.term === term).neighbors.slice(0, n);
  const names = (list) => list.map((n) => n.term);
  check("brutalist's top neighbor is biker", names(top("brutalist", 1))[0] === "biker");
  check("biker's top neighbor is brutalist", names(top("biker", 1))[0] === "brutalist");
  check(
    "georgian's top-3 includes victorian and art_nouveau",
    names(top("georgian", 3)).includes("victorian")
      && names(top("georgian", 3)).includes("art_nouveau"),
  );
  check(
    "art_deco's top-3 includes egyptian_revival",
    names(top("art_deco", 3)).includes("egyptian_revival"),
  );

  // the union lesson, mechanized: celestial's real neighbors are
  // symbol-layer terms, so at least one symbol term must sit in its top-k.
  check(
    "celestial's top-k includes at least one symbol term",
    top("celestial", topK).some((n) => n.vocabulary === "symbol"),
  );

  // report.
  const out = [];
  out.push("== confusable cross-check (authored edge vs computed ranking) ==");
  for (const entry of committed.confusable_cross_check) {
    if (entry.status === "confirmed") {
      out.push(`  ${entry.term} -> ${entry.target}: confirmed at rank ${entry.rank} (score ${entry.target_score})`);
    } else if (entry.status === "drift") {
      out.push(
        `  ${entry.term} -> ${entry.target}: DRIFT, rank ${entry.rank ?? "none"} (score ${entry.target_score}), computed neighbors: ${entry.computed_neighbors.join(", ")}`,
      );
    } else {
      out.push(`  ${entry.term} -> ${entry.target}: UNKNOWN TARGET`);
    }
  }
  out.push("");
  out.push(`== top-neighbors map (top ${topK} per term, score in parentheses) ==`);
  for (const row of committed.terms) {
    const neighbors = row.neighbors.map((n) => `${n.term} (${n.score})`).join(", ");
    out.push(`  ${row.term} [${row.vocabulary}${row.kind ? `/${row.kind}` : ""}]: ${neighbors || "(no structural neighbors)"}`);
  }
  out.push("");
  out.push(`== determinism record ==`);
  out.push(`  input hash: ${committed.determinism.input_hash}`);
  out.push(`  output hash: ${committed.determinism.output_hash}`);
  out.push(`  config: ${committed.config.version} (sha256 ${committed.config.sha256.slice(0, 12)}...)`);
  for (const vocab of committed.vocabularies) {
    out.push(`  ${vocab.key}: ${vocab.records} records, sha256 ${vocab.sha256.slice(0, 12)}..., versions ${Object.entries(vocab.versions).map(([v, c]) => `${v}x${c}`).join(" ")}`);
  }
  out.push("");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed);
  out.push(`checks: ${passed} passed, ${failed.length} failed`);
  for (const failure of failed) {
    out.push(`  FAILED: ${failure.name}${failure.detail ? ` (${failure.detail})` : ""}`);
  }
  process.stdout.write(`${out.join("\n")}\n`);
  process.exitCode = failed.length === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
