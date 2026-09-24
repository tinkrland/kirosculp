/**
 * Simple localStorage-backed store for the active jewelry design,
 * shared across all studio pages (/build, /templates, /styles, /presets, /materials).
 */
import { DEFAULT_JEWELRY } from "@/lib/jewelryDefaults";

const KEY = "sculptura_studio_design";

export function loadDesign() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_JEWELRY);
    const saved = JSON.parse(raw);
    // Deep-merge: top-level primitives from saved, nested objects merged with defaults
    const merged = { ...DEFAULT_JEWELRY };
    for (const key of Object.keys(DEFAULT_JEWELRY)) {
      if (saved[key] !== undefined) {
        if (typeof DEFAULT_JEWELRY[key] === "object" && DEFAULT_JEWELRY[key] !== null && !Array.isArray(DEFAULT_JEWELRY[key])) {
          merged[key] = { ...DEFAULT_JEWELRY[key], ...saved[key] };
        } else {
          merged[key] = saved[key];
        }
      }
    }
    return merged;
  } catch {
    return structuredClone(DEFAULT_JEWELRY);
  }
}

export function saveDesign(design) {
  try {
    localStorage.setItem(KEY, JSON.stringify(design));
    window.dispatchEvent(new CustomEvent("studio:design-updated", { detail: design }));
  } catch {}
}

export function useStudioDesign(useState, useEffect) {
  const [jewelry, setJewelry] = useState(() => loadDesign());

  const set = (key, val) => {
    setJewelry((j) => {
      const next = { ...j, [key]: val };
      saveDesign(next);
      return next;
    });
  };

  const setNested = (section, key, val) => {
    setJewelry((j) => {
      const sectionDefault = DEFAULT_JEWELRY[section] ?? {};
      const next = { ...j, [section]: { ...sectionDefault, ...(j[section] ?? {}), [key]: val } };
      saveDesign(next);
      return next;
    });
  };

  const applyFull = (config) => {
    setJewelry((j) => {
      const next = { ...DEFAULT_JEWELRY, ...config, segments: j.segments };
      saveDesign(next);
      return next;
    });
  };

  // Sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === KEY) setJewelry({ ...DEFAULT_JEWELRY, ...JSON.parse(e.newValue || "{}") });
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return { jewelry, set, setNested, applyFull };
}