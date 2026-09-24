// lightweight header used on the buyer dashboard + demo buyer surfaces.
// these views live outside AppLayout (they are standalone routes) so they
// need their own wordmark + profile dropdown rather than borrowing the
// full marketplace header.

import { Link, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function BuyerHeader({ demo = false }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-1">
          <span className="font-wordmark text-2xl text-foreground">sculptura</span>
          {demo && (
            <span className="text-[10px] tracking-widest uppercase text-amber-600 ml-2">
              demo
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="open profile menu"
            className="w-9 h-9 rounded-full bg-secondary border border-border/50 flex items-center justify-center hover:bg-secondary/70 transition"
          >
            <User className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs tracking-wide lowercase">
              {demo
                ? "demo buyer"
                : isAuthenticated
                ? user?.email || "your account"
                : "guest"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/buyer")} className="text-xs lowercase">
              <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
              dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/explore")} className="text-xs lowercase">
              <ShoppingBag className="w-3.5 h-3.5 mr-2" />
              explore artifacts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/buyer?tab=settings")} className="text-xs lowercase">
              <Settings className="w-3.5 h-3.5 mr-2" />
              account settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isAuthenticated && !demo ? (
              <DropdownMenuItem onClick={handleSignOut} className="text-xs lowercase text-destructive focus:text-destructive">
                <LogOut className="w-3.5 h-3.5 mr-2" />
                sign out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => navigate("/auth")} className="text-xs lowercase">
                <User className="w-3.5 h-3.5 mr-2" />
                sign in
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
