/**
 * multiPieceJewelry.js
 *
 * Definitions and Three.js geometry builders for 2-piece and 3-piece jewelry
 * assemblies. Understanding:
 *
 * 2-PIECE jewelry
 *   A single wearable object split into exactly two parts that connect with a
 *   finding (clasp, hinge, snap, screw, etc.). Examples:
 *     - Hinged bangle: two half-cuffs joined by a knuckle hinge + box clasp
 *     - Box clasp bracelet: two ends with a tongue-and-groove box clasp
 *     - Toggle necklace: bar + ring toggle
 *     - Locket pendant: front shell + back shell on a hinge
 *     - Split shank ring: band splits into two converging at the stone
 *
 * 3-PIECE jewelry
 *   Three distinct structural components joined by two sets of findings.
 *   Examples:
 *     - Articulated bracelet: left panel + center statement + right panel
 *     - Pendant + bail + chain: the three separate components of a full necklace
 *     - Bar earring: top post + connector link + bottom bar
 *     - Triple-band ring: three thin bands soldered or hinged together
 *     - Charm bracelet station: end cap + link + charm
 */

import * as THREE from "three";

// ── Types and metadata ────────────────────────────────────────────────────────

export const TWO_PIECE_TYPES = [
  { id: "hinged-bangle",    label: "hinged bangle",    desc: "two half-cuffs joined by a knuckle hinge" },
  { id: "box-clasp",        label: "box clasp band",   desc: "tongue slides into box — common in bracelets" },
  { id: "toggle",           label: "toggle set",        desc: "bar + ring toggle, often on necklaces" },
  { id: "locket",           label: "locket pendant",   desc: "front + back shell on a hinge, hollow inside" },
  { id: "split-shank",      label: "split shank ring", desc: "band forks into two prongs flanking the stone" },
];

export const THREE_PIECE_TYPES = [
  { id: "articulated-band", label: "articulated band", desc: "three panels with two pivot links — fluid movement" },
  { id: "pendant-set",      label: "pendant + bail + chain", desc: "pendant body, bail finding, chain — complete necklace" },
  { id: "bar-earring",      label: "bar earring set",  desc: "top post, connector ring, drop bar" },
  { id: "triple-band",      label: "triple band ring", desc: "three stacked bands that nest or solder together" },
];

// ── Helper: hinge knuckle geometry ───────────────────────────────────────────
function makeHinge(radius, height) {
  const group = new THREE.Group();
  // barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 16), null);
  barrel.rotation.x = Math.PI / 2;
  group.add(barrel);
  // pin
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, height * 1.1, 8), null);
  pin.rotation.x = Math.PI / 2;
  group.add(pin);
  return group;
}

// ── Helper: box clasp geometry ────────────────────────────────────────────────
function makeBoxClasp(width, height, depth) {
  const group = new THREE.Group();
  // box shell
  const shell = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), null);
  group.add(shell);
  // tongue strip
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, height * 0.6, depth * 1.3), null);
  tongue.position.z = depth * 0.65;
  tongue.userData.isConnector = true;
  group.add(tongue);
  return group;
}

// ── Helper: jump ring ─────────────────────────────────────────────────────────
function makeJumpRing(r, thickness) {
  const geo = new THREE.TorusGeometry(r, thickness, 8, 24, Math.PI * 1.9);
  return new THREE.Mesh(geo, null);
}

// ── 2-piece builders ──────────────────────────────────────────────────────────

function buildHingedBangle(params) {
  const { innerDiameter = 58, width = 8, thickness = 2 } = params;
  const r0 = innerDiameter / 10 / 2;
  const w  = width / 10;
  const t  = thickness / 10;

  const group = new THREE.Group();

  // two half-arcs
  for (let half = 0; half < 2; half++) {
    const halfGroup = new THREE.Group();
    const angle = Math.PI * 0.95; // slightly less than half for gap
    const shape = new THREE.Shape();
    shape.moveTo(r0, -w/2); shape.lineTo(r0+t, -w/2); shape.lineTo(r0+t, w/2); shape.lineTo(r0, w/2); shape.closePath();
    const geo = new THREE.LatheGeometry(shape.getPoints(12).map(p => new THREE.Vector2(p.x, p.y)), 32, 0, angle);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, null);
    mesh.rotation.x = Math.PI / 2;
    halfGroup.add(mesh);

    // hinge on one side
    const hinge = makeHinge(t * 0.7, w * 0.4);
    hinge.position.set(r0 + t/2, 0, 0);
    hinge.userData.isConnector = true;
    halfGroup.add(hinge);

    // box clasp end on other side
    const clasp = makeBoxClasp(t * 1.6, w * 0.5, t);
    clasp.position.set(-(r0 + t/2), 0, 0);
    clasp.userData.isConnector = true;
    halfGroup.add(clasp);

    halfGroup.rotation.y = half === 1 ? Math.PI : 0;
    group.add(halfGroup);
  }

  return group;
}

function buildBoxClaspBand(params) {
  const { innerDiameter = 58, width = 8, thickness = 2 } = params;
  const r = innerDiameter / 10 / 2;
  const w = width / 10;
  const t = thickness / 10;
  const group = new THREE.Group();

  // main band (open arc — ~270°)
  const shape = new THREE.Shape();
  shape.moveTo(r, -w/2); shape.lineTo(r+t, -w/2); shape.lineTo(r+t, w/2); shape.lineTo(r, w/2); shape.closePath();
  const geo = new THREE.LatheGeometry(shape.getPoints(12).map(p => new THREE.Vector2(p.x, p.y)), 48, 0, Math.PI * 1.5);
  geo.computeVertexNormals();
  const band = new THREE.Mesh(geo, null);
  band.rotation.x = Math.PI / 2;
  group.add(band);

  // clasp ends
  const c1 = makeBoxClasp(t*2, w*0.7, t*1.5);
  c1.position.set(r + t/2, 0, 0); c1.userData.isConnector = true;
  const c2 = makeBoxClasp(t*2, w*0.7, t*1.5);
  c2.position.set(0, 0, -(r + t/2)); c2.rotation.y = -Math.PI/2; c2.userData.isConnector = true;
  group.add(c1); group.add(c2);

  return group;
}

function buildToggleSet(params) {
  const { width = 5 } = params;
  const w = width / 10;
  const group = new THREE.Group();

  // ring side
  const ring = new THREE.Mesh(new THREE.TorusGeometry(w, w*0.15, 8, 32), null);
  ring.position.x = -0.2;
  group.add(ring);

  // bar side
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(w*0.12, w*0.12, w*2.5, 12), null);
  bar.position.x = 0.25; bar.rotation.z = Math.PI/2;
  group.add(bar);

  // jump ring connecting to cord
  const jr = makeJumpRing(w*0.25, w*0.05);
  jr.position.x = -0.2 - w; jr.userData.isConnector = true;
  group.add(jr);

  return group;
}

function buildLocket(params) {
  const { width = 25, height = 30, depth = 5 } = params;
  const w = width/10/2, h = height/10/2, d = depth/10/2;
  const group = new THREE.Group();

  // front shell
  const frontGeo = new THREE.BoxGeometry(w*2, h*2, d);
  const front = new THREE.Mesh(frontGeo, null);
  front.position.z = d/2;
  group.add(front);

  // back shell (slightly smaller inset)
  const backGeo = new THREE.BoxGeometry(w*1.9, h*1.9, d);
  const back = new THREE.Mesh(backGeo, null);
  back.position.z = -d/2;
  group.add(back);

  // hinge on top
  const hinge = makeHinge(d*0.4, w*0.3);
  hinge.position.set(0, h + d*0.2, 0);
  hinge.userData.isConnector = true;
  group.add(hinge);

  // bail
  const bail = new THREE.Mesh(new THREE.TorusGeometry(d*0.6, d*0.15, 8, 24, Math.PI), null);
  bail.position.set(0, h + d*0.8, 0); bail.rotation.x = Math.PI/2;
  bail.userData.isConnector = true;
  group.add(bail);

  return group;
}

function buildSplitShankRing(params) {
  const { innerRadius = 9, bandWidth = 6, thickness = 1.6 } = params;
  const r = innerRadius/10, w = bandWidth/10, t = thickness/10;
  const group = new THREE.Group();

  // two shank arcs that converge at top
  for (const side of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 1.3 - Math.PI * 0.65;
      const spread = (1 - Math.abs(a) / (Math.PI * 0.65)) * t * 1.5;
      pts.push(new THREE.Vector3(
        Math.cos(a) * (r + t),
        Math.sin(a) * (r + t),
        side * spread
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 32, t/2, 8, false);
    const mesh = new THREE.Mesh(geo, null);
    mesh.rotation.x = Math.PI/2;
    group.add(mesh);
  }

  return group;
}

// ── 3-piece builders ──────────────────────────────────────────────────────────

function buildArticulatedBand(params) {
  const { innerDiameter = 58, width = 10, thickness = 2 } = params;
  const r = innerDiameter/10/2, w = width/10, t = thickness/10;
  const group = new THREE.Group();

  // three panels at 0°, 120°, 240°
  for (let p = 0; p < 3; p++) {
    const panelGroup = new THREE.Group();
    const angle = (Math.PI * 2) / 3;
    const shape = new THREE.Shape();
    shape.moveTo(r, -w/2); shape.lineTo(r+t, -w/2); shape.lineTo(r+t, w/2); shape.lineTo(r, w/2); shape.closePath();
    const geo = new THREE.LatheGeometry(shape.getPoints(10).map(q => new THREE.Vector2(q.x, q.y)), 20, 0, angle * 0.85);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, null);
    mesh.rotation.x = Math.PI/2;
    mesh.rotation.z = -angle * p - angle * 0.075;
    panelGroup.add(mesh);

    // pivot links between panels
    if (p < 2) {
      const jr = makeJumpRing(t*0.6, t*0.15);
      const angle2 = -angle * p - angle * 0.85;
      jr.position.set(Math.cos(angle2) * r, 0, Math.sin(angle2) * r);
      jr.rotation.y = angle2;
      jr.userData.isConnector = true;
      group.add(jr);
    }

    group.add(panelGroup);
  }

  return group;
}

function buildPendantSet(params) {
  const { shape = "teardrop", width = 18, height = 24, depth = 2.5, chainLength = 450 } = params;
  const w = width/10/2, h = height/10/2, d = depth/10;
  const group = new THREE.Group();

  // pendant body
  const s = new THREE.Shape();
  s.moveTo(0, -h); s.bezierCurveTo(w*1.1, -h*0.4, w*1.1, h*0.3, 0, h*0.7); s.bezierCurveTo(-w*1.1, h*0.3, -w*1.1, -h*0.4, 0, -h);
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 });
  bodyGeo.computeVertexNormals();
  const body = new THREE.Mesh(bodyGeo, null);
  body.rotation.x = -Math.PI/2; body.position.y = 0;
  group.add(body);

  // bail (piece 2)
  const bailR = d * 0.5;
  const bail = new THREE.Mesh(new THREE.TorusGeometry(bailR, bailR*0.3, 10, 20, Math.PI), null);
  bail.position.set(0, h + bailR*0.5, 0); bail.rotation.x = Math.PI/2;
  bail.userData.isPiece2 = true;
  group.add(bail);

  // short chain segment (piece 3 — representative)
  const chainSegs = 12;
  const segLen = 0.08;
  for (let i = 0; i < chainSegs; i++) {
    const link = new THREE.Mesh(new THREE.TorusGeometry(segLen*0.4, segLen*0.1, 6, 12), null);
    const ly = h + bailR*1.5 + i * segLen * 0.9;
    link.position.set(0, ly, 0);
    link.rotation.x = i % 2 === 0 ? 0 : Math.PI/2;
    link.userData.isPiece3 = true;
    group.add(link);
  }

  return group;
}

function buildBarEarring(params) {
  const { dropLength = 30, width = 3 } = params;
  const l = dropLength/10, w = width/10;
  const group = new THREE.Group();

  // top post (piece 1)
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 10), null);
  post.position.y = l/2 + 0.05;
  group.add(post);

  // connector jump ring (piece 2)
  const jr = makeJumpRing(w*0.5, w*0.1);
  jr.position.y = l/2; jr.userData.isPiece2 = true;
  group.add(jr);

  // drop bar (piece 3)
  const bar = new THREE.Mesh(new THREE.BoxGeometry(w*4, w*0.6, w*0.6), null);
  bar.position.y = 0; bar.userData.isPiece3 = true;
  group.add(bar);

  return group;
}

function buildTripleBandRing(params) {
  const { innerRadius = 9, thickness = 1.6 } = params;
  const r = innerRadius/10, t = thickness/10;
  const group = new THREE.Group();
  const offsets = [-t*1.1, 0, t*1.1];

  for (let i = 0; i < 3; i++) {
    const shape = new THREE.Shape();
    const bw = (t * 0.8);
    shape.moveTo(r, -bw/2); shape.lineTo(r+t*0.9, -bw/2); shape.lineTo(r+t*0.9, bw/2); shape.lineTo(r, bw/2); shape.closePath();
    const geo = new THREE.LatheGeometry(shape.getPoints(16).map(p => new THREE.Vector2(p.x, p.y)), 64);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, null);
    mesh.rotation.x = Math.PI/2; mesh.position.z = offsets[i];
    if (i > 0) mesh.userData[i === 1 ? "isPiece2" : "isPiece3"] = true;
    group.add(mesh);
  }

  return group;
}

// ── Public builders map ───────────────────────────────────────────────────────

export const TWO_PIECE_BUILDERS = {
  "hinged-bangle": buildHingedBangle,
  "box-clasp":     buildBoxClaspBand,
  "toggle":        buildToggleSet,
  "locket":        buildLocket,
  "split-shank":   buildSplitShankRing,
};

export const THREE_PIECE_BUILDERS = {
  "articulated-band": buildArticulatedBand,
  "pendant-set":      buildPendantSet,
  "bar-earring":      buildBarEarring,
  "triple-band":      buildTripleBandRing,
};

export function buildMultiPiece(type, pieceCount, params) {
  if (pieceCount === 2) return TWO_PIECE_BUILDERS[type]?.(params) ?? new THREE.Group();
  if (pieceCount === 3) return THREE_PIECE_BUILDERS[type]?.(params) ?? new THREE.Group();
  return new THREE.Group();
}