# roster atlas

a tiny rose-tinted leaflet atlas of the [kirosculp demo roster](https://github.com/tinkrland/kirosculp/blob/bfeb8264b6eb18dd7cce1a8e0a3cc2f3aacb6c5b/platform/creators/fixtures/demo-roster-accounts.json).

map chrome and the dusty-rose theme are ported from [fabnet](https://github.com/kqrla/fabnet-23b01e15) (tile tinting, pin shape, tooltips) and [wandery](https://github.com/kqrla/wandery) (area toggles, atlas layout, quiet labels).

## how it works

- react + vite + typescript. zero base44 sdk dependencies.
- leaflet 1.9.4 loads from the unpkg CDN at runtime (no npm leaflet dep).
- tiles: carto voyager nolabels, tinted dusty-rose with a css `hue-rotate(298deg)` filter on the tile pane.
- pins: teardrop svg markers — cherry rose for artists, thistle for buyers. coordinates assigned from each account's `residence_note`; the 7 accounts with `region: "tbd"` have no residence captured, so they carry no pin.
- areas: world (default), north america, europe, west asia / mena, latam, south asia, asia pacific, southeast asia, africa. selecting one flies the map over and shows only that area's pins. counts per area sit in the left rail.
- roster `asia` accounts split into southeast asia (singapore, baguio, jatinangor) and asia pacific (suwon, seoul + the oceania accounts).

## carto api key

CARTO requires an api key for basemaps now. copy `.env.example` to `.env` and
put your key in it — the map reads it at build/dev time via `VITE_CARTO_API_KEY`:

    cp .env.example .env
    # then edit .env
    VITE_CARTO_API_KEY=yourcartokey

`.env` is gitignored, the key never lands in the repo.

## run

    npm install
    npm run dev
