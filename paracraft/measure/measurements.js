// the five ready measurements, each with the method recorded in
// research/synthesis/geometry-to-manufacturing.md:
// 1. mesh manifoldness   (edge manifoldness + winding consistency check)
// 2. nested components   (connected component analysis + containment check)
// 3. clearance           (pairwise distance between disconnected components)
// 4. wall thickness      (ray cast along inward face normals)
// 5. bounding box        (vertex min/max)
// assumptions are carried in the output, not hidden in the code.

import {
  boundingBox,
  dot,
  faceNormal,
  normalize,
  pointTriangleDistance,
  rayTriangle,
  scale,
  signedVolume,
  sub,
} from "./mesh.js";

const EPS = 1e-9;

export function topology(mesh) {
  const { vertices, faces } = mesh;
  const edges = new Map();
  let degenerateFaces = 0;
  const storeEdge = (a, b, face) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    const e = edges.get(key) ?? { count: 0, net: 0, faces: [] };
    e.count += 1;
    e.net += a < b ? 1 : -1;
    e.faces.push(face);
    edges.set(key, e);
  };
  for (let f = 0; f < faces.length; f += 1) {
    const [a, b, c] = faces[f];
    if (a === b || b === c || a === c) degenerateFaces += 1;
    const n = faceNormal(mesh, faces[f]);
    if (dot(n, n) < EPS * EPS) degenerateFaces += 1;
    storeEdge(a, b, f);
    storeEdge(b, c, f);
    storeEdge(c, a, f);
  }
  let nonManifoldEdges = 0;
  let boundaryEdges = 0;
  let windingErrors = 0;
  for (const e of edges.values()) {
    if (e.count === 1) boundaryEdges += 1;
    else if (e.count > 2) nonManifoldEdges += 1;
    else if (Math.abs(e.net) === 2) windingErrors += 1; // same direction twice
  }
  const manifold = nonManifoldEdges === 0 && boundaryEdges === 0;
  const watertight = manifold && windingErrors === 0 && degenerateFaces === 0;
  return {
    manifold,
    watertight,
    non_manifold_edges: nonManifoldEdges,
    boundary_edges: boundaryEdges,
    winding_errors: windingErrors,
    degenerate_faces: degenerateFaces,
    method: "edge_manifoldness_and_winding_consistency",
  };
}

export function connectedComponents(mesh) {
  const { faces } = mesh;
  const parent = faces.map((_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (x, y) => {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parent[rx] = ry;
  };
  // faces sharing an undirected edge belong to one component
  const edgeFaces = new Map();
  const remember = (a, b, f) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    const list = edgeFaces.get(key) ?? [];
    list.push(f);
    edgeFaces.set(key, list);
  };
  for (let f = 0; f < faces.length; f += 1) {
    const [a, b, c] = faces[f];
    remember(a, b, f);
    remember(b, c, f);
    remember(c, a, f);
  }
  for (const list of edgeFaces.values()) {
    for (let i = 1; i < list.length; i += 1) union(list[0], list[i]);
  }
  const groups = new Map();
  for (let f = 0; f < faces.length; f += 1) {
    const r = find(f);
    const g = groups.get(r) ?? { faces: [], vertices: new Set() };
    g.faces.push(f);
    for (const v of faces[f]) g.vertices.add(v);
    groups.set(r, g);
  }
  const components = [];
  for (const g of groups.values()) {
    components.push({ faces: g.faces, vertex_indices: [...g.vertices] });
  }
  return components;
}

function componentBounds(mesh, comp) {
  const { vertices } = mesh;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const vi of comp.vertex_indices) {
    for (let i = 0; i < 3; i += 1) {
      if (vertices[vi][i] < min[i]) min[i] = vertices[vi][i];
      if (vertices[vi][i] > max[i]) max[i] = vertices[vi][i];
    }
  }
  return { min, max, center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2] };
}

// containment test: ray from the candidate point along +x, count crossings
// with the container component's triangles. odd count means inside.
function pointInComponent(mesh, comp, point) {
  const { vertices, faces } = mesh;
  // oblique direction: axis-aligned rays hit face diagonals of symmetric
  // boxes exactly, which reads as zero crossings. a fixed oblique vector
  // avoids that degeneracy deterministically.
  const dir = [1, 0.13, 0.071];
  let crossings = 0;
  for (const f of comp.faces) {
    const [a, b, c] = faces[f];
    const t = rayTriangle(point, dir, vertices[a], vertices[b], vertices[c]);
    if (t !== null) crossings += 1;
  }
  return crossings % 2 === 1;
}

export function nestedComponents(mesh, components) {
  const bounds = components.map((c) => componentBounds(mesh, c));
  const pairs = [];
  for (let i = 0; i < components.length; i += 1) {
    for (let j = 0; j < components.length; j += 1) {
      if (i === j) continue;
      const bi = bounds[i];
      const bj = bounds[j];
      let inside = true;
      for (let d = 0; d < 3; d += 1) {
        if (!(bi.min[d] > bj.min[d] + 1e-7 && bi.max[d] < bj.max[d] - 1e-7)) inside = false;
      }
      if (!inside) continue;
      if (pointInComponent(mesh, components[j], bi.center)) {
        pairs.push({ contained: i, container: j });
        break; // one container is enough to flag the component
      }
    }
  }
  return {
    count: pairs.length,
    pairs,
    method: "connected_component_analysis_and_containment_check",
  };
}

// minimum distance between every pair of disconnected components.
// brute force vertex-to-triangle both directions. a bounding volume
// hierarchy replaces this when production meshes make it necessary.
export function clearance(mesh, components) {
  if (components.length < 2) {
    return { min_mm: null, pairs_checked: 0, method: "pairwise_distance_between_components" };
  }
  let min = Infinity;
  let between = null;
  let pairsChecked = 0;
  for (let i = 0; i < components.length; i += 1) {
    for (let j = i + 1; j < components.length; j += 1) {
      pairsChecked += 1;
      for (const vi of components[i].vertex_indices) {
        const p = mesh.vertices[vi];
        for (const f of components[j].faces) {
          const d = pointTriangleDistance(mesh, p, f);
          if (d < min) {
            min = d;
            between = [i, j];
          }
        }
      }
      for (const vi of components[j].vertex_indices) {
        const p = mesh.vertices[vi];
        for (const f of components[i].faces) {
          const d = pointTriangleDistance(mesh, p, f);
          if (d < min) {
            min = d;
            between = [i, j];
          }
        }
      }
    }
  }
  return {
    min_mm: min === Infinity ? null : min,
    between,
    pairs_checked: pairsChecked,
    method: "pairwise_distance_between_components",
  };
}

// wall thickness: cast a ray from each face centroid along the inward normal,
// take the nearest hit whose own outward normal opposes the launch surface
// (dot > threshold), so same-side surfaces such as an inner shell are ignored.
// requires a watertight, consistently wound mesh; faces without a qualifying
// hit are reported as unmeasured rather than silently counted.
const OPPOSING_DOT = 0.2;

export function wallThickness(mesh) {
  const { vertices, faces } = mesh;
  let min = Infinity;
  let atFace = null;
  let atPoint = null;
  let measured = 0;
  const unmeasured = [];
  for (let i = 0; i < faces.length; i += 1) {
    const [a, b, c] = faces[i];
    const centroid = scale(
      [
        vertices[a][0] + vertices[b][0] + vertices[c][0],
        vertices[a][1] + vertices[b][1] + vertices[c][1],
        vertices[a][2] + vertices[b][2] + vertices[c][2],
      ],
      1 / 3,
    );
    const n = normalize(faceNormal(mesh, faces[i]));
    const dir = scale(n, -1); // inward
    let bestT = Infinity;
    for (let j = 0; j < faces.length; j += 1) {
      if (j === i) continue;
      const [fa, fb, fc] = faces[j];
      const t = rayTriangle(centroid, dir, vertices[fa], vertices[fb], vertices[fc]);
      if (t === null || t >= bestT) continue;
      const hitNormal = normalize(faceNormal(mesh, faces[j]));
      if (dot(hitNormal, dir) > OPPOSING_DOT) {
        bestT = t;
      }
    }
    if (bestT < Infinity) {
      measured += 1;
      if (bestT < min) {
        min = bestT;
        atFace = i;
        atPoint = [centroid[0] + dir[0] * bestT, centroid[1] + dir[1] * bestT, centroid[2] + dir[2] * bestT];
      }
    } else {
      unmeasured.push(i);
    }
  }
  return {
    min_mm: min === Infinity ? null : min,
    at_face: atFace,
    at_point: atPoint,
    measured_faces: measured,
    unmeasured_faces: unmeasured.length,
    method: "ray_cast_inward_normals",
    opposing_normal_threshold: OPPOSING_DOT,
    assumptions: [
      "mesh is watertight with consistent outward winding",
      "thickness sampled at face centroids; finer tessellation refines the minimum",
    ],
  };
}

// assemble the full measurement report for a mesh, millimeters throughout.
export function measure(mesh) {
  const topo = topology(mesh);
  const components = connectedComponents(mesh);
  const nested = nestedComponents(mesh, components);
  return {
    measurement_version: 1,
    units: "mm",
    vertex_count: mesh.vertices.length,
    face_count: mesh.faces.length,
    bounding_box: boundingBox(mesh),
    signed_volume_mm3: signedVolume(mesh),
    topology: topo,
    components: { count: components.length, method: "connected_component_analysis" },
    nested_components: nested,
    clearance: clearance(mesh, components),
    wall_thickness: wallThickness(mesh),
    hollow_parts: hollowParts(nested),
  };
}

// hollow parts: a component fully contained inside another component's closed
// volume. nestedComponents already provides the detection via containment check.
export function hollowParts(nested) {
  return {
    detected: nested.count > 0,
    count: nested.count,
    method: "nested_component_containment_check",
  };
}
