import { useEffect, useRef, useState } from "react";
import { MousePointer2, Hand, ZoomIn, ZoomOut, ChevronRight, Brush, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { MATERIALS, FINISH_ROUGHNESS, STONE_COLORS } from "@/lib/jewelryDefaults";
import { svgToThreeShape } from "@/lib/svgToShape";
import { buildMultiPiece } from "@/lib/multiPieceJewelry";

let OrbitControls = null;
async function loadControls() {
  if (!OrbitControls) {
    const m = await import("three/examples/jsm/controls/OrbitControls.js");
    OrbitControls = m.OrbitControls;
  }
}

// ── Procedural normal-map textures ────────────────────────────────────────────
function makeHammerTex() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const n = Math.random() * 60 - 30;
    data[i * 4] = 128 + n; data[i * 4 + 1] = 128 + n;
    data[i * 4 + 2] = 255; data[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
}

function makeBrushedTex() {
  const w = 256, h = 4;
  const data = new Uint8Array(w * h * 4);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const n = Math.random() * 20 - 10;
      const i = (y * w + x) * 4;
      data[i] = 128 + n; data[i + 1] = 128; data[i + 2] = 255; data[i + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 1);
  t.needsUpdate = true;
  return t;
}

// ── Material builder ──────────────────────────────────────────────────────────
function buildMaterial(material, finish, textures) {
  const preset = MATERIALS[material] || MATERIALS.silver;
  const extraR  = FINISH_ROUGHNESS[finish] ?? 0;
  return new THREE.MeshStandardMaterial({
    color: preset.color,
    roughness: Math.min(1, preset.roughness + extraR),
    metalness: preset.metalness,
    normalMap: finish === "hammered" ? textures.hammer
             : finish === "brushed"  ? textures.brushed
             : null,
    normalScale: new THREE.Vector2(0.5, 0.5),
    envMapIntensity: preset.envMapIntensity ?? 1.0,
  });
}

// ── Ring geometry ─────────────────────────────────────────────────────────────
function buildRing(ring, segments) {
  const r0 = ring.innerRadius / 10;
  const h  = ring.bandWidth  / 10;
  const t  = ring.thickness  / 10;
  const r1 = r0 + t;

  const shape = new THREE.Shape();
  if (ring.profile === "flat") {
    shape.moveTo(r0, -h/2); shape.lineTo(r1, -h/2);
    shape.lineTo(r1, h/2);  shape.lineTo(r0, h/2);
  } else if (ring.profile === "comfort") {
    const c = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(r0, -h/2),
      new THREE.Vector2(r0 - t*0.3, 0),
      new THREE.Vector2(r0, h/2)
    );
    const pts = c.getPoints(8);
    shape.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p) => shape.lineTo(p.x, p.y));
    shape.lineTo(r1, h/2); shape.lineTo(r1, -h/2);
  } else if (ring.profile === "knife-edge") {
    shape.moveTo(r0, -h/2); shape.lineTo(r1-t*0.6, -h/2);
    shape.lineTo(r1, 0);    shape.lineTo(r1-t*0.6, h/2);
    shape.lineTo(r0, h/2);
  } else if (ring.profile === "barrel") {
    const c = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(r1-t*0.4, -h/2),
      new THREE.Vector2(r1+t*0.25, 0),
      new THREE.Vector2(r1-t*0.4, h/2)
    );
    const pts = c.getPoints(8);
    shape.moveTo(r0, -h/2); shape.lineTo(pts[0].x, pts[0].y);
    pts.forEach((p) => shape.lineTo(p.x, p.y));
    shape.lineTo(r0, h/2);
  } else if (ring.profile === "signet") {
    shape.moveTo(r0, -h/2); shape.lineTo(r1, -h/2);
    shape.lineTo(r1, h/2);  shape.lineTo(r0, h/2);
  }
  shape.closePath();

  const geo = new THREE.LatheGeometry(
    shape.getPoints(20).map((p) => new THREE.Vector2(p.x, p.y)),
    segments
  );
  geo.computeVertexNormals();
  const group = new THREE.Group();

  if (ring.profile === "signet") {
    const fw = ring.signetWidth / 10 / 2;
    const ft = 0.025;
    const face = new THREE.Mesh(new THREE.BoxGeometry(fw * 2, ft, (ring.signetHeight/10/2) * 2), null);
    face.position.set(0, r1 + ft/2, 0);
    face.userData.isFace = true;
    group.add(face);
  }

  const mesh = new THREE.Mesh(geo, null);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

// ── Pendant geometry ──────────────────────────────────────────────────────────
function buildPendant(pendant) {
  const { shape, width, height, depth, bailWidth, bailHeight } = pendant;
  const w = width  / 10 / 2;
  const h = height / 10 / 2;

  let bodyGeo;

  // SVG-imported silhouette takes priority
  if (shape === "svg-import" && pendant.svgShape) {
    try {
      const extruded = new THREE.ExtrudeGeometry(pendant.svgShape, {
        depth: depth / 10,
        bevelEnabled: true,
        bevelSize: 0.006,
        bevelThickness: 0.006,
        bevelSegments: 2,
      });
      // centre the extruded shape
      extruded.computeBoundingBox();
      const centre = new THREE.Vector3();
      extruded.boundingBox.getCenter(centre);
      extruded.translate(-centre.x, -centre.y, -centre.z);
      // scale so it fits within (w*2) × (h*2)
      const size = new THREE.Vector3();
      extruded.boundingBox.getSize(size);
      const sc = Math.min((w * 2) / size.x, (h * 2) / size.y);
      extruded.scale(sc, sc, 1);
      extruded.computeVertexNormals();
      bodyGeo = extruded;
    } catch (e) {
      // fall through to default circle if SVG parse fails
    }
  }
  if (shape === "circle") {
    bodyGeo = new THREE.CylinderGeometry(w, w, depth/10, 64);
  } else if (shape === "square") {
    bodyGeo = new THREE.BoxGeometry(w*2, depth/10, h*2);
  } else if (shape === "hexagon") {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI/6;
      pts.push(new THREE.Vector2(Math.cos(a) * w, Math.sin(a) * h * 0.9));
    }
    bodyGeo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: depth/10, bevelEnabled: false });
  } else if (shape === "teardrop") {
    const s = new THREE.Shape();
    s.moveTo(0, -h); s.bezierCurveTo(w*1.1, -h*0.4, w*1.1, h*0.3, 0, h*0.7); s.bezierCurveTo(-w*1.1, h*0.3, -w*1.1, -h*0.4, 0, -h);
    bodyGeo = new THREE.ExtrudeGeometry(s, { depth: depth/10, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
  } else if (shape === "shield") {
    const s = new THREE.Shape();
    s.moveTo(-w, h*0.4); s.lineTo(-w, h); s.lineTo(w, h); s.lineTo(w, h*0.4); s.lineTo(0, -h); s.closePath();
    bodyGeo = new THREE.ExtrudeGeometry(s, { depth: depth/10, bevelEnabled: false });
  } else if (shape === "leaf") {
    const s = new THREE.Shape();
    s.moveTo(0, -h); s.bezierCurveTo(w*1.2, -h*0.3, w*0.8, h*0.5, 0, h); s.bezierCurveTo(-w*0.8, h*0.5, -w*1.2, -h*0.3, 0, -h);
    bodyGeo = new THREE.ExtrudeGeometry(s, { depth: depth/10, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 });
  } else if (shape === "star") {
    const pts5 = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI/2;
      const r = i % 2 === 0 ? w : w * 0.45;
      pts5.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    }
    const s = new THREE.Shape(); s.setFromPoints(pts5);
    bodyGeo = new THREE.ExtrudeGeometry(s, { depth: depth/10, bevelEnabled: false });
  } else {
    bodyGeo = new THREE.CylinderGeometry(w, w, depth/10, 48);
  }

  bodyGeo.computeVertexNormals();
  const group = new THREE.Group();
  const body = new THREE.Mesh(bodyGeo, null);
  if (shape !== "circle") body.rotation.x = -Math.PI / 2;
  body.castShadow = true; body.receiveShadow = true;
  group.add(body);

  const bw = bailWidth / 10 / 2;
  const bail = new THREE.Mesh(new THREE.TorusGeometry(bw, bw * 0.3, 12, 24, Math.PI), null);
  bail.userData.isBail = true;
  bail.position.set(0, h + (bailHeight/10) * 0.3, 0);
  bail.rotation.x = Math.PI / 2;
  group.add(bail);
  return group;
}

// ── Bracelet geometry ─────────────────────────────────────────────────────────
function buildBracelet(bracelet, segments) {
  const { style, innerDiameter, width, thickness, cuffOpening, linkSize } = bracelet;
  const r0 = innerDiameter / 10 / 2;
  const w  = width / 10;
  const t  = thickness / 10;
  const r1 = r0 + t;
  const group = new THREE.Group();

  if (style === "bangle") {
    const shape = new THREE.Shape();
    shape.moveTo(r0, -w/2); shape.lineTo(r1, -w/2); shape.lineTo(r1, w/2); shape.lineTo(r0, w/2); shape.closePath();
    const geo = new THREE.LatheGeometry(shape.getPoints(16).map((p) => new THREE.Vector2(p.x, p.y)), segments);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, null); mesh.rotation.x = Math.PI / 2; mesh.castShadow = true;
    group.add(mesh);
  } else if (style === "cuff") {
    const angle = (360 - cuffOpening) * (Math.PI / 180);
    const shape = new THREE.Shape();
    shape.moveTo(r0, -w/2); shape.lineTo(r1, -w/2); shape.lineTo(r1, w/2); shape.lineTo(r0, w/2); shape.closePath();
    const geo = new THREE.LatheGeometry(shape.getPoints(16).map((p) => new THREE.Vector2(p.x, p.y)), Math.round(segments * ((360-cuffOpening)/360)), 0, angle);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, null); mesh.rotation.x = Math.PI / 2; mesh.castShadow = true;
    group.add(mesh);
  } else if (style === "chain-link") {
    const ls = linkSize / 10 / 2;
    const count = Math.round((Math.PI * r0 * 2) / (linkSize / 10 * 1.4));
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const link = new THREE.Mesh(new THREE.TorusGeometry(ls, ls * 0.28, 8, 16), null);
      link.position.set(Math.cos(a) * r0, 0, Math.sin(a) * r0);
      link.rotation.y = a; link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2; link.castShadow = true;
      group.add(link);
    }
  } else if (style === "tennis") {
    const geo = new THREE.TorusGeometry(r0 + t/2, t/2, 12, segments);
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, null));
  }
  return group;
}

// ── Earring geometry (category-aware + backing visualization) ─────────────────
function buildEarring(earring) {
  const category = earring.category ?? "stud";
  const group = new THREE.Group();

  if (category === "stud") {
    const r = (earring.size ?? 10) / 10 / 2;
    const d = (earring.thickness ?? 1.5) / 10;
    const shape = earring.shape ?? "circle";
    let face;
    if (shape === "square") {
      face = new THREE.Mesh(new THREE.BoxGeometry(r*2, d, r*2), null);
    } else if (shape === "heart") {
      const s = new THREE.Shape();
      s.moveTo(0, -r); s.bezierCurveTo(r, -r, r*1.2, r*0.2, 0, r*0.8); s.bezierCurveTo(-r*1.2, r*0.2, -r, -r, 0, -r);
      face = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), null);
      face.rotation.x = -Math.PI / 2;
    } else if (shape === "triangle") {
      const s = new THREE.Shape();
      s.moveTo(0, r); s.lineTo(r*0.866, -r*0.5); s.lineTo(-r*0.866, -r*0.5); s.closePath();
      face = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), null);
      face.rotation.x = -Math.PI / 2;
    } else if (shape === "star") {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI/2;
        pts.push(new THREE.Vector2(Math.cos(a) * (i%2===0?r:r*0.45), Math.sin(a) * (i%2===0?r:r*0.45)));
      }
      const s = new THREE.Shape(); s.setFromPoints(pts);
      face = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), null);
      face.rotation.x = -Math.PI / 2;
    } else {
      face = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d, 48), null);
    }
    face.castShadow = true;
    group.add(face);

    // post
    const postR = (earring.postDiameter ?? 0.8) / 10 / 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, 0.08, 12), null);
    post.position.y = -d/2 - 0.04;
    group.add(post);

    // backing visualization
    const mech = earring.mechanism ?? "butterfly";
    if (mech === "butterfly" || mech === "push-fit") {
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.01, 0.018), null);
        wing.position.set(side * 0.022, -d/2 - 0.09, 0);
        wing.userData.isBacking = true;
        group.add(wing);
      }
    } else if (mech === "disc-back") {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.005, 24), null);
      disc.position.y = -d/2 - 0.09; disc.userData.isBacking = true;
      group.add(disc);
    } else if (mech === "screw-back") {
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 6), null);
      nut.position.y = -d/2 - 0.09; nut.userData.isBacking = true;
      group.add(nut);
    } else if (mech === "clip-on") {
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.04), null);
      clip.position.y = -d/2 - 0.05; clip.userData.isBacking = true;
      group.add(clip);
    }
  }

  else if (category === "hoop") {
    const hr = (earring.hoopDiameter ?? 20) / 10 / 2;
    const ht = (earring.hoopThickness ?? 1.5) / 10 / 2;
    const shape = earring.shape ?? "thin-wire";
    const mech  = earring.mechanism ?? "huggie-snap";

    if (shape === "huggie" || mech === "huggie-snap") {
      const geo = new THREE.TorusGeometry(hr, ht * 1.8, 16, 64, Math.PI * 1.85);
      group.add(new THREE.Mesh(geo, null));
      const hinge = new THREE.Mesh(new THREE.SphereGeometry(ht * 2, 8, 8), null);
      hinge.position.set(hr, 0, 0); hinge.userData.isBacking = true;
      group.add(hinge);
    } else if (shape === "wide-band") {
      group.add(new THREE.Mesh(new THREE.TorusGeometry(hr, ht * 3, 12, 64), null));
    } else {
      const geo = new THREE.TorusGeometry(hr, ht, 12, 64);
      group.add(new THREE.Mesh(geo, null));
    }

    if (mech === "click-ring") {
      const notch = new THREE.Mesh(new THREE.SphereGeometry(ht * 1.5, 8, 8), null);
      notch.position.set(0, -hr, 0); notch.userData.isBacking = true;
      group.add(notch);
    } else if (mech === "latch-back") {
      const latch = new THREE.Mesh(new THREE.BoxGeometry(ht*2, ht*4, ht), null);
      latch.position.set(hr * 0.7, -hr * 0.7, 0); latch.userData.isBacking = true;
      group.add(latch);
    }
  }

  else if (category === "drop") {
    const wireGeo = new THREE.CylinderGeometry(0.008, 0.008, (earring.dropLength ?? 20)/10/2, 8);
    const wire = new THREE.Mesh(wireGeo, null);
    wire.position.y = (earring.dropLength ?? 20)/10/4;
    group.add(wire);
    const r = (earring.size ?? 8) / 10 / 2;
    const shape = earring.shape ?? "teardrop";
    let drop;
    if (shape === "bar") {
      drop = new THREE.Mesh(new THREE.BoxGeometry(r*0.4, (earring.dropLength ?? 20)/10/2, r*0.4), null);
    } else if (shape === "circle") {
      drop = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.02, 32), null);
    } else {
      const s = new THREE.Shape();
      s.moveTo(0, -r); s.bezierCurveTo(r*1.1, -r*0.4, r*1.1, r*0.3, 0, r*0.7); s.bezierCurveTo(-r*1.1, r*0.3, -r*1.1, -r*0.4, 0, -r);
      drop = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: (earring.thickness ?? 1.5)/10, bevelEnabled: false }), null);
      drop.rotation.x = -Math.PI/2;
    }
    drop.position.y = -(earring.dropLength ?? 20)/10/2;
    drop.castShadow = true;
    group.add(drop);
  }

  else if (category === "cuff") {
    const hr = (earring.hoopDiameter ?? 14) / 10 / 2;
    const ht = (earring.hoopThickness ?? 1.5) / 10 / 2;
    const geo = new THREE.TorusGeometry(hr, ht * ((earring.cuffWidth ?? 4)/4), 12, 48, Math.PI * 1.6);
    group.add(new THREE.Mesh(geo, null));
  }

  else if (category === "climber" || category === "crawler") {
    const len = (earring.climbLength ?? 18) / 10;
    const d   = (earring.thickness ?? 1.5) / 10 / 2;
    const w   = (earring.size ?? 4) / 10 / 2;
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const frac = i / 16;
      pts.push(new THREE.Vector3(Math.sin(frac * 0.8) * w * 2, frac * len - len/2, 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, d, 8, false), null));
  }

  else if (category === "threader") {
    const len = (earring.dropLength ?? 60) / 10;
    const g   = (earring.hoopThickness ?? 0.7) / 10 / 2;
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(g, g, len, 8), null));
  }

  else if (category === "wrap") {
    const len = (earring.climbLength ?? 35) / 10;
    const g   = (earring.hoopThickness ?? 1.2) / 10 / 2;
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const frac = i / 64;
      const angle = frac * 3 * Math.PI * 2;
      const r = 0.08 + frac * 0.04;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, frac * len - len/2, Math.sin(angle) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, g, 8, false), null));
  }

  return group;
}

// ── Stone mesh ────────────────────────────────────────────────────────────────
function buildStone(stoneState) {
  const { shape, sizeMm } = stoneState;
  const s = sizeMm / 20;
  let geo;
  if (shape === "round")     geo = new THREE.SphereGeometry(s, 16, 10, 0, Math.PI*2, 0, Math.PI*0.55);
  else if (shape === "square")   geo = new THREE.BoxGeometry(s*1.8, s*0.8, s*1.8);
  else if (shape === "oval")     { geo = new THREE.SphereGeometry(s, 12, 8, 0, Math.PI*2, 0, Math.PI*0.55); geo.scale(1.5, 1, 1); }
  else if (shape === "marquise") { geo = new THREE.SphereGeometry(s, 12, 8, 0, Math.PI*2, 0, Math.PI*0.55); geo.scale(0.6, 0.8, 1.6); }
  else if (shape === "trillion") geo = new THREE.ConeGeometry(s, s*0.7, 3);
  else if (shape === "heart") {
    const pts = new THREE.Shape();
    pts.moveTo(0, -s); pts.bezierCurveTo(s, -s, s*1.2, s*0.2, 0, s*0.8); pts.bezierCurveTo(-s*1.2, s*0.2, -s, -s, 0, -s);
    geo = new THREE.ExtrudeGeometry(pts, { depth: s*0.5, bevelEnabled: false });
  } else geo = new THREE.SphereGeometry(s, 16, 10, 0, Math.PI*2, 0, Math.PI*0.55);
  return geo;
}

// ── Pattern overlay textures ──────────────────────────────────────────────────
function makePatternTex(pattern, scale) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
  const s = Math.round(size / (8 * scale));

  if (pattern === "lattice") {
    for (let x = 0; x < size; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke(); }
    for (let y = 0; y < size; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke(); }
  } else if (pattern === "dots") {
    for (let x = s/2; x < size; x += s)
      for (let y = s/2; y < size; y += s) {
        ctx.beginPath(); ctx.arc(x, y, s*0.25, 0, Math.PI*2); ctx.fillStyle="#ffffff"; ctx.fill();
      }
  } else if (pattern === "waves") {
    for (let y = 0; y < size; y += s) {
      ctx.beginPath();
      for (let x = 0; x <= size; x += 4)
        x === 0 ? ctx.moveTo(x, y + Math.sin(x/s*Math.PI)*s*0.4) : ctx.lineTo(x, y + Math.sin(x/s*Math.PI)*s*0.4);
      ctx.stroke();
    }
  } else if (pattern === "chevron") {
    for (let y = 0; y < size*2; y += s) {
      ctx.beginPath();
      for (let x = 0; x <= size; x++) {
        const yy = y + (x % s < s/2 ? x % s : s - x % s) * 1.5;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  } else if (pattern === "lines") {
    for (let y = 0; y < size; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke(); }
  } else if (pattern === "floral") {
    for (let x = s/2; x < size; x += s)
      for (let y = s/2; y < size; y += s) {
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(x + Math.cos(a)*s*0.3, y + Math.sin(a)*s*0.3, s*0.22, 0, Math.PI*2); ctx.stroke();
        }
      }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

// ── Assign material to all meshes ─────────────────────────────────────────────
function applyMat(group, mat, backingMat, piece2Mat, piece3Mat) {
  group.traverse((obj) => {
    if (obj.isMesh) {
      if (obj.userData.isBacking && backingMat)    obj.material = backingMat;
      else if (obj.userData.isPiece2 && piece2Mat) obj.material = piece2Mat;
      else if (obj.userData.isPiece3 && piece3Mat) obj.material = piece3Mat;
      else obj.material = mat;
    }
  });
}

// ── Clay sculpt: displace vertices within brush radius along surface normal ────
function sculptMesh(mesh, hitPoint, faceNormal, radius, strength) {
  const localHit = mesh.worldToLocal(hitPoint.clone());
  // transform normal to local space (no translation, just rotation)
  const normalMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  const normalMatInv = normalMat.clone().invert();
  const localNorm = faceNormal.clone().applyMatrix3(normalMatInv).normalize();

  const pos = mesh.geometry.attributes.position;
  const arr = pos.array;
  for (let i = 0; i < pos.count; i++) {
    const vx = arr[i*3], vy = arr[i*3+1], vz = arr[i*3+2];
    const dist = Math.sqrt((vx - localHit.x)**2 + (vy - localHit.y)**2 + (vz - localHit.z)**2);
    if (dist < radius) {
      // smooth cosine falloff
      const falloff = 0.5 * (1 + Math.cos(Math.PI * dist / radius));
      arr[i*3]   += localNorm.x * strength * falloff;
      arr[i*3+1] += localNorm.y * strength * falloff;
      arr[i*3+2] += localNorm.z * strength * falloff;
    }
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

// ── Main viewport component ───────────────────────────────────────────────────
export default function JewelryViewport({ jewelry, onSceneGroupRef }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef({});

  const [tool, setTool]               = useState("orbit");
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [brushRadius, setBrushRadius] = useState(0.15);
  const [brushStrength, setBrushStrength] = useState(0.008);
  const [sculptMode, setSculptMode]   = useState("push"); // push | pull

  const dragRef   = useRef({ active: false, mesh: null, plane: new THREE.Plane(), offset: new THREE.Vector3() });
  const sculptRef = useRef({ active: false });
  const raycaster = useRef(new THREE.Raycaster());
  const mouse     = useRef(new THREE.Vector2());

  // ── Scene init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    async function init() {
      await loadControls();
      if (cancelled) return;

      const w = canvas.clientWidth  || 700;
      const h = canvas.clientHeight || 600;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xedeae4);

      const camera = new THREE.PerspectiveCamera(32, w/h, 0.01, 100);
      camera.position.set(0, 1.8, 4.5);

      scene.add(new THREE.AmbientLight(0xfff6e8, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(3, 6, 4); key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048); scene.add(key);
      const fill = new THREE.DirectionalLight(0xdde8ff, 1.4);
      fill.position.set(-4, 2, -3); scene.add(fill);
      scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 0.7), { position: new THREE.Vector3(0, -3, -4) }));

      const ground = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.ShadowMaterial({ opacity: 0.15 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true;
      scene.add(ground);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = 0.06;
      controls.minDistance = 0.5; controls.maxDistance = 15;
      controls.maxPolarAngle = Math.PI * 0.85;
      controls.autoRotate = true; controls.autoRotateSpeed = 0.7;

      renderer.domElement.addEventListener("pointerdown", () => {
        controls.autoRotate = false;
        clearTimeout(stateRef.current._idle);
        stateRef.current._idle = setTimeout(() => { controls.autoRotate = true; }, 4000);
      });

      const itemGroup = new THREE.Group();
      scene.add(itemGroup);

      // translucent sphere shows brush footprint
      const brushCursor = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.18, depthWrite: false })
      );
      brushCursor.visible = false;
      scene.add(brushCursor);

      const textures = { hammer: makeHammerTex(), brushed: makeBrushedTex() };
      stateRef.current = { renderer, scene, camera, controls, itemGroup, textures, brushCursor };
      onSceneGroupRef?.(itemGroup);

      const ro = new ResizeObserver(() => {
        const nw = canvas.clientWidth, nh = canvas.clientHeight;
        renderer.setSize(nw, nh, false);
        camera.aspect = nw/nh; camera.updateProjectionMatrix();
      });
      ro.observe(canvas);
      stateRef.current._ro = ro;

      const animate = () => {
        stateRef.current._animId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    }

    init();
    return () => {
      cancelled = true;
      cancelAnimationFrame(stateRef.current._animId);
      stateRef.current._ro?.disconnect();
      stateRef.current.renderer?.dispose();
      stateRef.current.controls?.dispose();
      clearTimeout(stateRef.current._idle);
    };
  }, []);

  // ── Rebuild mesh on jewelry change ────────────────────────────────────────
  useEffect(() => {
    const { itemGroup, textures } = stateRef.current;
    if (!itemGroup) return;

    while (itemGroup.children.length) {
      const c = itemGroup.children[0];
      c.traverse?.((o) => { if (o.isMesh) { o.geometry?.dispose(); o.material?.dispose(); } });
      itemGroup.remove(c);
    }

    const mat = buildMaterial(jewelry.material, jewelry.finish, textures);
    if (jewelry.pattern !== "none" && jewelry.pattern !== "custom-svg") {
      const patternTex = makePatternTex(jewelry.pattern, jewelry.patternScale);
      mat.normalMap = patternTex;
      mat.normalScale.set(jewelry.patternDepth * 0.8, jewelry.patternDepth * 0.8);
    }

    const backingMat = mat.clone();
    backingMat.roughness = Math.min(1, mat.roughness + 0.15);
    backingMat.color.multiplyScalar(0.8);

    // piece2 / piece3 get slightly tinted variants so assemblies read clearly
    const piece2Mat = mat.clone(); piece2Mat.color.multiplyScalar(0.92);
    const piece3Mat = mat.clone(); piece3Mat.color.multiplyScalar(0.84);

    let group = new THREE.Group();
    // multi-piece assembly takes priority when configured
    if (jewelry.multiPiece?.enabled && jewelry.multiPiece?.assemblyType) {
      group = buildMultiPiece(
        jewelry.multiPiece.assemblyType,
        jewelry.multiPiece.pieceCount ?? 2,
        {
          innerDiameter: jewelry.bracelet?.innerDiameter ?? 58,
          innerRadius:   jewelry.ring?.innerRadius ?? 9,
          width:         jewelry.bracelet?.width ?? jewelry.pendant?.width ?? 8,
          height:        jewelry.pendant?.height ?? 24,
          depth:         jewelry.pendant?.depth ?? 2.5,
          thickness:     jewelry.bracelet?.thickness ?? jewelry.ring?.thickness ?? 2,
          bandWidth:     jewelry.ring?.bandWidth ?? 6,
          dropLength:    jewelry.earring?.dropLength ?? 30,
          chainLength:   jewelry.chain?.length ?? 450,
          shape:         jewelry.pendant?.shape ?? "teardrop",
        }
      );
    } else if (jewelry.type === "ring")     group = buildRing(jewelry.ring, jewelry.segments);
    else if (jewelry.type === "pendant")  group = buildPendant(jewelry.pendant);
    else if (jewelry.type === "bracelet") group = buildBracelet(jewelry.bracelet, jewelry.segments);
    else if (jewelry.type === "earring")  group = buildEarring(jewelry.earring);

    applyMat(group, mat, backingMat, piece2Mat, piece3Mat);

    if (jewelry.stone.setting !== "none") {
      const gemInfo = STONE_COLORS[jewelry.stone.gem] || STONE_COLORS.diamond;
      const stoneMat = new THREE.MeshStandardMaterial({ color: gemInfo.color, roughness: 0.0, metalness: 0.05, transparent: true, opacity: gemInfo.opacity, envMapIntensity: 2.5 });
      const stoneGeo = buildStone(jewelry.stone);
      const count = Math.min(jewelry.stone.count, 9);
      let radius = 0.1;
      if (jewelry.type === "ring")     radius = (jewelry.ring.innerRadius + jewelry.ring.thickness) / 10;
      if (jewelry.type === "bracelet") radius = (jewelry.bracelet.innerDiameter / 10 / 2) + (jewelry.bracelet.thickness / 10);
      for (let i = 0; i < count; i++) {
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        if (radius > 0) {
          const a = (i / count) * Math.PI * 2;
          const ry = (jewelry.ring?.bandWidth ?? jewelry.bracelet?.width ?? 4) / 10 * 0.5 + jewelry.stone.sizeMm / 20 * 0.4;
          stone.position.set(Math.cos(a) * radius, ry, Math.sin(a) * radius);
        } else {
          stone.position.set(i * (jewelry.stone.sizeMm/10 + 0.02) - (count-1) * (jewelry.stone.sizeMm/10+0.02)/2, (jewelry.pendant?.depth ?? 2.5)/10/2 + jewelry.stone.sizeMm/20, 0);
        }
        group.add(stone);
      }
    }

    const box = new THREE.Box3().setFromObject(group);
    group.position.y = -box.min.y;
    itemGroup.add(group);
  }, [jewelry]);

  // ── Pointer events wired to active tool ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
    };

    const getSculptMeshes = () => {
      const meshes = [];
      stateRef.current.itemGroup?.traverse((o) => {
        if (o.isMesh && !o.userData.isBacking && o.geometry?.attributes?.position) meshes.push(o);
      });
      return meshes;
    };

    const onDown = (e) => {
      const { controls, camera, itemGroup } = stateRef.current;
      if (!controls) return;
      if (tool === "orbit") { controls.enabled = true; return; }
      if (tool === "pan")   { controls.enabled = true; controls.mouseButtons = { LEFT: 2, MIDDLE: 2, RIGHT: 2 }; return; }
      controls.enabled = false;
      getCoords(e);
      raycaster.current.setFromCamera(mouse.current, camera);

      if (tool === "clay") { sculptRef.current.active = true; return; }

      // select tool
      const hits = raycaster.current.intersectObjects(itemGroup?.children ?? [], true);
      if (hits.length > 0) {
        const mesh = hits[0].object;
        dragRef.current.active = true;
        dragRef.current.mesh = mesh.parent && mesh.parent !== itemGroup ? mesh.parent : mesh;
        const normal = new THREE.Vector3(); camera.getWorldDirection(normal);
        dragRef.current.plane.setFromNormalAndCoplanarPoint(normal, hits[0].point);
        const intersect = new THREE.Vector3();
        raycaster.current.ray.intersectPlane(dragRef.current.plane, intersect);
        dragRef.current.offset.subVectors(dragRef.current.mesh.position, intersect);
      }
    };

    const onMove = (e) => {
      const { camera, brushCursor } = stateRef.current;
      if (!camera) return;
      getCoords(e);
      raycaster.current.setFromCamera(mouse.current, camera);

      if (tool === "clay") {
        const meshes = getSculptMeshes();
        const hits = raycaster.current.intersectObjects(meshes, false);
        if (hits.length > 0) {
          const hit = hits[0];
          if (brushCursor) { brushCursor.visible = true; brushCursor.position.copy(hit.point); brushCursor.scale.setScalar(brushRadius); }
          if (sculptRef.current.active) {
            const dir = sculptMode === "pull" ? -1 : 1;
            sculptMesh(hit.object, hit.point, hit.face.normal, brushRadius, brushStrength * dir);
          }
        } else {
          if (brushCursor) brushCursor.visible = false;
        }
        return;
      }

      if (brushCursor) brushCursor.visible = false;
      if (tool !== "select" || !dragRef.current.active) return;
      const intersect = new THREE.Vector3();
      if (raycaster.current.ray.intersectPlane(dragRef.current.plane, intersect)) {
        dragRef.current.mesh.position.copy(intersect.add(dragRef.current.offset));
      }
    };

    const onUp = () => {
      dragRef.current.active = false; dragRef.current.mesh = null;
      sculptRef.current.active = false;
      if (stateRef.current.controls) {
        stateRef.current.controls.mouseButtons = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };
        if (tool === "orbit") stateRef.current.controls.enabled = true;
      }
    };

    const onLeave = () => { if (stateRef.current.brushCursor) stateRef.current.brushCursor.visible = false; };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup",   onUp);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup",   onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [tool, brushRadius, brushStrength, sculptMode]);

  const zoomCamera = (dir) => {
    const { camera, controls } = stateRef.current;
    if (!camera) return;
    camera.position.multiplyScalar(dir === "in" ? 0.8 : 1.25);
    controls?.update();
  };

  const TOOLS = [
    { id: "orbit",  icon: Hand,          tip: "orbit & rotate" },
    { id: "select", icon: MousePointer2, tip: "select & move part" },
    { id: "clay",   icon: Brush,         tip: "clay sculpt" },
  ];

  return (
    <div className="w-full h-full relative bg-[#edeae4]">
      <canvas ref={canvasRef} className="w-full h-full block"
        style={{ touchAction: "none", cursor: tool === "clay" ? "crosshair" : "default" }} />

      {/* Collapsible toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-0 z-10">
        {toolbarOpen && (
          <div className="flex flex-col gap-1 bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl p-1.5 shadow-paper mr-1">
            {TOOLS.map(({ id, icon: Icon, tip }) => (
              <button key={id} onClick={() => setTool(id)} title={tip}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  tool === id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
            <div className="w-full h-px bg-border/40 my-0.5" />
            <button onClick={() => zoomCamera("in")} title="zoom in"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => zoomCamera("out")} title="zoom out"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <button onClick={() => setToolbarOpen(o => !o)}
          className="w-5 h-10 bg-background/70 backdrop-blur-sm border border-border/40 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-paper">
          <ChevronRight className={`w-3 h-3 transition-transform ${toolbarOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Clay brush settings — floats next to toolbar */}
      {tool === "clay" && (
        <div className="absolute left-16 top-1/2 -translate-y-1/2 z-10 bg-background/85 backdrop-blur-md border border-border/50 rounded-2xl p-3 shadow-paper w-44 space-y-3">
          <p className="text-[9px] tracking-widest font-mono text-muted-foreground/40 uppercase">clay brush</p>

          <div className="flex gap-1">
            {["push", "pull"].map((m) => (
              <button key={m} onClick={() => setSculptMode(m)}
                className={`flex-1 py-1 rounded-lg text-[9px] font-mono tracking-wider border transition-all ${
                  sculptMode === m ? "bg-foreground text-background border-foreground" : "border-border/50 text-muted-foreground hover:border-foreground/30"
                }`}>
                {m}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-muted-foreground/60 tracking-wide">radius</span>
              <span className="text-[10px] font-mono text-foreground/50">{brushRadius.toFixed(2)}</span>
            </div>
            <input type="range" min={0.04} max={0.5} step={0.01} value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full accent-foreground cursor-pointer" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-muted-foreground/60 tracking-wide">strength</span>
              <span className="text-[10px] font-mono text-foreground/50">{brushStrength.toFixed(3)}</span>
            </div>
            <input type="range" min={0.001} max={0.03} step={0.001} value={brushStrength}
              onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full accent-foreground cursor-pointer" />
          </div>

          <button onClick={() => { stateRef.current.itemGroup?.traverse((o) => { if (o.isMesh) o.geometry?.computeVertexNormals?.(); }); }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-border/40 text-[9px] font-mono tracking-wider text-muted-foreground hover:text-foreground hover:border-border transition-all">
            <RotateCcw className="w-2.5 h-2.5" />
            smooth normals
          </button>

          <p className="text-[9px] text-muted-foreground/30 tracking-wide leading-relaxed">
            hold + paint over the mesh to deform
          </p>
        </div>
      )}

      {/* Tool hint */}
      {tool === "select" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[10px] tracking-widest font-mono bg-foreground/80 text-background px-3 py-1.5 rounded-full">
            click + drag a part to reposition it
          </span>
        </div>
      )}
      {tool === "clay" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[10px] tracking-widest font-mono bg-foreground/80 text-background px-3 py-1.5 rounded-full">
            {sculptMode} mode — hold + paint to sculpt
          </span>
        </div>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-[10px] tracking-widest font-mono text-foreground/25 bg-background/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
          drag · scroll · pinch to orbit
        </span>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none">
        <span className="text-[10px] tracking-widest font-mono uppercase bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-foreground/40 border border-border/30">
          {jewelry.type} · {jewelry.material} · {jewelry.finish}
        </span>
      </div>
    </div>
  );
}