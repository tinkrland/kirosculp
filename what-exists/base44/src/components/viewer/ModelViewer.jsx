import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// We load GLTFLoader dynamically to avoid SSR issues
let GLTFLoader = null;
let OrbitControls = null;

async function loadLoaders() {
  if (!GLTFLoader) {
    const gltf = await import("three/examples/jsm/loaders/GLTFLoader.js");
    GLTFLoader = gltf.GLTFLoader;
  }
  if (!OrbitControls) {
    const oc = await import("three/examples/jsm/controls/OrbitControls.js");
    OrbitControls = oc.OrbitControls;
  }
}

export default function ModelViewer({ modelUrl, imageUrl, className = "" }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameRef = useRef(null);
  const modelRef = useRef(null);
  const idleTimerRef = useRef(null);
  const isIdleRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!modelUrl || !canvasRef.current) return;
    let cancelled = false;

    async function init() {
      await loadLoaders();
      if (cancelled) return;

      const canvas = canvasRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f2ed);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.01, 100);
      camera.position.set(0, 0.8, 2.5);

      // Lights
      const ambient = new THREE.AmbientLight(0xfff8f0, 1.2);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(2, 4, 3);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.1;
      key.shadow.camera.far = 20;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xe8f0ff, 0.8);
      fill.position.set(-3, 2, -2);
      scene.add(fill);

      // Ground plane with shadow receiver
      const groundGeo = new THREE.CircleGeometry(2, 64);
      const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.001;
      ground.receiveShadow = true;
      scene.add(ground);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 0.5;
      controls.maxDistance = 8;
      controls.maxPolarAngle = Math.PI / 1.8;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controlsRef.current = controls;

      // Reset idle timer on interaction
      const resetIdle = () => {
        isIdleRef.current = false;
        controls.autoRotate = false;
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
          isIdleRef.current = true;
          controls.autoRotate = true;
        }, 3000);
      };
      renderer.domElement.addEventListener("pointerdown", resetIdle);
      renderer.domElement.addEventListener("wheel", resetIdle);

      // Load model
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          if (cancelled) return;
          const model = gltf.scene;

          // Center + scale model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.4 / maxDim;
          model.scale.setScalar(scale);
          model.position.sub(center.multiplyScalar(scale));

          // Sit on ground
          const box2 = new THREE.Box3().setFromObject(model);
          model.position.y -= box2.min.y;

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          scene.add(model);
          modelRef.current = model;
          setLoading(false);
        },
        undefined,
        () => {
          if (!cancelled) setError(true);
        }
      );

      // Render loop
      function animate() {
        animFrameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Resize
      const ro = new ResizeObserver(() => {
        if (!canvas) return;
        const nw = canvas.clientWidth;
        const nh = canvas.clientHeight;
        renderer.setSize(nw, nh, false);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      });
      ro.observe(canvas);

      return () => {
        ro.disconnect();
        renderer.domElement.removeEventListener("pointerdown", resetIdle);
        renderer.domElement.removeEventListener("wheel", resetIdle);
      };
    }

    init();

    return () => {
      cancelled = true;
      clearTimeout(idleTimerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      rendererRef.current?.dispose();
      controlsRef.current?.dispose();
    };
  }, [modelUrl]);

  // Fallback: show image
  if (!modelUrl) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-[24px] bg-[#f5f2ed] border border-border/50 shadow-paper-lg ${className}`}>
        {imageUrl ? (
          <img src={imageUrl} alt="artifact" className="w-full h-full object-contain p-8" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span className="text-xs tracking-wider">no model uploaded</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[24px] bg-[#f5f2ed] border border-border/50 shadow-paper-lg ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" style={{ touchAction: "none" }} />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}
      {error && imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={imageUrl} alt="artifact" className="w-full h-full object-contain p-8" />
        </div>
      )}
      {!loading && !error && (
        <div className="absolute bottom-3 right-3 text-[10px] tracking-wider text-muted-foreground/40 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full pointer-events-none">
          drag to rotate · scroll to zoom
        </div>
      )}
    </div>
  );
}