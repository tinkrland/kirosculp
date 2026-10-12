# apecs

status: drafted

## finding

apecs (australia) provides investment castings for jewellery, a cad service,
an alloy casting calendar (e.g. scheduled 14ct green gold casting days), and a
component/catalogue business with settings search by stone size. it operates
as a trade casting house for the au jewellery industry.

## conditions and caveats

- alloy availability is schedule-driven (casting days), which matters for
  per-order routing: a route enabled for green gold is not always available.
  scheduling constraints must enter the route predicates.
- no public api evidence; manual trade workflow.

## sources

- [apecs investment castings](http://apecs.com.au/): casting services, cad service, alloy calendar, catalogue. (retrieved 2026-10-12)

## how this enters the engine

au market casting-house candidate; the alloy-schedule model is a new
route-predicate input type (temporal availability), not seen in other
candidates.
