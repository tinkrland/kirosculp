import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Package, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoney } from "@/lib/formatMoney";

export default function OrderModal({ release, variant, size, onClose }) {
  const [step, setStep] = useState("form"); // "form" | "success"
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [serverPrice, setServerPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Fetch server-side pricing when modal opens
  useEffect(() => {
    if (release && variant) {
      fetchPricing();
    }
  }, [release, variant, size]);

  const fetchPricing = async () => {
    setLoadingPrice(true);
    try {
      const response = await fetch('/api/pricing/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId: release.id,
          variant,
          size: size || null,
          quantity: 1
        })
      });
      
      if (response.ok) {
        const { price_cents } = await response.json();
        setServerPrice(price_cents); // Store in cents
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  const orderMutation = useMutation({
    mutationFn: async () => {
      // Create release-bound purchase request
      const purchaseRequest = {
        releaseId: release.id,
        variant,
        size: size || null,
        quantity: 1,
        destination: {
          name: form.name,
          email: form.email,
          address: form.address,
        }
        // No client-sent amounts - server computes all pricing
      };

      const response = await fetch('/api/orders/create-purchase-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseRequest })
      });

      if (!response.ok) {
        throw new Error('Failed to create purchase request');
      }

      return response.json();
    },
    onSuccess: () => {
      setStep("success");
    },
    onError: (error) => {
      console.error('Order submission failed:', error);
      toast.error("failed to submit purchase request. please try again.");
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.address.trim()) {
      toast.error("please fill in all fields");
      return;
    }
    orderMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="relative w-full max-w-md bg-card rounded-[24px] border border-border/50 shadow-xl overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/30">
          <div>
            <h2 className="text-base font-light tracking-wide lowercase text-foreground">place order</h2>
            <p className="text-xs text-muted-foreground/60 tracking-wide mt-0.5">
              release {release?.id?.substring(0, 8)}... · {variant}{size ? ` · size ${size}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* price summary */}
                <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-[14px]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground/50" />
                    <span className="text-xs tracking-wide text-muted-foreground">
                      {variant}{size ? ` · size ${size}` : ""}, made to order
                    </span>
                  </div>
                  <span className="text-base font-light tracking-wide text-foreground">
                    {loadingPrice ? (
                      <span className="text-muted-foreground/40">calculating...</span>
                    ) : serverPrice ? (
                      formatMoney(serverPrice)
                    ) : (
                      <span className="text-muted-foreground/40">price tbd</span>
                    )}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">full name</Label>
                    <Input
                      placeholder="your name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="rounded-xl bg-background border-border/60 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="rounded-xl bg-background border-border/60 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">shipping address</Label>
                    <Textarea
                      placeholder="street, city, postal code, country..."
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className="rounded-xl bg-background border-border/60 text-sm min-h-[70px]"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-amber-700/80 tracking-wide leading-relaxed">
                    this creates a release-bound purchase request for operations to price and route. 
                    final pricing and payment are handled after manufacturing verification.
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={orderMutation.isPending}
                  className="w-full rounded-full py-5 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90"
                >
                  {orderMutation.isPending ? "submitting request..." : "submit purchase request"}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-light tracking-wide text-foreground">request submitted</h3>
                  <p className="text-sm text-muted-foreground/60 tracking-wide mt-2 leading-relaxed">
                    your release-bound purchase request has been submitted to operations. 
                    we'll contact {form.email} within 24 hours with routing and pricing confirmation.
                  </p>
                </div>
                <Button onClick={onClose} variant="outline" className="rounded-full text-sm tracking-wider">
                  close
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}