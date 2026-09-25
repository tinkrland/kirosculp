# candidate research: design build cast london (design-build-cast)

## finding
design build cast london (dbc) passes step 0 verification (`supports_precious_metal_lost_wax_casting: true`). based in london's hatton garden jewelry district, dbc provides 3d cad model printing and lost-wax casting in all major precious metals (sterling silver, gold [9k, 14k, 18k, 22k], platinum, palladium, bronze, brass).

dbc features an automated web-based "instant quote" tool (`quote_method: instant_api`, `self_serve: true`) powered by a specialized 3dprint plugin system. the tool accepts stl (binary/ascii) and obj files up to 40mb, automatically repairing mesh geometry, evaluating part volume, and calculating instant price estimates across precious metal choices.

## conditions and caveats
- **no developer rest api**: quoting tool runs in-browser via web plugin; no public headless api documented (`has_public_api: false`).
- **file upload limits**: maximum file size of 40mb; files over 40mb require manual direct contact.
- **currency & region**: quoted in gbp; serves uk, european, and international clients.

## sources
1. design build cast instant quote portal, https://designbuildcast.co.uk/instant-quote/
   retrieved: 2026-09-11. verified automated 3d file analysis (stl, obj, max 40mb), instant precious metal casting quote calculator, supported alloys, and mesh repair features.

## how this enters the engine
recorded in `manufacturer-capabilities.json` with `supports_precious_metal_lost_wax_casting: true` and `quote_method: instant_api`. serves as an instant-quoting UK/European precious metal casting partner in sculptura's routing database.
