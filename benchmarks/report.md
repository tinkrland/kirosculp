# paracraft benchmark report

## summary

- total models: 31
- matched: 31
- mismatched: 0
- errors: 0
- all match: true

## families

### wall-ladder

- file: `benchmarks/wall-ladder.scad`
- stl: `per-model`
- compile ok: true

#### model verdicts

| id | expected | actual | match |
|---|---|---|---|
| wall-ladder-0.3 | warning | manual_review | ok |
| wall-ladder-0.5 | warning | manual_review | ok |
| wall-ladder-0.7 | warning | manual_review | ok |
| wall-ladder-0.8 | needs-manual-review | manual_review | ok |
| wall-ladder-1.0 | needs-manual-review | manual_review | ok |
| wall-ladder-1.2 | needs-manual-review | manual_review | ok |

### feature-ladder

- file: `benchmarks/feature-ladder.scad`
- stl: `per-model`
- compile ok: true

#### model verdicts

| id | expected | actual | match |
|---|---|---|---|
| feature-ladder-all | needs-manual-review | manual_review | ok |
| feature-ladder-text-cg | warning | manual_review | ok |
| feature-ladder-text-sc | warning | manual_review | ok |
| feature-ladder-text-hi | warning | manual_review | ok |

### hollow-shell

- file: `benchmarks/hollow-shell.scad`
- stl: `per-model`
- compile ok: true

#### model verdicts

| id | expected | actual | match |
|---|---|---|---|
| hollow-shell-nodrain-0.5 | fail | invalid | ok |
| hollow-shell-nodrain-0.7 | fail | invalid | ok |
| hollow-shell-nodrain-1.0 | fail | invalid | ok |
| hollow-shell-nodrain-1.5 | fail | invalid | ok |
| hollow-shell-drain-0.5 | fail | invalid | ok |
| hollow-shell-drain-0.7 | fail | invalid | ok |
| hollow-shell-drain-1.0 | fail | invalid | ok |
| hollow-shell-drain-1.5 | fail | invalid | ok |

### size-family

- file: `benchmarks/size-family.scad`
- stl: `per-model`
- compile ok: true

#### model verdicts

| id | expected | actual | match |
|---|---|---|---|
| size-family-us3 | needs-manual-review | manual_review | ok |
| size-family-us6 | needs-manual-review | manual_review | ok |
| size-family-us9 | needs-manual-review | manual_review | ok |
| size-family-us12 | needs-manual-review | manual_review | ok |

### symbolic-stress

- file: `benchmarks/symbolic-stress.scad`
- stl: `per-model`
- compile ok: true

#### model verdicts

| id | expected | actual | match |
|---|---|---|---|
| symbolic-double-heart-safe | needs-manual-review | manual_review | ok |
| symbolic-double-heart-thin | warning | manual_review | ok |
| symbolic-claddagh-like | warning | manual_review | ok |

### pathological

- file: `benchmarks/pathological.scad`
- stl: `per-model`
- compile ok: true

#### model verdicts

| id | expected | actual | match |
|---|---|---|---|
| pathological-p001a | warning | manual_review | ok |
| pathological-p001b | needs-manual-review | manual_review | ok |
| pathological-p002 | warning | manual_review | ok |
| pathological-p003 | fail | invalid | ok |
| pathological-p004 | warning | manual_review | ok |
| pathological-p005 | needs-manual-review | manual_review | ok |

## provenance

- pinned image: `openscad/openscad:2021.01`
- image digest: `openscad/openscad@sha256:147e48525bec392bcf628d7a6d5ea4ccac71b16251952328f86e1061cbf47c37`
- measurement library: `paracraft/measure/measurements.js`
- validation library: `paracraft/validate/validate.js`
- manifest sha256: `f039247b5d29a194c760fa8c0bdc9c41d2c26b44a9745d5bd218d87bba759f4c`

