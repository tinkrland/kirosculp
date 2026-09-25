// tests for the paracraft measurement engine: the five ready measurements and
// the profile validator, on hand-built meshes with known answers.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { measure } from "../measure/measurements.js";
import { loadBinarySTL } from "../measure/mesh.js";
import { validate } from "../validate/validate.js";

// an axis-aligned box with outward, consistent winding. the quad winding is
// auto-corrected against the box center so the fixture cannot drift.
function makeBox(min, max) {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const vertices = [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
  const quads = [
    [3, 2, 1, 0], // bottom
    [4, 5, 6, 7], // top
    [0, 1, 5, 4], // front
    [1, 2, 6, 5], // right
    [2, 3, 7, 6], // back
    [3, 0, 4, 7], // left
  ];
  const center = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0],
  ];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const faces = [];
  quads.forEach((q, qi) => {
    let [a, b, c, d] = q;
    const n = cross(sub(vertices[b], vertices[a]), sub(vertices[c], vertices[a]));
    const faceCenter = [0, 1, 2].map((d) => (vertices[q[0]][d] + vertices[q[1]][d] + vertices[q[2]][d] + vertices[q[3]][d]) / 4);
    if (dot(n, sub(faceCenter, center)) < 0) q = [q[3], q[2], q[1], q[0]];
    faces.push([q[0], q[1], q[2]], [q[0], q[2], q[3]]);
  });
  return { vertices, faces };
}

function mergeMeshes(...meshes) {
  const vertices = [];
  const faces = [];
  for (const m of meshes) {
    const offset = vertices.length;
    vertices.push(...m.vertices);
    for (const f of m.faces) faces.push(f.map((i) => i + offset));
  }
  return { vertices, faces };
}

const box = makeBox([0, 0, 0], [1, 1, 1]);
const slab = makeBox([0, 0, 0], [10, 10, 0.5]);
const twoBoxes = mergeMeshes(makeBox([0, 0, 0], [1, 1, 1]), makeBox([3, 0, 0], [4, 1, 1]));
const nested = mergeMeshes(makeBox([0, 0, 0], [4, 4, 4]), makeBox([1, 1, 1], [3, 3, 3]));
const nonManifold = {
  vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0.5, 0.5, 1]],
  faces: [[0, 2, 1], [1, 2, 3], [1, 2, 4]], // edge {1,2} shared by all three
};
const openBox = { vertices: box.vertices, faces: box.faces.filter((_, i) => i !== 2 && i !== 3) }; // top removed
const flipped = { vertices: box.vertices, faces: box.faces.map((f, i) => (i === 4 ? [f[0], f[2], f[1]] : f)) };

const profilePath = new URL("../../research/profiles/profile-001-lost-wax-silver-general.json", import.meta.url);
const profile = JSON.parse(readFileSync(profilePath, "utf8"));

test("unit box: manifold, watertight, one component, no nesting", () => {
  const m = measure(box);
  assert.equal(m.topology.manifold, true);
  assert.equal(m.topology.watertight, true);
  assert.equal(m.components.count, 1);
  assert.equal(m.nested_components.count, 0);
  assert.deepEqual(m.bounding_box.extents, [1, 1, 1]);
  assert.ok(Math.abs(m.signed_volume_mm3 - 1) < 1e-9);
});

test("unit box: wall thickness is 1.0mm on every face", () => {
  const m = measure(box);
  assert.equal(m.wall_thickness.measured_faces, 12);
  assert.equal(m.wall_thickness.unmeasured_faces, 0);
  assert.ok(Math.abs(m.wall_thickness.min_mm - 1) < 1e-9, `min was ${m.wall_thickness.min_mm}`);
});

test("slab: wall thickness catches the thin direction (0.5mm)", () => {
  const m = measure(slab);
  assert.ok(Math.abs(m.wall_thickness.min_mm - 0.5) < 1e-9, `min was ${m.wall_thickness.min_mm}`);
});

test("two separated boxes: clearance 2.0mm, no nesting", () => {
  const m = measure(twoBoxes);
  assert.equal(m.components.count, 2);
  assert.equal(m.nested_components.count, 0);
  assert.ok(Math.abs(m.clearance.min_mm - 2) < 1e-9, `clearance was ${m.clearance.min_mm}`);
});

test("nested boxes: containment detected", () => {
  const m = measure(nested);
  assert.equal(m.components.count, 2);
  assert.equal(m.nested_components.count, 1);
  assert.deepEqual(m.nested_components.pairs, [{ contained: 1, container: 0 }]);
});

test("nested boxes: wall rays read the inner shell's own walls; nesting is an error upstream", () => {
  const m = measure(nested);
  // same-side surfaces are ignored, but the inner shell's own opposing walls
  // (2mm apart) are the nearest qualifying hits. nested geometry is rejected
  // before wall thickness matters, so this documents behavior, not a rule.
  assert.ok(Math.abs(m.wall_thickness.min_mm - 2) < 1e-9, `min was ${m.wall_thickness.min_mm}`);
});

test("non-manifold mesh: flagged, not silently accepted", () => {
  const m = measure(nonManifold);
  assert.equal(m.topology.manifold, false);
  assert.equal(m.topology.non_manifold_edges, 1);
});

test("open mesh: boundary edges mean not watertight", () => {
  const m = measure(openBox);
  assert.equal(m.topology.manifold, false);
  assert.ok(m.topology.boundary_edges > 0);
  assert.equal(m.topology.watertight, false);
});

test("flipped face: winding inconsistency detected", () => {
  const m = measure(flipped);
  assert.equal(m.topology.winding_errors, 3);
  assert.equal(m.topology.watertight, false);
});

test("binary stl roundtrip: welded and measurable", () => {
  // build a binary stl for the slab, reload it, measure again
  const tris = [];
  for (const f of slab.faces) {
    tris.push(...f.map((i) => slab.vertices[i]));
  }
  const buf = new ArrayBuffer(84 + tris.length / 3 * 50);
  const view = new DataView(buf);
  view.setUint32(80, tris.length / 3, true);
  tris.forEach((p, i) => {
    const vertOffset = 84 + Math.floor(i / 3) * 50 + 12 + (i % 3) * 12;
    view.setFloat32(vertOffset, p[0], true);
    view.setFloat32(vertOffset + 4, p[1], true);
    view.setFloat32(vertOffset + 8, p[2], true);
  });
  const mesh = loadBinarySTL(buf);
  const m = measure(mesh);
  assert.equal(m.vertex_count, 8, "welding must merge the 36 soup vertices");
  assert.ok(Math.abs(m.wall_thickness.min_mm - 0.5) < 1e-6);
  assert.equal(m.topology.watertight, true);
});

test("determinism: same mesh, identical report", () => {
  assert.equal(JSON.stringify(measure(slab)), JSON.stringify(measure(slab)));
});

test("profile-001 on a 1mm box: five measured, rest unmeasured, manual review", () => {
  const m = measure(box);
  const r = validate(m, profile);
  const byId = Object.fromEntries(r.findings.map((f) => [f.constraint_id, f]));
  assert.equal(byId["ctr-mesh-001"].status, "passed");
  assert.equal(byId["ctr-nested-001"].status, "passed");
  assert.equal(byId["ctr-wall-001"].status, "passed");
  assert.equal(byId["ctr-clear-001"].status, "passed");
  assert.equal(byId["ctr-clear-001"].note, "single component, no clearances to check");
  // everything outside the five-measurement scope must be unmeasured
  const unmeasured = r.findings.filter((f) => f.status === "unmeasured");
  assert.equal(unmeasured.length, 7);
  // the release gate forbids passed=true while any check is unmeasured
  assert.equal(r.status, "manual_review");
  assert.equal(r.passed, false);
});

test("profile-001 on a 0.5mm slab: wall warning, still manual review", () => {
  const m = measure(slab);
  const r = validate(m, profile);
  const wall = r.findings.find((f) => f.constraint_id === "ctr-wall-001");
  assert.equal(wall.status, "warning");
  assert.ok(Math.abs(wall.measured - 0.5) < 1e-9);
  assert.equal(r.status, "manual_review");
  assert.equal(r.passed, false);
});

test("profile-001 on a non-manifold mesh: error severity means invalid", () => {
  const m = measure(nonManifold);
  const r = validate(m, profile);
  const meshFinding = r.findings.find((f) => f.constraint_id === "ctr-mesh-001");
  assert.equal(meshFinding.status, "failed");
  assert.equal(r.status, "invalid");
  assert.equal(r.passed, false);
});

test("error-severity wall constraint: violation blocks with invalid", () => {
  const strict = {
    profile_id: "profile-test",
    version: "0.0.1",
    constraints: [
      {
        constraint_id: "ctr-wall-test-001",
        property: "minimum_wall_thickness",
        operator: ">=",
        value: 1.2,
        unit: "mm",
        severity: "error",
        evidence: ["evid-wall-001"],
      },
    ],
  };
  const r = validate(measure(box), strict);
  assert.equal(r.status, "invalid");
  assert.equal(r.passed, false);
  const r2 = validate(measure(makeBox([0, 0, 0], [2, 2, 2])), strict);
  assert.equal(r2.status, "valid");
  assert.equal(r2.passed, true);
});
