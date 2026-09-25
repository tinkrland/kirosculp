# policy inventory: every effective row policy, with a verdict

the security leg requires enumerating the cumulative policy state before correcting it. this is that inventory, built from every migration in the lovable snapshot. verdicts:

- **keep**: restrictive as written
- **corrected**: replaced by a foundation migration (linked)
- **monitor**: acceptable for now, with a recorded reason
- **replace in platform rebuild**: not safe to change in place without breaking the running storefront; scheduled to the platform leg

| table | policy (as shipped) | verdict | notes |
|---|---|---|---|
| profiles | read/update/insert own | keep | uid-scoped |
| user_roles | read own; admin manage | keep | has_role is security definer, no recursion |
| artifacts | public read published; owner insert/update | keep | published-only public surface |
| artifacts | owner update | monitor | no with-check on status transitions; tighten when review states exist |
| creator_profiles | owner insert/update | keep | uid-scoped |
| market_accounts | public read | corrected by [0001](../migrations/0001_admin_roles_and_market_account_privacy.sql) | replaced with public-safe view + admin-only table read |
| market_accounts | open update (legacy) | already dropped in snapshot 20260429122004 | verify cumulative state at deploy |
| market_accounts | admin read (0001) | keep | |
| collections | public read | keep | published storefront data |
| collections | owner manage by creator_profile | keep | handle ownership via uid |
| commission_requests | anon insert | corrected by [0002](../migrations/0002_commission_requests_identity.sql) | commissioners must be signed in |
| commission_requests | public read | corrected by [0002](../migrations/0002_commission_requests_identity.sql) | leaked names, emails, budgets, briefs |
| commission_requests | admin manage; owner update | keep | admin is role-gated; creator is handle-gated |
| orders | anyone insert | corrected by [0004](../migrations/0004_orders_purchase_path.sql) | guest purchases move to the idempotent server purchase operation |
| orders | read own or by email | corrected by [0004](../migrations/0004_orders_purchase_path.sql) | email equality is not ownership |
| creator_follows | owner read/insert/delete | keep | uid-scoped |
| creator_lists | owner all | keep | uid-scoped |
| creator_lists | unlisted public read | monitor | reads only `visibility = 'unlisted'` rows; harmless but semantically odd (public means unlisted here); revisit with the visibility model |
| creator_list_items | owner all; unlisted public read | monitor | same visibility question as creator_lists |
| creator_docs_notes | anyone insert | monitor | length-gated public intake with admin-only reads; add rate limiting with the abuse layer |
| creator_docs_notes | admins view | keep | |
| manufacturers | admin manage | keep | |
| platform_settings | admin manage | keep | verify field-level sensitivity when settings grow |
| admin_ideas | open read/insert/update/delete | corrected by [0003](../migrations/0003_admin_ideas_lockdown.sql) | was gated only by the client-side password |
| storage.objects | public read on artifacts, avatars, stores | replace in platform rebuild | avatars/stores are display assets; the artifacts bucket also holds model files. model files must move behind signed urls or a separate private bucket when the platform leg owns uploads. changing it in place breaks live storefront image urls |
| storage.objects | authenticated upload (3 buckets) | replace in platform rebuild | any signed-in user can upload to any bucket; object-path and ownership checks come with the platform upload paths |
| storage.objects | authenticated update own | keep | owner-scoped |
| (function) | grant execute has_role to anon, authenticated | monitor | lets anonymous callers probe whether a uuid is an admin; a role oracle. acceptable while no admin uuids are public; restrict when the abuse layer lands |

storage buckets shipped public: artifacts, avatars, stores.

this inventory is the pre-deployment review checklist: every **corrected** row must have its migration applied and its denial tests green before the security leg hands over, and every **replace in platform rebuild** row is a platform-leg task with the reason recorded here.
