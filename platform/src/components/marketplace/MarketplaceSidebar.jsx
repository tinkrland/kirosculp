import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BarChart2,
  Landmark,
  Settings,
  LogOut,
  Store,
  ShoppingBag,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";

export default function MarketplaceSidebar({ account, activeSection, onSectionChange, onSignOut }) {
  const navItems = [
    { label: "overview", path: "overview", icon: LayoutDashboard },
    { label: "releases", path: "releases", icon: Package },
    { label: "listings", path: "listings", icon: ShoppingBag },
    { label: "orders", path: "orders", icon: ShoppingBag },
    { label: "commissions", path: "commissions", icon: Users },
    { label: "analytics", path: "analytics", icon: BarChart2 },
    { label: "finance", path: "finance", icon: Landmark },
    { label: "creator page", path: "creator-page", icon: Star },
    { label: "storefront", path: "storefront", icon: Store },
    { label: "settings", path: "settings", icon: Settings },
  ];

  return (
    <aside className="w-[200px] flex-shrink-0 flex flex-col h-screen sticky top-0 bg-background border-r border-border/40 py-6">
      {/* brand */}
      <div className="px-5 mb-8">
        <Link to="/platform" className="block">
          <p className="font-wordmark text-xl text-foreground">sculptura</p>
          <p className="text-[10px] tracking-wider text-muted-foreground/40 lowercase mt-0.5">creator console</p>
        </Link>
      </div>

      {/* navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = activeSection === path;

          return (
            <button
              key={path}
              onClick={() => onSectionChange(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide lowercase transition-all ${
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* footer */}
      <div className="px-3 space-y-3 mt-auto">
        <div className="h-px bg-border/30" />

        {account && (
          <div className="px-3 py-2">
            <p className="text-[13px] font-medium tracking-wide text-foreground lowercase">
              {account.display_name || account.handle}
            </p>
            <p className="text-[11px] text-muted-foreground/50 tracking-wide">@{account.handle}</p>
          </div>
        )}

        <Link
          to="/studio"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide lowercase text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <Package className="w-3.5 h-3.5" />
          back to studio
        </Link>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide lowercase text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          sign out
        </button>
      </div>
    </aside>
  );
}