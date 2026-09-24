# techstack

## frontend

- react 18 with vite as the bundler. picked over heavier frameworks because the app is a single-page experience and we wanted fast cold starts.
- typescript config but most page files are .jsx. the original export was javascript and the conversion cost was not worth the churn for a first pass.
- tailwind css for styling with a custom token palette (paper, ink, herald, olive, horizon, etc). all tokens live in index.css and tailwind.config.js so component code stays semantic.
- shadcn/ui primitives sitting on radix. customised lightly to match the lowercase, serif-heavy aesthetic.
- framer motion for the few transitions we have (multi-step forms, modals).
- three.js for the artifact model viewer.
- react query for all server state. component-local useState only for ui state.
- react router 6 for routing. routes are flat and declared in App.jsx.

## backend

- the project runs on lovable cloud, which is a managed supabase. the same code points at any standalone supabase project unchanged.
- postgres for storage with row-level security on every table.
- supabase auth for buyer accounts. store accounts use a separate access-key system (sha256 hash on disk).
- supabase storage for artifact images, 3d models, store branding.
- two edge functions: place-order (canonical order creation with server-side price snapshot) and store-update (validates the access key before mutating market_accounts).

## why this shape

the data model is small (four tables) and the access patterns are predictable. a relational database with rls is enough; we did not need a full custom api layer.

we keep all backend access behind a thin facade in src/lib/db.js. it exposes the same surface the app was originally written against (db.entities.X.{filter, list, create, update, delete}) so swapping backends later means rewriting a single file. that is how the project stays portable.
