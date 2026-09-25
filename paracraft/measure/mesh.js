// paracraft mesh representation and loaders.
// paracraft consumes only typed geometry: vertex and face index arrays in
// millimeters. it never imports tessa or any agent output structure.

// weld duplicated triangle soup into shared-vertex form. stl files repeat
// every vertex three times; edge topology analysis requires welding.
export function fromTriangleSoup(positions) {
  const vertices = [];
  const key = new Map();
  const faces = [];
  for (let i = 0; i < positions.length; i += 3) {
    const face = [];
    for (let j = 0; j < 3; j += 1) {
      const p = positions[i + j];
      const k = `${p[0]},${p[1]},${p[2]}`;
      let idx = key.get(k);
      if (idx === undefined) {
        idx = vertices.length;
        vertices.push(p);
        key.set(k, idx);
      }
      face.push(idx);
    }
    faces.push(face);
  }
  return { vertices, faces };
}

function decodeFloat32Pair(view, offset) {
  return [
    view.getFloat32(offset, true),
    view.getFloat32(offset + 4, true),
    view.getFloat32(offset + 8, true),
  ];
}

export function loadBinarySTL(buffer) {
  const view = new DataView(buffer);
  const count = view.getUint32(80, true);
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const base = 84 + i * 50;
    for (let v = 0; v < 3; v += 1) {
      positions.push(decodeFloat32Pair(view, base + 12 + v * 12));
    }
  }
  return fromTriangleSoup(positions);
}

export function loadAsciiSTL(text) {
  const positions = [];
  const nums = [];
  const re = /vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    nums.push([Number(m[1]), Number(m[2]), Number(m[3])]);
  }
  for (let i = 0; i + 2 < nums.length; i += 3) {
    positions.push(nums[i], nums[i + 1], nums[i + 2]);
  }
  return fromTriangleSoup(positions);
}

export function loadSTL(buffer) {
  const head = new Uint8Array(buffer, 0, Math.min(256, buffer.byteLength));
  const text = new TextDecoder().decode(head);
  if (text.trimStart().startsWith("solid")) {
    const full = new TextDecoder().decode(buffer);
    if (!full.includes("vertex")) {
      // some binary files start with "solid"; fall through on real binary shape
      return loadBinarySTL(buffer);
    }
    return loadAsciiSTL(full);
  }
  return loadBinarySTL(buffer);
}

export function boundingBox(mesh) {
  const { vertices } = mesh;
  if (vertices.length === 0) return null;
  const min = [...vertices[0]];
  const max = [...vertices[0]];
  for (const p of vertices) {
    for (let i = 0; i < 3; i += 1) {
      if (p[i] < min[i]) min[i] = p[i];
      if (p[i] > max[i]) max[i] = p[i];
    }
  }
  return { min, max, extents: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

// signed volume via the divergence theorem, millimeters cubed.
// positive for watertight meshes with consistent outward winding.
export function signedVolume(mesh) {
  const { vertices, faces } = mesh;
  let sum = 0;
  for (const [a, b, c] of faces) {
    const u = vertices[a];
    const v = vertices[b];
    const w = vertices[c];
    sum += u[0] * (v[1] * w[2] - v[2] * w[1])
      - u[1] * (v[0] * w[2] - v[2] * w[0])
      + u[2] * (v[0] * w[1] - v[1] * w[0]);
  }
  return sum / 6;
}

export function faceNormal(mesh, face) {
  const { vertices } = mesh;
  const [a, b, c] = face;
  const u = sub(vertices[b], vertices[a]);
  const v = sub(vertices[c], vertices[a]);
  return cross(u, v);
}

// ---- small vector helpers ----

export function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
export function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function scale(a, s) {
  return [a[0] * s, a[1] * s, a[2] * s];
}
export function normalize(a) {
  const len = Math.sqrt(dot(a, a));
  return len === 0 ? [0, 0, 0] : scale(a, 1 / len);
}

// moller-trumbore ray/triangle intersection. returns distance t or null.
// rejects t <= eps so rays launched from a surface do not hit that surface.
export function rayTriangle(origin, dir, a, b, c, eps = 1e-9) {
  const e1 = sub(b, a);
  const e2 = sub(c, a);
  const p = cross(dir, e2);
  const det = dot(e1, p);
  if (Math.abs(det) < eps) return null;
  const inv = 1 / det;
  const t0 = sub(origin, a);
  const u = dot(t0, p) * inv;
  if (u < -eps || u > 1 + eps) return null;
  const q = cross(t0, e1);
  const v = dot(dir, q) * inv;
  if (v < -eps || u + v > 1 + eps) return null;
  const t = dot(e2, q) * inv;
  if (t <= eps) return null;
  return t;
}

// closest point on triangle abc to point p (ericson, realtime collision
// detection). used by the clearance measurement.
export function closestPointOnTriangle(p, a, b, c) {
  const ab = sub(b, a);
  const ac = sub(c, a);
  const ap = sub(p, a);
  const d1 = dot(ab, ap);
  const d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p, b);
  const d3 = dot(ab, bp);
  const d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const den = d1 - d3;
    return den === 0 ? a : [a[0] + (ab[0] * d1) / den, a[1] + (ab[1] * d1) / den, a[2] + (ab[2] * d1) / den];
  }
  const cp = sub(p, c);
  const d5 = dot(ab, cp);
  const d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const den = d2 - d6;
    return den === 0 ? a : [a[0] + (ac[0] * d2) / den, a[1] + (ac[1] * d2) / den, a[2] + (ac[2] * d2) / den];
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const den = (d4 - d3) + (d5 - d6);
    return den === 0 ? b : [b[0] + (sub(c, b)[0] * (d5 - d6)) / den, b[1] + (sub(c, b)[1] * (d5 - d6)) / den, b[2] + (sub(c, b)[2] * (d5 - d6)) / den];
  }
  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  return [
    a[0] + ab[0] * v + ac[0] * w,
    a[1] + ab[1] * v + ac[1] * w,
    a[2] + ab[2] * v + ac[2] * w,
  ];
}

export function pointTriangleDistance(mesh, p, faceIndex) {
  const { vertices, faces } = mesh;
  const [a, b, c] = faces[faceIndex];
  const q = closestPointOnTriangle(p, vertices[a], vertices[b], vertices[c]);
  const d = sub(p, q);
  return Math.sqrt(dot(d, d));
}
