# research

the evidence corpus for paracraft's manufacturing rules. this folder turns scattered manufacturer and practitioner documentation into a traceable chain:

```text
source
  -> evidence
  -> ontology
  -> geometry-to-manufacturing mapping
  -> scoped constraints
  -> manufacturing profiles
  -> (eventually) the paracraft validator
```

## provenance

produced by a dedicated research-agent cycle in the [`tinkrland/sculptura-research`](https://github.com/tinkrland/sculptura-research) fork (base identical to commit e6de1cd of this repo), ported here 2026-09-24 after review. the cycle ran ten phases: repository reconnaissance, gap matrix, source discovery and acquisition, evidence extraction, normalization, contradiction analysis, ontology, geometry mapping, constraint synthesis, and three adversarial review passes (auditor, engineer, manufacturer). the corpus was spot-verified against the live tier1 sources: materialise and cooksongold excerpts match their pages verbatim.

## what is here

- [`sources/sources.jsonl`](sources/sources.jsonl): 20 registered sources with provenance, authority tier, and scope
- [`evidence/evidence.jsonl`](evidence/evidence.jsonl): 64 atomic evidence records with excerpt, location, scope, modality, and confidence
- [`contradictions/contradictions.jsonl`](contradictions/contradictions.jsonl): 10 contradiction records; silver shrinkage remains honestly unresolved
- [`ontology/terms.json`](ontology/terms.json), [`ontology/ontology.json`](ontology/ontology.json): canonical terms, aliases, and `not_equivalent_to` distinctions
- [`synthesis/`](synthesis/): constraint taxonomy (the constraint format spec), evidence matrix, geometry-to-manufacturing measurement mapping, wall-thickness synthesis
- [`profiles/profile-001-lost-wax-silver-general.json`](profiles/profile-001-lost-wax-silver-general.json): the first versioned manufacturing profile, ring + lost-wax + sterling silver, every value carrying evidence lineage
- [`repository-map.md`](repository-map.md), [`research-gaps.md`](research-gaps.md), [`reports/`](reports/): the recon, the 23-concept gap matrix, and the cycle's synthesis and adversarial reviews

## status: research input, not production truth

this corpus is strong input for the paracraft rule sets and the five ready measurements (wall thickness, clearance, bounding box, nested components, mesh manifoldness), but it is not yet robust enough for error-severity decisions or partner commitments:

- most constraints rest on 1-2 sources; clearance (0.3 mm) and edge fillet (0.30 mm) are single-source
- tier3 practitioner blogs carry load-bearing values and shared-lineage between them was not traced
- no empirical validation yet; the only near-empirical record (wax carvers shrinkage) contradicts the documented range
- known omissions from the original brief: no gold set for extraction accuracy

values here are warnings-grade, not physics. the [acquire.md](../buildplan/paracraft/acquire.md) partner asks and the tier1 expansions in [rule-digest.md](../buildplan/paracraft/rule-digest.md) are the path to tightening them.

## how this relates to the rest of the repo

- [`buildplan/paracraft/`](../buildplan/paracraft/README.md) consumes this: the constraint and profile formats here are the candidate format for paracraft's versioned rule json, and the constraint ids cite the evidence ids stored here
- [`studio/validation/`](../studio/validation/README.md) implements the measurement side; the five ready measurements have methods specified in [`synthesis/geometry-to-manufacturing.md`](synthesis/geometry-to-manufacturing.md)
- [`manufacturing/research/`](../manufacturing/research/README.md) holds the manufacturer-side candidate research; this folder holds the geometry-to-constraint bridge

## rules for this folder

- every future constraint must cite evidence ids that exist in [`evidence/evidence.jsonl`](evidence/evidence.jsonl)
- never modify historical evidence in place; supersede with new versions
- `scripts/validate-jsonl.py` (wired into `npm run validate`) fails the build on any malformed jsonl record
- contradictions stay unresolved until evidence resolves them; do not average conflicting values
