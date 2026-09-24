// /demo/buyer
//
// non-authenticated demo of the buyer experience. uses the same view
// component as the real dashboard but feeds it deterministic mock data
// so anyone can see what tracking looks like without buying anything.

import BuyerDashboard from "./BuyerDashboard";

const MOCK_ORDERS = [
  {
    id: "demo-1",
    artifact_name: "obsidian vase",
    artifact_image_url: "https://images.unsplash.com/photo-1578910743669-91ec7d9b7e7e?w=400",
    creator_handle: "kanazawa",
    material: "matte black resin",
    price: 220,
    status: "in_production",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "demo-2",
    artifact_name: "sakura lamp",
    artifact_image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400",
    creator_handle: "yumikawa",
    material: "translucent pla",
    price: 95,
    status: "shipped",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "demo-3",
    artifact_name: "stone bookend pair",
    artifact_image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400",
    creator_handle: "northforge",
    material: "marble composite",
    price: 140,
    status: "delivered",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

const MOCK_WISHLIST = [
  { artifactId: "w1", artifactName: "minimalist planter", artifactImage: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400", creatorHandle: "kanazawa" },
  { artifactId: "w2", artifactName: "geometric clock", artifactImage: "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=400", creatorHandle: "northforge" },
];

export default function DemoBuyer() {
  return (
    <BuyerDashboard
      demo
      demoOrders={MOCK_ORDERS}
      demoWishlist={MOCK_WISHLIST}
      demoSimilar={[]}
      demoStores={[
        { handle: "kanazawa", display_name: "kanazawa studio", avatar_url: null },
        { handle: "yumikawa", display_name: "yumikawa", avatar_url: null },
        { handle: "northforge", display_name: "northforge", avatar_url: null },
      ]}
    />
  );
}
