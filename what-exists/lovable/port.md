# running sculptura locally

## prerequisites

- node.js 18 or higher
- pnpm, npm, or bun
- a supabase project (you can use lovable cloud, which provisions one for you, or a standalone supabase project)

## installation

```
git clone <your-repo-url>
cd sculptura
npm install
```

## environment setup

create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

these come from your supabase project settings (api section). when running on lovable cloud the file is created and refreshed automatically, do not edit it by hand.

## starting the development server

```
npm run dev
```

the app will be available at http://localhost:8080

## building for production

```
npm run build
```

the output goes to `dist/`. it is a standard vite build and can be served by any static host (vercel, netlify, cloudflare pages, fly, s3 + cloudfront).

## deploying

frontend examples:

```
npx vercel deploy --prod
npx netlify deploy --prod --dir=dist
```

the backend (database, auth, storage, edge functions) is hosted separately. see portsb.md for how to set up a standalone supabase project from scratch.
