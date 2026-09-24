import * as THREE from "three";

/**
 * Export a Three.js Group or Mesh as a binary STL Blob.
 * Works by merging all MeshStandardMaterial meshes in the scene into one
 * combined BufferGeometry (with world transforms applied).
 */
export function exportSTL(group) {
  const geometries = [];

  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const geo = obj.geometry.clone();
    // Apply world transform
    obj.updateWorldMatrix(true, false);
    geo.applyMatrix4(obj.matrixWorld);
    // Ensure we have indexed positions
    if (!geo.index) {
      geo.toNonIndexed();
    }
    geometries.push(geo);
  });

  if (geometries.length === 0) return null;

  // Merge
  const merged = mergeGeometries(geometries);
  return geometryToBinarySTL(merged);
}

function mergeGeometries(geos) {
  let totalVerts = 0;
  for (const g of geos) {
    totalVerts += g.index
      ? g.index.count
      : g.attributes.position.count;
  }

  const positions = new Float32Array(totalVerts * 3);
  let offset = 0;

  for (const g of geos) {
    const pos = g.attributes.position;
    if (g.index) {
      const idx = g.index.array;
      for (let i = 0; i < idx.length; i++) {
        const vi = idx[i];
        positions[offset++] = pos.getX(vi);
        positions[offset++] = pos.getY(vi);
        positions[offset++] = pos.getZ(vi);
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        positions[offset++] = pos.getX(i);
        positions[offset++] = pos.getY(i);
        positions[offset++] = pos.getZ(i);
      }
    }
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(positions.slice(0, offset), 3));
  out.computeVertexNormals();
  return out;
}

function geometryToBinarySTL(geo) {
  const pos = geo.attributes.position;
  const triCount = Math.floor(pos.count / 3);

  // Binary STL: 80-byte header + 4-byte tri count + 50 bytes per triangle
  const buffer = new ArrayBuffer(80 + 4 + triCount * 50);
  const view = new DataView(buffer);

  // Header (ASCII, 80 bytes)
  const header = "Sculptura STL export";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  }
  view.setUint32(80, triCount, true);

  let offset = 84;
  const v = new THREE.Vector3();
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < triCount; i++) {
    const base = i * 3;
    v0.set(pos.getX(base), pos.getY(base), pos.getZ(base));
    v1.set(pos.getX(base + 1), pos.getY(base + 1), pos.getZ(base + 1));
    v2.set(pos.getX(base + 2), pos.getY(base + 2), pos.getZ(base + 2));

    edge1.subVectors(v1, v0);
    edge2.subVectors(v2, v0);
    normal.crossVectors(edge1, edge2).normalize();

    // Normal
    view.setFloat32(offset,      normal.x, true); offset += 4;
    view.setFloat32(offset,      normal.y, true); offset += 4;
    view.setFloat32(offset,      normal.z, true); offset += 4;
    // V0
    view.setFloat32(offset,      v0.x * 10, true); offset += 4; // convert THREE units to mm
    view.setFloat32(offset,      v0.y * 10, true); offset += 4;
    view.setFloat32(offset,      v0.z * 10, true); offset += 4;
    // V1
    view.setFloat32(offset,      v1.x * 10, true); offset += 4;
    view.setFloat32(offset,      v1.y * 10, true); offset += 4;
    view.setFloat32(offset,      v1.z * 10, true); offset += 4;
    // V2
    view.setFloat32(offset,      v2.x * 10, true); offset += 4;
    view.setFloat32(offset,      v2.y * 10, true); offset += 4;
    view.setFloat32(offset,      v2.z * 10, true); offset += 4;
    // Attribute byte count
    view.setUint16(offset, 0, true); offset += 2;
  }

  return new Blob([buffer], { type: "application/octet-stream" });
}

/**
 * Estimate bounding-box volume in mm³ (rough approximation for print quote)
 */
export function estimateBoundingVolumeMM3(group) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);
  // Convert from Three units (1 unit = 10mm) to mm
  return (size.x * 10) * (size.y * 10) * (size.z * 10);
}

/**
 * Get bounding dimensions in mm
 */
export function getBoundingDimensionsMM(group) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);
  return {
    x: parseFloat((size.x * 10).toFixed(1)),
    y: parseFloat((size.y * 10).toFixed(1)),
    z: parseFloat((size.z * 10).toFixed(1)),
  };
}