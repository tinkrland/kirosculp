# Stuller

Status: drafted

## Finding

Stuller operates an investment/lost-wax casting process for precious metal jewelry using wax patterns, with detailed production standards specifying minimum wall thicknesses and feature sizes. They accept 3dm and STL files with stones included or specified. Stuller offers stone setting services and supports customer-provided stones. They provide a public REST API for product data, orders, and status, though endpoints for file upload or instant quoting are not documented.

## Conditions and caveats

- Minimum wall thickness of 0.5mm is specified for casting; pilot holes as small as 0.15mm are used but may not represent minimum feature size for all features.
- API documentation does not explicitly confirm authentication type or support for file upload or instant quoting via API.
- No explicit maximum part size or tolerance data found.
- Regions served are not specified in the sources.

## Sources

- [STULLER PRODUCTION STANDARDS Preferred File Types](http://stuller.scene7.com/is/content/Stuller/DAS/09b4e2e2-e12e-45f8-a2ed-a4f80104aa9f.pdf) — Specifies minimum wall thicknesses (0.5mm), minimum feature sizes (0.15mm pilot holes), file formats accepted (3dm, STL), and stone setting design guidelines. (retrieved 2026-09-22)
- [Casting | Stuller](https://www.stuller.com/video/watch/53943) — Describes lost-wax casting process using wax patterns, investment plaster, burnout, and casting in precious metals. (retrieved 2026-09-22)
- [API Documentation and Examples - Stuller's API Service | Stuller](https://www.stuller.com/services/e-commerce-business/api-documentation) — Documents REST API endpoints for product data, orders, and status; supports order transmission and status checking. (retrieved 2026-09-22)
- [Stuller Web API Help Page](https://api.stuller.com/help) — Confirms Product, Gem, Order, and Invoice APIs with real-time pricing and customization capabilities. (retrieved 2026-09-22)

## How this enters the engine

Stuller is confirmed to offer precious metal lost-wax casting jewelry manufacturing with detailed design standards and a public API for product and order management.
