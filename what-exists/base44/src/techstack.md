# tech stack

the technologies sculptura is built with, and why.

---

## frontend

**react 18**
chosen for its component model and the maturity of its ecosystem. the app is entirely client-rendered, which keeps infrastructure simple and avoids server complexity for a product at this scale.

**vite**
fast development builds and a clean module system. no configuration overhead.

**jsx**
the codebase uses jsx rather than tsx. type safety is enforced through naming discipline, predictable data shapes, and the data layer abstraction in src/api/.

**tailwind css**
utility-first css keeps styling co-located with markup. the design system is defined through css variables in `index.css` and mapped through `tailwind.config.js`, so all visual tokens are centralized and consistent.

**framer motion**
used for page transitions and step animations in multi-step forms. kept minimal to avoid performance cost.

**react-router-dom**
standard client-side routing. the route structure is defined once in `src/App.jsx`.

**tanstack react-query**
handles all data fetching, caching, and mutation state. query keys are intentional and predictable. every mutation invalidates only the keys that need refreshing.

**three.js**
used for two distinct purposes: the 3d model viewer on artifact detail pages (renders .glb files), and the parametric jewelry design studio, which builds geometry procedurally from user-controlled parameters.

**lucide react**
a consistent, minimal icon set. all icons in the product come from this library.

---

## backend

a hosted backend-as-a-service provides a database, authentication, file storage, and integrations. chosen for the speed of building without managing infrastructure.

tradeoff: all backend dependencies are isolated in `src/api/db.js`, `src/api/storage.js`, and `src/api/auth.js`. migrating to a different backend (e.g. supabase) means replacing those three files only. no page or component needs to change. portsb.md documents the full migration path.

---

## data layer design

all database and storage calls go through named, descriptive functions in `src/api/`. the application code never calls the sdk directly. this is an intentional separation: if the backend changes, the surface area of the change is bounded to three files, and all application logic stays the same.

---

## fonts

**bricolage grotesque** - primary body and ui font. wide tracking, editorial feel, designed for display use.

**tiempos** (self-hosted) - serif display font for headings and key labels. used to give the product a print-quality editorial tone.

**dm mono** - monospace font for labels, specs, and code-adjacent ui.

**caveat** - handwritten font used for the wordmark only.

---

## studio architecture

the design studio (/build, /templates, /styles, etc.) runs entirely on localstorage and three.js. it has zero dependency on the backend. the active design state is managed in `src/lib/studioStore.js` and deep-merged against default schemas on load to handle schema evolution gracefully.

---

## security model for market accounts

market accounts use a sha256 key instead of a full authentication system. the key is generated client-side using the web crypto api, shown once to the user, and stored as a hash. verification happens client-side by hashing the provided key and comparing it to the stored hash.

tradeoff: this removes the need for an email/password system but means lost keys cannot be recovered. this is an intentional constraint to keep the account system lightweight. see portsb.md for how to upgrade this to server-side verification with supabase edge functions.