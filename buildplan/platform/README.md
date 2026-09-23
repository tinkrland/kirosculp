# platform leg

this leg reworks the offering app so every listing and order binds to a design release instead of client-supplied claims. the source audit found publishing that accepts browser-provided costs and prices, and an unpaid checkout: both must go.

## steps

1. **release-bound publishing:** publish-artifact consumes a verified release id, version, and asset hash. no creator-entered manufacturing costs, earnings, or prices.
2. **listing model:** a listing references exactly one release version; offered metals, sizes, and finishes come from the release's validated variants plus the [offerings taxonomy](../../offerings/README.md) for presentation.
3. **checkout intake:** checkout assembles a release-bound purchase request (release id, variant, quantity, destination) for the [operations leg](../operations/README.md) to price and confirm. the client sends no amounts.
4. **two-way pricing surface:** the creator fixes net earnings or retail price; operations computes the other. the platform renders the result, it never computes it.
5. **commerce code separation:** move the storefront, cart, and marketplace code that currently lives inside the studio snapshot over to the platform side, then remove the studio's commerce dependencies.
6. **commission surfaces stay muted** until the authenticated, escrowed lifecycle exists; the existing muted shell stays.

## waiting on

the first design releases from the [studio leg](../studio/README.md), and the security containment before buyer-facing flows build on the current database.

## hands over

release-bound purchase requests to [operations](../operations/README.md).
