# security leg

this leg contains the vulnerabilities found in the source audit before any other leg builds on that database. the findings and required repairs are tracked in [audit/security.md](../../audit/security.md); this page is the build sequence.

## steps

1. **remove the client admin password:** the admin layout in the offering snapshot gates the admin ui with a universal plaintext password in client code. delete it; admin access becomes authenticated, named, role-checked on the server.
2. **correct permissive row policies cumulatively:** done as drafts: [0001](../migrations/0001_admin_roles_and_market_account_privacy.sql) (market accounts), [0002](../migrations/0002_commission_requests_identity.sql) (commission requests), [0003](../migrations/0003_admin_ideas_lockdown.sql) (admin ideas), [0004](../migrations/0004_orders_purchase_path.sql) (orders). the full inventory with verdicts is [security/policy-inventory.md](../security/policy-inventory.md). corrections are additive; policy history stays legible.
3. **prove cross-role denial:** the matrix is drafted at [security/denial-test-matrix.md](../security/denial-test-matrix.md). a fix without a denial test is not done: no policy fix is marked verified until its cells pass with recorded evidence.
4. **lock the edge functions:** publish-artifact and place-order stop trusting client-supplied financial values; ownership, idempotency, and field allowlists added.
5. **credential hygiene:** the snapshot environment files stay out of the published repo (their contents and hashes are withheld in the source ledger), and no secret ever lands in markdown, code comments, or the tracker.

## waiting on

nothing. this leg runs first.

## hands over

a database the [platform](../platform/README.md) and [operations](../operations/README.md) legs can safely build on.
