#!/usr/bin/env node
// affinity-map v0.1: the structural affinity table builder.
//
// pure module: versioned vocabulary files and a versioned config in, one
// versioned affinity table out. deterministic: the same inputs and config
// produce a byte-identical table, proven by the input hash and output hash
// recorded in the table itself.
//
// no learned models, no embeddings, no llm anywhere in the path. the
// discoverability policy layer owns every ranking call; this engine only
// computes. weights and the facet crosswalk live in config.json, never in
// code constants. the scoring core is the same pattern as the themailtell
// classification core: a pure function over its inputs.
//
// usage: node platform/discoverability/affinity-map/build-affinity-table.mjs
// reads config.json and the three vocabulary files, writes
// affinity-table.json next to itself, prints the determinism record.

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ENGINE_NAME = "affinity-map";
export const ENGINE_VERSION = "0.1.0";
export const TABLE_SCHEMA = "affinity-table-v1";
export const DETERMINISM_SCHEMA = "affinity-map-determinism-v1";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(MODULE_DIR, "..", "..", "..");
export const CONFIG_PATH = path.join(MODULE_DIR, "config.json");
export const OUTPUT_PATH = path.join(MODULE_DIR, "affinity-table.json");

export function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function sha256File(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

export function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function parseJsonl(text, label) {
  const records = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      records.push(JSON.parse(line));
    } catch (err) {
      throw new Error(`${label}: unparseable jsonl at line ${i + 1}: ${err.message}`);
    }
  }
  return records;
}

// the facet crosswalk: which record fields become facets, per vocabulary
// kind, entirely as configured. symbol records are keyed by their kind
// field, styles and wear contexts by their vocabulary field.
export function facetSourceKey(record) {
  if (record.vocabulary === "symbol") {
    if (!record.kind) {
      throw new Error(`symbol record ${record.symbol_id ?? "?"} has no kind field`);
    }
    return record.kind;
  }
  if (!record.vocabulary) {
    throw new Error(`record has no vocabulary field: ${JSON.stringify(record).slice(0, 120)}`);
  }
  return record.vocabulary;
}

// extract the facet vector of one term. scalar string fields become facets
// at intensity 1.0 (optionally with a prefix stripped, per config); object
// fields map each entry name to its numeric intensity. when two sources of
// the same term emit the same facet name, the highest weighted intensity
// wins (config facet_merge: max) and both field names stay in provenance.
export function extractFacets(record, config) {
  const key = facetSourceKey(record);
  const sources = config.facet_sources[key];
  if (!sources) {
    throw new Error(`no facet_sources configured for vocabulary key "${key}"`);
  }
  const facets = new Map();
  const addCandidate = (name, raw, source) => {
    const classWeight = config.scoring.facet_class_weights[source.class];
    if (classWeight === undefined) {
      throw new Error(`no facet_class_weights entry for class "${source.class}"`);
    }
    const weight = classWeight * (source.weight ?? 1.0);
    const intensity = weight * raw;
    const existing = facets.get(name);
    if (!existing) {
      facets.set(name, { raw, class: source.class, weight, intensity, sources: [source.field] });
      return;
    }
    if (!existing.sources.includes(source.field)) existing.sources.push(source.field);
    if (intensity > existing.intensity) {
      existing.raw = raw;
      existing.class = source.class;
      existing.weight = weight;
      existing.intensity = intensity;
    }
  };
  for (const source of sources) {
    const value = record[source.field];
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "object") {
      for (const [name, raw] of Object.entries(value)) {
        if (typeof raw !== "number" || !Number.isFinite(raw)) {
          throw new Error(`facet value for "${name}" in ${JSON.stringify(record).slice(0, 80)} is not a finite number`);
        }
        addCandidate(name, raw, source);
      }
    } else if (typeof value === "string") {
      const name = source.strip_prefix && value.startsWith(source.strip_prefix)
        ? value.slice(source.strip_prefix.length)
        : value;
      addCandidate(name, 1.0, source);
    }
    // booleans and numbers are not facets: no crosswalk source uses them.
  }
  return facets;
}

// weighted cosine. per facet the term vector component is
// sqrt(weight) * raw, so a shared facet contributes weight * raw_a * raw_b
// to the dot product and weight * raw^2 to the squared norm. with all
// weights at 1.0 this is exactly the plain cosine of the reference pass.
export function scorePair(aFacets, bFacets) {
  const shared = [];
  let dot = 0;
  for (const [name, a] of aFacets) {
    const b = bFacets.get(name);
    if (!b) continue;
    const contribution = Math.sqrt(a.weight * b.weight) * a.raw * b.raw;
    dot += contribution;
    shared.push({
      facet: name,
      left: a.raw,
      right: b.raw,
      left_class: a.class,
      right_class: b.class,
      left_weight: a.weight,
      right_weight: b.weight,
      contribution,
    });
  }
  return { dot, shared };
}

export function facetNorm(facets) {
  let sumSquares = 0;
  for (const facet of facets.values()) {
    sumSquares += facet.weight * facet.raw * facet.raw;
  }
  return Math.sqrt(sumSquares);
}

export function readInputs(config) {
  return config.inputs.map((input) => {
    const filePath = path.join(REPO_ROOT, input.path);
    const text = fs.readFileSync(filePath, "utf8");
    const records = parseJsonl(text, input.path);
    return { ...input, records, sha256: sha256(text) };
  });
}

export function computeInputHash(config, configSha, vocabInputs) {
  let canonical = `affinity-map-input-v1\nengine=${ENGINE_NAME}@${ENGINE_VERSION}\nconfig_sha256=${configSha}\n`;
  for (const input of vocabInputs) {
    canonical += `${input.key}\t${input.path}\t${input.sha256}\n`;
  }
  return sha256(canonical);
}

// the pure core: config and vocabulary records in, the full table object
// out. no clock, no randomness, no environment reads past the passed-in
// inputs, so the same arguments always produce the same table.
export function computeTable(config, configSha, vocabInputs) {
  const { top_k: topK, min_score: minScore, score_rounding_decimals: decimals } = config.scoring;

  // terms, in config input order and file record order.
  const terms = [];
  const byId = new Map();
  for (const input of vocabInputs) {
    for (const record of input.records) {
      const id = record[input.term_id_field];
      if (!id) throw new Error(`${input.path}: record has no ${input.term_id_field}`);
      if (byId.has(id)) throw new Error(`duplicate term id "${id}" across vocabularies`);
      const facets = extractFacets(record, config);
      const term = {
        term: id,
        name: record.name ?? id,
        vocabulary: input.key,
        version: record.version ?? null,
        updated: record.updated ?? null,
        facets,
        norm: facetNorm(facets),
        confusable_with: Array.isArray(record.confusable_with) ? record.confusable_with : null,
      };
      if (record.kind) term.kind = record.kind;
      terms.push(term);
      byId.set(id, term);
    }
  }

  // all-pairs scoring; neighbor lists are per side, ranked by rounded
  // score descending with term id ascending as the deterministic tiebreak.
  const neighborLists = new Map(terms.map((t) => [t.term, []]));
  for (let i = 0; i < terms.length; i += 1) {
    for (let j = i + 1; j < terms.length; j += 1) {
      const a = terms[i];
      const b = terms[j];
      const { dot, shared } = scorePair(a.facets, b.facets);
      if (dot <= 0) continue;
      const score = roundTo(dot / (a.norm * b.norm), decimals);
      if (score <= minScore) continue;
      const buildEntry = (self, other, isLeft) => ({
        term: other.term,
        vocabulary: other.vocabulary,
        score,
        norms: [roundTo(self.norm, decimals), roundTo(other.norm, decimals)],
        shared_facets: shared
          .map((pair) => (isLeft
            ? {
              facet: pair.facet,
              left: pair.left,
              right: pair.right,
              left_class: pair.left_class,
              right_class: pair.right_class,
              left_weight: pair.left_weight,
              right_weight: pair.right_weight,
              contribution: roundTo(pair.contribution, decimals),
            }
            : {
              facet: pair.facet,
              left: pair.right,
              right: pair.left,
              left_class: pair.right_class,
              right_class: pair.left_class,
              left_weight: pair.right_weight,
              right_weight: pair.left_weight,
              contribution: roundTo(pair.contribution, decimals),
            }))
          .sort((x, y) => (y.contribution - x.contribution) || (x.facet < y.facet ? -1 : x.facet > y.facet ? 1 : 0)),
      });
      neighborLists.get(a.term).push(buildEntry(a, b, true));
      neighborLists.get(b.term).push(buildEntry(b, a, false));
    }
  }

  for (const [id, list] of neighborLists) {
    list.sort((x, y) => (y.score - x.score) || (x.term < y.term ? -1 : x.term > y.term ? 1 : 0));
  }

  // published term rows.
  const termRows = terms.map((term) => {
    const neighbors = neighborLists.get(term.term).slice(0, topK);
    const facets = {};
    for (const [name, facet] of term.facets) {
      facets[name] = {
        raw: facet.raw,
        class: facet.class,
        weight: facet.weight,
        sources: [...facet.sources],
      };
    }
    return {
      term: term.term,
      name: term.name,
      vocabulary: term.vocabulary,
      ...(term.kind ? { kind: term.kind } : {}),
      version: term.version,
      updated: term.updated,
      facet_count: term.facets.size,
      facets,
      norm: roundTo(term.norm, decimals),
      neighbors,
    };
  });

  // confusable cross-check: every authored confusable edge is checked
  // against the computed ranking. a target outside the top-k is reported
  // as glossary drift with the computed neighbors named. nothing is
  // silently accepted and nothing is silently dropped.
  const crossCheck = [];
  for (const term of terms) {
    if (!term.confusable_with) continue;
    const all = neighborLists.get(term.term);
    for (const target of term.confusable_with) {
      const targetTerm = byId.get(target);
      if (!targetTerm) {
        crossCheck.push({
          term: term.term,
          target,
          status: "unknown_target",
          target_score: null,
          rank: null,
          in_top_k: false,
        });
        continue;
      }
      const rankIndex = all.findIndex((n) => n.term === target);
      const rank = rankIndex === -1 ? null : rankIndex + 1;
      const targetScore = rankIndex === -1 ? 0 : all[rankIndex].score;
      const inTopK = rank !== null && rank <= topK;
      const entry = {
        term: term.term,
        target,
        status: inTopK ? "confirmed" : "drift",
        target_score: targetScore,
        rank,
        in_top_k: inTopK,
      };
      if (!inTopK) {
        entry.computed_neighbors = all.slice(0, topK).map((n) => n.term);
      }
      crossCheck.push(entry);
    }
  }

  const vocabularySummaries = vocabInputs.map((input) => {
    const versions = {};
    for (const record of input.records) {
      const v = record.version ?? "unversioned";
      versions[v] = (versions[v] ?? 0) + 1;
    }
    return {
      key: input.key,
      path: input.path,
      sha256: input.sha256,
      records: input.records.length,
      versions: Object.fromEntries(Object.keys(versions).sort().map((k) => [k, versions[k]])),
    };
  });

  const scoredPairCount = [...neighborLists.values()].reduce((sum, list) => sum + list.length, 0) / 2;
  const neighborEdgeCount = termRows.reduce((sum, row) => sum + row.neighbors.length, 0);
  const emptyNeighborhoods = termRows.filter((row) => row.neighbors.length === 0).map((row) => row.term);

  const table = {
    schema: TABLE_SCHEMA,
    description:
      "structural affinity table v0.1: the cold-start taste prior computed from the governed vocabulary alone. per term, ranked neighbors with weighted shared-facet explanations. deterministic: rebuilds byte-identical from the pinned inputs. the discoverability policy layer owns every ranking call made from this table.",
    engine: { name: ENGINE_NAME, version: ENGINE_VERSION },
    config: { version: config.version, sha256: configSha },
    vocabularies: vocabularySummaries,
    determinism: {
      schema: DETERMINISM_SCHEMA,
      input_hash: computeInputHash(config, configSha, vocabInputs),
      output_hash: null,
      method:
        "input hash: sha256 over the engine version, config sha256, and each vocabulary key, path and sha256 in config input order. output hash: sha256 over this table serialized canonically (json, two-space indent, trailing newline) with determinism.output_hash set to null. same inputs and config produce identical output, verified by check-affinity-table.mjs.",
      corpus: null,
      corpus_note:
        "the authored affinity corpus is an open item in the spec. v0.1 is the structural prior from the governed vocabulary alone and blends with real co-occurrence counts deterministically later. decay has no meaning here: the structural prior carries no time component.",
    },
    terms: termRows,
    confusable_cross_check: crossCheck,
    summary: {
      term_count: termRows.length,
      by_vocabulary: Object.fromEntries(vocabInputs.map((input) => [
        input.key,
        termRows.filter((row) => row.vocabulary === input.key).length,
      ])),
      neighbor_edge_count: neighborEdgeCount,
      scored_pair_count: scoredPairCount,
      empty_neighborhoods: emptyNeighborhoods,
      confusable_edge_count: crossCheck.length,
      confusable_confirmed: crossCheck.filter((e) => e.status === "confirmed").length,
      confusable_drift: crossCheck.filter((e) => e.status === "drift").length,
      confusable_unknown_targets: crossCheck.filter((e) => e.status === "unknown_target").length,
      top_k: topK,
      min_score: minScore,
    },
  };

  return table;
}

export function canonicalize(table) {
  const copy = { ...table, determinism: { ...table.determinism, output_hash: null } };
  return `${JSON.stringify(copy, null, 2)}\n`;
}

export function sealOutputHash(table) {
  const canonical = canonicalize(table);
  const outputHash = sha256(canonical);
  const sealed = { ...table, determinism: { ...table.determinism, output_hash: outputHash } };
  return { table: sealed, outputHash };
}

export function buildTable() {
  const configText = fs.readFileSync(CONFIG_PATH, "utf8");
  const config = JSON.parse(configText);
  const configSha = sha256(configText);
  const vocabInputs = readInputs(config);
  const table = computeTable(config, configSha, vocabInputs);
  const { table: sealed, outputHash } = sealOutputHash(table);
  const inputHash = sealed.determinism.input_hash;
  return { config, configSha, table: sealed, inputHash, outputHash };
}

function main() {
  const { table, inputHash, outputHash } = buildTable();
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(table, null, 2)}\n`);
  const drift = table.confusable_cross_check.filter((e) => e.status === "drift");
  process.stdout.write(
    [
      `affinity table written: ${path.relative(REPO_ROOT, OUTPUT_PATH)}`,
      `terms: ${table.summary.term_count} (${Object.entries(table.summary.by_vocabulary).map(([k, v]) => `${v} ${k}`).join(", ")})`,
      `neighbor edges: ${table.summary.neighbor_edge_count}, empty neighborhoods: ${table.summary.empty_neighborhoods.length}`,
      `confusable edges: ${table.summary.confusable_edge_count} checked, ${table.summary.confusable_confirmed} confirmed, ${table.summary.confusable_drift} drift, ${table.summary.confusable_unknown_targets} unknown target`,
      ...(drift.length > 0
        ? [`drift: ${drift.map((e) => `${e.term} -> ${e.target} (rank ${e.rank ?? "none"}, score ${e.target_score})`).join("; ")}`]
        : []),
      `input hash: ${inputHash}`,
      `output hash: ${outputHash}`,
      "",
    ].join("\n"),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
