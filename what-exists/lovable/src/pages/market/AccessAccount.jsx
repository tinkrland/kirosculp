import { db } from '@/lib/db';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { hashKey } from "@/lib/crypto";
import { LogIn } from "lucide-react";

export default function AccessAccount() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [key, setKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAccess = async () => {
    if (!handle || !key) { toast.error("enter your handle and key"); return; }

    setIsVerifying(true);

    const accounts = await db.entities.MarketAccount.filter({ handle });
    const account = accounts?.[0];

    if (!account) {
      toast.error("account not found");
      setIsVerifying(false);
      return;
    }

    const keyHash = await hashKey(key);

    if (keyHash !== account.access_key_hash) {
      toast.error("incorrect key");
      setIsVerifying(false);
      return;
    }

    // key is valid - navigate with credentials in url params (session-only, not stored)
    navigate(`/store/dashboard?handle=${handle}&key=${key}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="font-wordmark text-lg text-muted-foreground/40 mb-12 text-center">sculptura</p>

        <div className="space-y-7">
          <div>
            <h1 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">access your account</h1>
            <p className="text-sm text-muted-foreground tracking-wide font-light">enter your handle and access key</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">handle</Label>
              <Input
                placeholder="yourname"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">access key</Label>
              <Input
                type="password"
                placeholder="xxxxxxxx-xxxxxxxx-xxxxxxxx"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="rounded-xl bg-card border-border/60 text-sm tracking-wide font-mono"
              />
            </div>
          </div>

          <Button
            onClick={handleAccess}
            disabled={isVerifying}
            className="w-full rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isVerifying ? "verifying..." : "access dashboard"}
          </Button>

          <p className="text-center text-xs text-muted-foreground/40 tracking-wide">
            no account yet?{" "}
            <Link to="/store/create" className="underline underline-offset-2 hover:text-foreground transition-colors">
              create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}