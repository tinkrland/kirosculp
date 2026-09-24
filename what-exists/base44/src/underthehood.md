# under the hood

how sculptura is structured internally, and why.

---

## architecture overview

sculptura is a single-page react application with a backend-as-a-service for data, auth, and storage. the frontend is built with vite and deployed as a static bundle. all backend logic runs on hosted infrastructure.

the codebase is organized by feature domain, not by file type. components that belong to a specific part of the product live together.

```
src/
  pages/                  top-level route components
  components/
    artifacts/            cards, grids, material tags
    canvas/               three.js viewport and studio controls
    creator/              creator profile sidebar
    home/                 landing page sections
    layout/               app shell (header, layout wrapper)
    market/               market account dashboard and settings
    studio/               studio navigation bar
    viewer/               three.js 3d model viewer for artifact pages
  api/
    base44Client.js       sdk initialization (platform-managed)
    db.js                 all database reads and writes
    storage.js            all file uploads
    auth.js               all authentication calls
  lib/                    shared utilities, auth context, pricing logic
base44/
  entities/               json schemas that define database shape
```

---

## data access layer

all database and storage calls go through `src/api/db.js`, `src/api/storage.js`, and `src/api/auth.js`. no page or component imports from the sdk directly.

this means the entire data layer can be migrated to a different backend by changing those three files. see portsb.md for the full migration path.

---

## data flow

1. the user loads the app. `AuthContext` checks whether a token exists and whether the user is registered.
2. on authenticated routes, components query data using react-query and the functions in `src/api/db.js`.
3. mutations go through react-query's `useMutation`, which calls db.js and invalidates relevant query keys on success.
4. file uploads call `uploadFile()` from `src/api/storage.js`, which returns a public url stored as a string on the entity.

---

## key abstractions

**data layer** - `src/api/db.js` exports named objects (Artifacts, Orders, MarketAccounts, CreatorProfiles) with descriptive method names. this is the only place the underlying sdk is called for data operations.

**auth layer** - `src/api/auth.js` wraps auth operations. the rest of the app calls these functions, not sdk auth methods directly.

**entities** are json schemas that define the shape of persisted data. they are defined in `base44/entities/*.jsonc`.

**pricing logic** is centralized in `lib/pricing.js`. manufacturing costs, regional multipliers, and final price calculations all live there. components consume this, they do not recalculate prices themselves.

**studio store** - `lib/studioStore.js` is a localstorage-backed store for the active jewelry design, shared across all studio pages. it uses deep-merging to safely handle legacy stored states when the schema evolves.

**market account auth** uses a sha256 key instead of a login system. when a market account is created, a random key is generated, shown once, and its hash is stored. to access their account, the owner provides the key. the frontend hashes it client-side and compares against the stored hash.

**review flow** is a manual process. when a creator submits their account, it moves from `draft` to `pending_review`. an admin reviews it and moves it to `active` or `rejected`.

---

## why things are organized this way

the data layer abstraction (db.js, storage.js, auth.js) exists to decouple application logic from the hosting platform. the goal is that migrating backends should not require touching any page or component.

the sha256 key system avoids requiring a full auth system for market accounts, which lowers friction for creators who just want to ship. the tradeoff is that if they lose their key, they lose access.

pricing is not user-configurable per region by default. regional costs are defined in `lib/pricing.js` because the manufacturing partner sets those rates. creators only control their own earnings markup.

the studio pages (/build, /templates, /styles, etc.) have zero dependency on the backend. they run entirely on localstorage and three.js. this keeps them fast, offline-capable, and easy to test in isolation.