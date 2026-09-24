import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

let OrbitControls = null;
async function loadControls() {
  if (!OrbitControls) {
    const m = await import("three/examples/jsm/controls/OrbitControls.js");
    OrbitControls = m.OrbitControls;
  }
}

// ── Material colour presets ────────────────────────────────────────────────
const MATERIAL_PRESETS = {
  silver:      { color: 0xd4d4d4, roughness: 0.10, metalness: 1.0, envMapIntensity: 1.2 },
  gold:        { color: 0xf5c842, roughness: 0.08, metalness: 1.0, envMapIntensity: 1.3 },
  brass:       { color: 0xb5a642, roughness: 0.20, metalness: 0.9, envMapIntensity: 1.0 },
  "rose-gold": { color: 0xe8a68c, roughness: 0.10, metalness: 1.0, envMapIntensity: 1.2 },
  oxidized:    { color: 0x2a2622, roughness: 0.55, metalness: 0.7, envMapIntensity: 0.6 },
};

const FINISH_ROUGHNESS = { polished: 0.0, brushed: 0.35, hammered: 0.55, matte: 0.75 };

// ── Ring geometry builder ─────────────────────────────────────────────────
function buildRingGeometry(ring) {
  const {
    innerRadius, bandWidth, thickness,
    profile, segments,
  } = ring;

  const r0 = innerRadius / 10;   // convert mm → scene units (1 unit ~ 1cm)
  const h  = bandWidth  / 10;
  const t  = thickness  / 10;
  const r1 = r0 + t;

  // Build a 2-D cross-section shape, then lathe it
  const shape = new THREE.Shape();

  if (profile === "flat") {
    shape.moveTo(r0, -h / 2);
    shape.lineTo(r1, -h / 2);
    shape.lineTo(r1,  h / 2);
    shape.lineTo(r0,  h / 2);
    shape.closePath();
  } else if (profile === "comfort") {
    // Inner surface slightly convex (comfort fit)
    const curve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(r0, -h / 2),
      new THREE.Vector2(r0 - t * 0.3, 0),
      new THREE.Vector2(r0, h / 2)
    );
    const pts = curve.getPoints(8);
    shape.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p) => shape.lineTo(p.x, p.y));
    shape.lineTo(r1, h / 2);
    shape.lineTo(r1, -h / 2);
    shape.closePath();
  } else if (profile === "knife-edge") {
    // Tapers to a thin knife-edge on the outside
    shape.moveTo(r0, -h / 2);
    shape.lineTo(r1 - t * 0.6, -h / 2);
    shape.lineTo(r1, 0);
    shape.lineTo(r1 - t * 0.6, h / 2);
    shape.lineTo(r0, h / 2);
    shape.closePath();
  } else if (profile === "barrel") {
    // Barrel / D-shaped — outer convex curve
    const outer = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(r1 - t * 0.4, -h / 2),
      new THREE.Vector2(r1 + t * 0.25, 0),
      new THREE.Vector2(r1 - t * 0.4, h / 2)
    );
    const outerPts = outer.getPoints(8);
    shape.moveTo(r0, -h / 2);
    shape.lineTo(outerPts[0].x, outerPts[0].y);
    outerPts.forEach((p) => shape.lineTo(p.x, p.y));
    shape.lineTo(r0, h / 2);
    shape.closePath();
  }

  const geo = new THREE.LatheGeometry(
    shape.getPoints(24).map((p) => new THREE.Vector2(p.x, p.y)),
    segments
  );
  geo.computeVertexNormals();
  return geo;
}

// ── Stone geometry builder ────────────────────────────────────────────────
function buildStoneGeometry(stoneShape, sizeMm) {
  const s = sizeMm / 20;
  if (stoneShape === "round") return new THREE.SphereGeometry(s, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  if (stoneShape === "square") return new THREE.BoxGeometry(s * 1.8, s * 0.8, s * 1.8);
  if (stoneShape === "oval")   return new THREE.SphereGeometry(s, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
  if (stoneShape === "marquise") {
    // elongated diamond shape approximated as scaled sphere
    const g = new THREE.SphereGeometry(s, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
    g.scale(0.6, 0.8, 1.6);
    return g;
  }
  return new THREE.SphereGeometry(s, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
}

// ── Hammered normal map procedural ───────────────────────────────────────
function makeHammerTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const n = (Math.random() * 60 - 30);
    data[i * 4]     = 128 + n;
    data[i * 4 + 1] = 128 + n;
    data[i * 4 + 2] = 255;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export default function RingViewport({ ring }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({});

  // Build ring mesh whenever params change
  const geoKey = useMemo(
    () => `${ring.innerRadius}_${ring.bandWidth}_${ring.thickness}_${ring.profile}_${ring.segments}`,
    [ring.innerRadius, ring.bandWidth, ring.thickness, ring.profile, ring.segments]
  );

  // Initial scene setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let animId;

    async function init() {
      await loadControls();
      if (cancelled) return;

      const w = canvas.clientWidth  || 600;
      const h = canvas.clientHeight || 600;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0ede8);

      // Camera
      const camera = new THREE.PerspectiveCamera(35, w / h, 0.01, 50);
      camera.position.set(0, 1.4, 3.8);

      // Lights
      const ambient = new THREE.AmbientLight(0xfff6e8, 0.9);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffffff, 3.0);
      key.position.set(3, 6, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xdde8ff, 1.2);
      fill.position.set(-4, 2, -3);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(0, -3, -4);
      scene.add(rim);

      // Ground shadow disc
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(3, 64),
        new THREE.ShadowMaterial({ opacity: 0.18 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.01;
      ground.receiveShadow = true;
      scene.add(ground);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 1.0;
      controls.maxDistance = 10;
      controls.maxPolarAngle = Math.PI * 0.85;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;

      // Pause auto-rotate on interaction
      renderer.domElement.addEventListener("pointerdown", () => {
        controls.autoRotate = false;
        clearTimeout(stateRef.current._idleTimer);
        stateRef.current._idleTimer = setTimeout(() => { controls.autoRotate = true; }, 4000);
      });

      // Hammer texture
      const hammerTex = makeHammerTexture();

      // Ring mesh placeholder
      const ringGroup = new THREE.Group();
      scene.add(ringGroup);

      // Store refs
      stateRef.current = { renderer, scene, camera, controls, ringGroup, hammerTex, animId };

      // Render loop
      function animate() {
        animId = requestAnimationFrame(animate);
        stateRef.current.animId = animId;
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Resize
      const ro = new ResizeObserver(() => {
        const nw = canvas.clientWidth;
        const nh = canvas.clientHeight;
        renderer.setSize(nw, nh, false);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      });
      ro.observe(canvas);
      stateRef.current._ro = ro;
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(stateRef.current.animId);
      stateRef.current._ro?.disconnect();
      stateRef.current.renderer?.dispose();
      stateRef.current.controls?.dispose();
      clearTimeout(stateRef.current._idleTimer);
    };
  }, []);

  // Rebuild ring mesh on geometry/material changes
  useEffect(() => {
    const { ringGroup, scene, hammerTex } = stateRef.current;
    if (!ringGroup) return;

    // Clear previous meshes
    while (ringGroup.children.length) {
      const child = ringGroup.children[0];
      child.geometry?.dispose();
      child.material?.dispose();
      ringGroup.remove(child);
    }

    // Build geometry
    const geo = buildRingGeometry(ring);

    // Build material
    const preset = MATERIAL_PRESETS[ring.material] || MATERIAL_PRESETS.silver;
    const extraRoughness = FINISH_ROUGHNESS[ring.finish] ?? 0;
    const mat = new THREE.MeshStandardMaterial({
      color: preset.color,
      roughness: Math.min(1, preset.roughness + extraRoughness),
      metalness: preset.metalness,
      normalMap: ring.finish === "hammered" ? hammerTex : null,
      normalScale: new THREE.Vector2(0.4, 0.4),
      envMapIntensity: preset.envMapIntensity,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Rotate ring to lie flat
    mesh.rotation.x = Math.PI / 2;

    // Center vertically
    const box = new THREE.Box3().setFromObject(mesh);
    mesh.position.y = -box.min.y;
    ringGroup.add(mesh);

    // Add stone(s)
    if (ring.stoneSetting !== "none") {
      const r1 = (ring.innerRadius + ring.thickness) / 10;
      const count = Math.min(ring.stoneCount, 7);
      const stoneGeo = buildStoneGeometry(ring.stoneShape, ring.stoneSize);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        roughness: 0.0,
        metalness: 0.0,
        transparent: true,
        opacity: 0.82,
        envMapIntensity: 2.0,
      });

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        stone.position.set(
          Math.cos(angle) * r1,
          (ring.bandWidth / 10) * 0.5 + (ring.stoneSize / 20) * 0.5,
          Math.sin(angle) * r1
        );
        stone.castShadow = false;
        ringGroup.add(stone);
      }
    }
  }, [
    geoKey,
    ring.material, ring.finish,
    ring.stoneSetting, ring.stoneSize, ring.stoneCount, ring.stoneShape,
  ]);

  return (
    <div className="w-full h-full relative min-h-[420px]">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: "none" }}
      />
      {/* Overlay info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
        <span className="text-[10px] tracking-widest font-mono text-foreground/30 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
          drag · scroll · pinch
        </span>
      </div>
    </div>
  );
}