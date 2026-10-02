import { Link, useNavigate } from "react-router-dom";
import { Search, User, Moon, Sun, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import CurrencySwitcher from "@/components/layout/CurrencySwitcher";
import { getWishlist } from "@/lib/wishlistStore";
import { useAuth } from "@/lib/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [wishCount, setWishCount] = useState(() => getWishlist().length);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const syncWish = () => setWishCount(getWishlist().length);
    window.addEventListener("wishlist-updated", syncWish);
    return () => {
      window.removeEventListener("wishlist-updated", syncWish);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-baseline gap-0.5">
          <span className="font-wordmark text-2xl md:text-3xl text-foreground">sculptura</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <Input
              placeholder="search artifacts, creators, materials"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-full bg-secondary/70 border-border/50 text-sm tracking-wide placeholder:text-muted-foreground/50 focus:bg-card"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/faq" className="hidden sm:inline-flex">
            <Button variant="ghost" className="text-sm tracking-wide rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary">
              faq
            </Button>
          </Link>

          {/* display currency */}
          <CurrencySwitcher />

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border/60 bg-secondary/60 hover:bg-secondary transition-colors"
            aria-label="toggle dark mode"
          >
            {dark ? <Sun className="w-3.5 h-3.5 text-pancake" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>

          {/* Wishlist button */}
          <Link
            to={isAuthenticated ? "/dashboard/buyer" : "/demo/buyer"}
            className="relative w-8 h-8 flex items-center justify-center rounded-full border border-border/60 bg-secondary/60 hover:bg-secondary transition-colors"
            aria-label="wishlist"
          >
            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-mono flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>

          <Link to={isAuthenticated ? "/dashboard/buyer" : "/store/access"}>
            <Button variant="outline" className="rounded-full text-sm tracking-wide border-border/80 gap-2">
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAuthenticated ? "my account" : "dashboard"}</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
