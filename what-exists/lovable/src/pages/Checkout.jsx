import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Package, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  getCart,
  getCartTotal,
  getSavedAddress,
  saveAddress,
  clearCart,
} from "@/lib/cartStore";

const STEPS = ["your details", "shipping address", "review order"];

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [placed, setPlaced] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const savedAddr = getSavedAddress();

  // prefill from the signed-in user when we have one. customers can
  // still edit these before placing the order. guests fill from scratch.
  const [details, setDetails] = useState({
    name: user?.display_name || "",
    email: user?.email || "",
  });
  const [address, setAddress] = useState(
    savedAddr || { line1: "", line2: "", city: "", country: "", postal: "" }
  );
  const [saveAddr, setSaveAddr] = useState(!!savedAddr);
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); // { code, pct }
  const [couponError, setCouponError] = useState("");
  const [storeCoupons, setStoreCoupons] = useState([]); // flattened across creators in cart

  useEffect(() => {
    if (user && !details.email) {
      setDetails({ name: user.display_name || "", email: user.email || "" });
    }
  }, [user]);


  useEffect(() => {
    const c = getCart();
    if (c.length === 0 && !placed) navigate("/explore");
    setCart(c);
  }, [navigate, placed]);

  // pull live coupons for the creators present in the cart so we can
  // validate the user's promo code locally before sending the order.
  useEffect(() => {
    (async () => {
      const handles = [...new Set(cart.map((i) => i.creatorHandle).filter(Boolean))];
      if (!handles.length) { setStoreCoupons([]); return; }
      const { data } = await supabase
        .from("market_accounts")
        .select("handle, coupons")
        .in("handle", handles);
      const flat = [];
      for (const acc of data || []) {
        for (const c of acc.coupons || []) {
          flat.push({ ...c, handle: acc.handle });
        }
      }
      setStoreCoupons(flat);
    })();
  }, [cart]);

  const subtotal = getCartTotal(cart);
  // discount only applies to items from the matching creator handle.
  const discountAmount = couponApplied
    ? cart.reduce((sum, it) => {
        if (it.creatorHandle !== couponApplied.handle) return sum;
        return sum + it.price * (it.quantity || 1) * (couponApplied.pct / 100);
      }, 0)
    : 0;
  const totalAfterDiscount = subtotal - discountAmount;
  const tax = totalAfterDiscount * 0.1;
  const total = totalAfterDiscount + tax;

  const applyCoupon = () => {
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const match = storeCoupons.find(
      (c) => String(c.code || "").toUpperCase() === code &&
        c.active &&
        (!c.expires || new Date(c.expires) >= new Date())
    );
    if (!match) {
      setCouponError("coupon not valid for items in your cart");
      setCouponApplied(null);
      return;
    }
    setCouponApplied({ code, pct: Number(match.discount_pct) || 0, handle: match.handle });
    toast.success(`coupon ${code} applied`);
  };

  const goNext = () => {
    if (step === 0) {
      if (!details.name.trim() || !details.email.trim()) {
        toast.error("please fill in your name and email");
        return;
      }
    }
    if (step === 1) {
      if (!address.line1.trim() || !address.city.trim() || !address.country.trim()) {
        toast.error("please fill in your shipping address");
        return;
      }
      if (saveAddr) saveAddress(address);
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  // place-order accepts both signed-in users and guests. when signed in,
  // a jwt is attached automatically so user_id gets set on the order.
  // when guest, we still rely on customer_email so the buyer dashboard
  // can link orders to a future account with the same email.
  const placeOrder = async () => {
    setIsPlacing(true);
    const shippingAddress = `${address.line1}${address.line2 ? ", " + address.line2 : ""}, ${address.city}, ${address.postal}, ${address.country}`;
    try {
      const { data, error } = await supabase.functions.invoke('place-order', {
        body: {
          items: cart.map((item) => ({
            artifact_id: item.artifactId,
            material: item.material,
            size: item.size || null,
            quantity: item.quantity || 1,
          })),
          customer: { name: details.name, email: details.email },
          shipping_address: shippingAddress,
          notes: notes || '',
          coupon_code: couponApplied?.code || '',
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      clearCart();
      setPlaced(true);
    } catch (err) {
      toast.error(err.message || 'could not place order');
    } finally {
      setIsPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm space-y-5"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground">order placed</h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide mt-2">
              we will reach out to {details.email} within 24 hours to confirm your order and arrange payment before production begins.
            </p>
          </div>
          <Link to="/explore">
            <Button variant="outline" className="rounded-full text-sm tracking-wider">
              continue browsing
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="max-w-xl mx-auto">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          back to explore
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground mb-2">checkout</h1>
          <p className="text-sm text-muted-foreground tracking-wide font-light">{cart.length} item{cart.length !== 1 ? "s" : ""} in your queue</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all ${i <= step ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                {i < step ? <Check className="w-2.5 h-2.5" /> : i + 1}
              </div>
              <span className={`text-[11px] tracking-wider lowercase hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground/40"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className="w-5 h-px bg-border/40" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: details */}
          {step === 0 && (
            <motion.div key="details" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground/50" />
                <h3 className="text-sm font-light tracking-wide lowercase text-foreground">your details</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">full name</Label>
                  <Input
                    placeholder="your name"
                    value={details.name}
                    onChange={(e) => setDetails((p) => ({ ...p, name: e.target.value }))}
                    className="rounded-xl bg-card border-border/60 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={details.email}
                    onChange={(e) => setDetails((p) => ({ ...p, email: e.target.value }))}
                    className="rounded-xl bg-card border-border/60 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">order notes (optional)</Label>
                  <Textarea
                    placeholder="any special requests or notes for your order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rounded-xl bg-card border-border/60 text-sm min-h-[80px]"
                  />
                </div>
              </div>

              <Button onClick={goNext} className="w-full rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                continue <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: address */}
          {step === 1 && (
            <motion.div key="address" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground/50" />
                <h3 className="text-sm font-light tracking-wide lowercase text-foreground">shipping address</h3>
              </div>

              {savedAddr && (
                <div className="bg-secondary/40 rounded-xl border border-border/40 p-4 space-y-2">
                  <p className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">saved address</p>
                  <p className="text-sm text-muted-foreground tracking-wide">{savedAddr.line1}{savedAddr.line2 ? ", " + savedAddr.line2 : ""}, {savedAddr.city}, {savedAddr.postal}, {savedAddr.country}</p>
                  <button
                    onClick={() => setAddress(savedAddr)}
                    className="text-xs tracking-wider text-primary hover:underline"
                  >
                    use this address
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">address line 1</Label>
                  <Input placeholder="street and number" value={address.line1} onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))} className="rounded-xl bg-card border-border/60 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">address line 2 (optional)</Label>
                  <Input placeholder="apartment, suite, etc." value={address.line2} onChange={(e) => setAddress((p) => ({ ...p, line2: e.target.value }))} className="rounded-xl bg-card border-border/60 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">city</Label>
                    <Input placeholder="city" value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} className="rounded-xl bg-card border-border/60 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">postal code</Label>
                    <Input placeholder="00000" value={address.postal} onChange={(e) => setAddress((p) => ({ ...p, postal: e.target.value }))} className="rounded-xl bg-card border-border/60 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">country</Label>
                  <Input placeholder="e.g. Germany" value={address.country} onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))} className="rounded-xl bg-card border-border/60 text-sm" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} className="rounded" />
                  <span className="text-xs tracking-wide text-muted-foreground">save address for next time</span>
                </label>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)} className="rounded-full text-sm tracking-wider text-muted-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button onClick={goNext} className="flex-1 rounded-full py-5 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
                  review order <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: review */}
          {step === 2 && (
            <motion.div key="review" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-muted-foreground/50" />
                <h3 className="text-sm font-light tracking-wide lowercase text-foreground">review your order</h3>
              </div>

              {/* Items summary */}
              <div className="bg-card rounded-[18px] border border-border/50 shadow-paper divide-y divide-border/30">
                {cart.map((item) => (
                  <div key={`${item.artifactId}-${item.material}-${item.size || "_"}`} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.artifactImage && <img src={item.artifactImage} alt={item.artifactName} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm tracking-wide text-foreground lowercase truncate">{item.artifactName}</p>
                      <p className="text-[11px] text-muted-foreground/50 tracking-wide">{item.material}{item.size ? ` · size ${item.size}` : ""} x{item.quantity || 1}</p>
                    </div>
                    <span className="text-sm font-light text-foreground">${(item.price * (item.quantity || 1)).toFixed(0)}</span>
                  </div>
                ))}
                <div className="px-5 py-4 space-y-3">
                  {/* Promo code */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">promo code</Label>
                    <div className="flex gap-2">
                      <Input
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                        placeholder="enter code"
                        className="rounded-xl bg-card border-border/60 text-sm tracking-widest font-mono uppercase"
                      />
                      <Button type="button" variant="outline" onClick={applyCoupon} className="rounded-full text-xs tracking-wider">
                        apply
                      </Button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-500 tracking-wide">{couponError}</p>}
                    {couponApplied && (
                      <p className="text-[11px] text-emerald-600 tracking-wide">
                        {couponApplied.code} applied · {couponApplied.pct}% off items by {couponApplied.handle}
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-border/40" />

                  <div className="flex items-center justify-between text-xs text-muted-foreground tracking-wide">
                    <span>subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 tracking-wide">
                      <span>discount ({couponApplied.code})</span>
                      <span>- ${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground tracking-wide">
                    <span>estimated tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground tracking-wide">
                    <span>shipping</span>
                    <span>calculated by maker</span>
                  </div>
                  <div className="h-px bg-border/40 my-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground tracking-wide">total due now</span>
                    <span className="text-xl font-light tracking-wide text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Details summary */}
              <div className="bg-secondary/40 rounded-[14px] border border-border/40 px-5 py-4 space-y-2">
                <p className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">shipping to</p>
                <p className="text-sm text-foreground tracking-wide">{details.name}</p>
                <p className="text-xs text-muted-foreground tracking-wide">{details.email}</p>
                <p className="text-xs text-muted-foreground tracking-wide">{address.line1}{address.line2 ? ", " + address.line2 : ""}, {address.city}, {address.postal}, {address.country}</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700/80 tracking-wide leading-relaxed">
                  stripe demo mode: no real card is charged. live payments will plug into this same screen once the maker enables stripe. shipping fees set directly by the maker are not included above.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full text-sm tracking-wider text-muted-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={placeOrder}
                  disabled={isPlacing}
                  className="flex-1 rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 shadow-paper"
                >
                  {isPlacing ? "placing order..." : "pay with stripe (demo)"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
