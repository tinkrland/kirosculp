# under the hood

## architecture

a single-page react app talking to a postgres + auth + storage backend through a thin facade. the facade is the only place that knows what the backend is. swap it and the rest of the codebase keeps working.

```
src/
  pages/                     route components
  pages/market/              store-side dashboard pages
  components/
    artifacts/               cards, grids, material tags, order modal
    cart/                    cart drawer
    creator/                 creator sidebar
    dashboard/               buyer-side dashboard widgets
    explore/                 store grid for the explore page
    home/                    hero + landing sections
    layout/                  header, app shell, grain overlay
    market/                  store dashboard widgets and sections
    viewer/                  three.js model viewer
    ui/                      shadcn primitives
  lib/
    db.js                    backend facade (the only file that imports supabase entities)
    AuthContext.jsx          react context wrapping supabase auth
    cartStore.js             localStorage-backed cart
    crypto.js                sha256 + access key generator (web crypto api)
    pricing.js               price calculation helpers
    demoData.js              fallback content shown when db is empty
    query-client.js          react-query config
  integrations/supabase/     auto-generated client + types
supabase/functions/
  place-order/               canonical order creation
  store-update/              market account writes after key verification
```

## data flow

1. the user lands on the app. AuthContext sets up a supabase auth listener and fetches the current session before rendering routes.
2. pages query data via react query. the queryFn calls into db.entities.X which forwards to supabase. response shapes match what the original code expected (arrays for filter/list, single object for get).
3. mutations also go through db.entities.X. for market accounts the facade routes to the store-update edge function so the access key gets verified server-side. for everything else it talks to postgres directly under rls.
4. orders never insert from the client directly. the cart is sent to the place-order edge function, which looks up each artifact under the service role, snapshots prices, and inserts orders attributed to the signed-in user.
5. file uploads call db.integrations.Core.UploadFile which puts the file in the artifacts bucket and returns a public url.

## key abstractions

- db facade: keeps the original entity api so pages did not need rewriting. translates "-created_date" sort tokens to "created_at" since that is the actual column.
- access-key auth for stores: stores never touch supabase auth. the creator copies a one-time random key, the system stores only the sha256 hash. dashboard requests pass the key in url params, the dashboard verifies it against the hash on first load and stashes it in sessionStorage so subsequent edge calls can re-verify.
- role checks: a separate user_roles table holds admin assignments. a security-definer has_role function lets rls policies check roles without recursive table reads. this avoids the classic "store roles on the user record and let users escalate themselves" trap.

## why these decisions

- the access-key flow exists because creators are not always the kind of person who wants yet another email + password account. it also keeps store ownership decoupled from a specific person, which matters for shared studios.
- order prices are snapshotted server-side because a custom cart payload is the most obvious place for someone to try paying $1 for a $1000 sculpture.
- the facade exists because base44 is going away and we want to be able to leave any backend later without touching ui code.
