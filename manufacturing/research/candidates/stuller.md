# stuller

status: drafted

## finding

stuller operates an investment/lost-wax casting process for precious metal jewelry using wax patterns, with detailed production standards specifying minimum wall thicknesses and feature sizes. they accept 3dm and stl files with stones included or specified. stuller offers stone setting services and supports customer-provided stones. they provide a public rest api for product data, orders, and status, though endpoints for file upload or instant quoting are not documented.

## conditions and caveats

- minimum wall thickness of 0.5mm is specified for casting; pilot holes as small as 0.15mm are used but may not represent minimum feature size for all features.
- api documentation does not explicitly confirm authentication type or support for file upload or instant quoting via api.
- no explicit maximum part size or tolerance data found.
- regions served are not specified in the sources.

## sources

- [stuller production standards preferred file types](http://stuller.scene7.com/is/content/Stuller/DAS/09b4e2e2-e12e-45f8-a2ed-a4f80104aa9f.pdf): specifies minimum wall thicknesses (0.5mm), minimum feature sizes (0.15mm pilot holes), file formats accepted (3dm, stl), and stone setting design guidelines. (retrieved 2026-09-22)
- [casting | stuller](https://www.stuller.com/video/watch/53943): describes lost-wax casting process using wax patterns, investment plaster, burnout, and casting in precious metals. (retrieved 2026-09-22)
- [api documentation and examples - stuller's api service | stuller](https://www.stuller.com/services/e-commerce-business/api-documentation): documents rest api endpoints for product data, orders, and status; supports order transmission and status checking. (retrieved 2026-09-22)
- [stuller web api help page](https://api.stuller.com/help): confirms product, gem, order, and invoice apis with real-time pricing and customization capabilities. (retrieved 2026-09-22)

## how this enters the engine

stuller is confirmed to offer precious metal lost-wax casting jewelry manufacturing with detailed design standards and a public api for product and order management.
