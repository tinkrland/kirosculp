# running sculptura locally

this guide covers how to run sculptura on your local machine.

---

## prerequisites

- node.js 18 or higher
- npm or pnpm
- a backend project (see portsb.md for supabase migration, or use the existing hosted backend)

---

## installation

```bash
git clone <your-repo-url>
cd sculptura
npm install
```

---

## environment setup

create a `.env` file in the root of the project. the following variables are required:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://api.base44.com
```

if you are migrating to supabase, see portsb.md for the alternative environment variables and how to update `src/api/db.js`, `src/api/storage.js`, and `src/api/auth.js` to point at supabase instead.

---

## starting the development server

```bash
npm run dev
```

the app will be available at `http://localhost:5173`.

the studio pages (/build, /templates, /styles, /presets, /materials, /print, /code) run entirely on localstorage and three.js. they work without a backend connection.

---

## building for production

```bash
npm run build
```

the output goes to `dist/`. this is a standard vite build and can be deployed to any static hosting provider: vercel, netlify, cloudflare pages, or any cdn that serves static files.

---

## deploying

the built `dist/` folder can be served by any cdn or static host.

for vercel:

```bash
npx vercel deploy --prod
```

for netlify:

```bash
npx netlify deploy --prod --dir=dist
```

note: the backend (auth, database, storage) is hosted separately. deploying the frontend does not deploy the backend. see portsb.md for how to host the backend on supabase.