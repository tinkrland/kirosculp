// shared shell for every /admin/* route. handles a single universal
// password gate (sessionStorage flag) plus the left-rail navigation.
// per-admin profiles will replace the universal password later; see
// /admin/docs for the rationale.

import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Factory,
  Route as RouteIcon,
  Settings,
  BookOpen,
  Lightbulb,
  Lock,
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sculptura_admin_unlocked";
const ADMIN_PASSWORD = "Password";

const NAV = [
  { to: "/admin", label: "overview", icon: LayoutDashboard, end: true },
  { to: "/admin/review", label: "review queue", icon: Package },
  { to: "/admin/manufacturers", label: "manufacturers", icon: Factory },
  { to: "/admin/routing", label: "sales routing", icon: RouteIcon },
  { to: "/admin/idea", label: "idea notebook", icon: Lightbulb },
  { to: "/admin/settings", label: "platform settings", icon: Settings },
  { to: "/admin/docs", label: "admin docs", icon: BookOpen },
];

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onUnlock();
    } else {
      setError("incorrect password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 bg-card border border-border/50 rounded-[20px] p-8"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span className="text-xs tracking-widest uppercase">admin access</span>
        </div>
        <h1 className="font-serif text-2xl font-light lowercase">restricted area</h1>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          enter the universal admin password. multi-profile admin accounts are
          on the roadmap. see the admin docs once inside.
        </p>
        <Input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(""); }}
          placeholder="password"
          className="rounded-xl"
          autoFocus
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" className="w-full rounded-full">unlock</Button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
          back to site
        </Link>
      </form>
    </div>
  );
}

export default function AdminLayout({ children, title, subtitle }) {
  const [unlocked, setUnlocked] = useState(
    typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const { pathname } = useLocation();

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const handleLock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 shrink-0 border-r border-border/40 bg-card/30 hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-border/40">
          <Link to="/" className="font-wordmark text-xl text-foreground">sculptura</Link>
          <div className="text-[11px] tracking-widest uppercase text-muted-foreground/60 mt-1">admin</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs tracking-wider lowercase transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button
          onClick={handleLock}
          className="m-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs tracking-wider lowercase text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="w-3.5 h-3.5" />
          lock admin
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-2 overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-[11px] tracking-wider lowercase whitespace-nowrap px-3 py-1.5 rounded-full border ${
                  isActive ? "bg-foreground text-background border-foreground" : "border-border/60 text-muted-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </header>

        <div className="max-w-5xl mx-auto px-6 py-10">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
