// localStorage-backed sandbox for the no-login creator demo.
//
// every piece of state the demo "creator" can edit (store appearance,
// commission terms, custom intake questions, mock published artifacts,
// incoming commission requests) lives under one namespaced key so the
// whole experience can be wiped with a single button. nothing here ever
// reaches the database - this is purely a try-it-out surface.
//
// shape:
//   {
//     store: { display_name, bio, ... },
//     commission: { commission_open, commission_terms, ... },
//     artifacts: [ ... ],
//     requests: [ ... ],
//   }

const ROOT_KEY = "sculptura_demo_sandbox";
const DEMO_OVERRIDES_KEY_PREFIX = "sculptura_demo_overrides_";

function readRoot() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ROOT_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeRoot(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROOT_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("demo-sandbox-updated"));
}

export function getSandbox() {
  const root = readRoot();
  return {
    store: root.store || {
      display_name: "your demo store",
      handle: "demo-creator",
      bio: "this is a sandbox - try it without signing up.",
      avatar_url: "",
      accent_color: "#84A48B",
    },
    commission: root.commission || {
      commission_open: true,
      hourly_rate: 60,
      turnaround_time: "2-3 weeks",
      rush_available: false,
      commission_min_budget: 150,
      commission_intro: "i take on small batch commissions for considered objects.",
      commission_terms: "50% deposit to begin. one revision round included.",
      commission_allow_commercial: false,
      commission_allow_resell: false,
      commission_allow_modifications: true,
      commission_intake_questions: [
        { id: "q1", label: "preferred material?", required: true },
      ],
    },
    artifacts: root.artifacts || [],
    requests: root.requests || [],
  };
}

export function patchSandbox(slice, patch) {
  const root = readRoot();
  root[slice] = { ...(root[slice] || {}), ...patch };
  writeRoot(root);
  return root[slice];
}

export function clearSandbox() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ROOT_KEY);
  window.dispatchEvent(new Event("demo-sandbox-updated"));
}

// ---------- demo store overrides (kaiform / orbitobjects / voidcraft) ----------
//
// when a visitor lands on /shop/<demo-handle>/commission we also let
// them play with that fictional creator's commission terms locally so
// the form has something to react to. these overrides shadow the
// hardcoded values in demoData.js, but only in the visitor's browser.

export function getDemoStoreOverrides(handle) {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(DEMO_OVERRIDES_KEY_PREFIX + handle) || "null");
  } catch {
    return null;
  }
}

export function setDemoStoreOverrides(handle, patch) {
  if (typeof window === "undefined") return;
  const current = getDemoStoreOverrides(handle) || {};
  const next = { ...current, ...patch };
  localStorage.setItem(DEMO_OVERRIDES_KEY_PREFIX + handle, JSON.stringify(next));
  window.dispatchEvent(new Event("demo-sandbox-updated"));
  return next;
}

// commission requests sent to a demo creator live in localStorage so
// the visitor can see them appear in the demo dashboard immediately.
export function saveDemoCommissionRequest(handle, payload) {
  const root = readRoot();
  root.requests = root.requests || [];
  root.requests.unshift({
    id: crypto.randomUUID(),
    creator_handle: handle,
    created_at: new Date().toISOString(),
    status: "new",
    ...payload,
  });
  writeRoot(root);
}

export function getDemoRequestsForHandle(handle) {
  return getSandbox().requests.filter((r) => r.creator_handle === handle);
}

export function deleteDemoRequest(id) {
  const root = readRoot();
  root.requests = (root.requests || []).filter((r) => r.id !== id);
  writeRoot(root);
}
