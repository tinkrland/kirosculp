# security leg

this leg contains the vulnerabilities found in the source audit before any other leg builds on that database. the findings and required repairs are tracked in [audit/security.md](../../audit/security.md); this page is the build sequence.

## steps

1. **remove the client admin password:** the admin layout in the offering snapshot gates the admin ui with a universal plaintext password in client code. delete it; admin access becomes authenticated, named, role-checked on the server.
2. **correct permissive row policies cumulatively:** the `admin_ideas`, commission request, and initial role/market-account/order policies get restrictive corrective migrations. corrections are additive; policy history stays legible.
3. **prove cross-role denial:** a test matrix of guest, creator, buyer, and admin attempting each private read and write. a fix without a denial test is not done.
4. **lock the edge functions:** publish-artifact and place-order stop trusting client-supplied financial values; ownership, idempotency, and field allowlists added.
5. **credential hygiene:** the snapshot environment files stay out of the published repo (their contents and hashes are withheld in the source ledger), and no secret ever lands in markdown, code comments, or the tracker.

## waiting on

nothing. this leg runs first.

## hands over

a database the [platform](../platform/README.md) and [operations](../operations/README.md) legs can safely build on.
