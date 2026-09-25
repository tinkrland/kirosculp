# candidate research: apex jewelry casting (apex-jewelry-casting)

## finding
apex jewelry casting passes step 0 verification (`supports_precious_metal_lost_wax_casting: true`). they are a dedicated us precious-metals jewelry casting bureau that offers end-to-end 3d resin printing, wax burnout, and lost-wax casting in 10k-21k gold (yellow, white, rose), sterling silver, platinum, palladium, and copper.

apex features a web-based instant drag-and-drop cad quoter on their website (`quote_method: instant_api`, `self_serve: true`). users can drag stl or obj files into the browser tool, which automatically calculates part volume and alloy density to yield real-time pricing without requiring an upfront sales conversation or account creation. they also offer rapid next-day casting turnaround for orders submitted before 10:30 am.

## conditions and caveats
- **self-serve web quoter, no public rest api**: while the web interface provides instant programmatic pricing via browser file parsing, there is no public developer rest api or api key documentation published (`has_public_api: false`).
- **turnaround**: exceptional speed: next-day casting available for orders placed by 10:30 am.
- **file acceptance**: accepts stl, obj, rhino, and matrix 3d files.
- **data security**: files encrypted and automatically deleted after casting.

## sources
1. apex jewelry casting homepage & instant quoter, https://apexjewelrycasting.com
   retrieved: 2026-09-11. verified 3d print to lost wax casting process, precious metals available (10k-21k gold, silver, platinum, palladium), drag-and-drop real-time pricing tool, next-day turnaround, and supported file formats (stl, obj, 3dm).

## how this enters the engine
recorded in `manufacturer-capabilities.json` with `supports_precious_metal_lost_wax_casting: true`, `self_serve: true`, and `quote_method: instant_api`. serves as a high-speed us fulfillment option for automated web-assisted or browser-automation ordering.
