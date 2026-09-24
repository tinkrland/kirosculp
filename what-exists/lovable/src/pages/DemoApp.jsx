// /demo/app - try-it-out sandbox entry point.
//
// sculptura is public-storefront-first, so the demo lands the visitor
// on a real-looking mock storefront (kaiform) instead of dropping them
// straight into a creator dashboard. they can browse the store, view
// artifacts, and try the commission flow exactly like a real visitor
// would. the dashboard is still reachable via /demo/dashboard for
// creators who want to see the back-office side.
import { Navigate } from "react-router-dom";
export default function DemoApp() {
  return <Navigate to="/shop/kaiform" replace />;
}
