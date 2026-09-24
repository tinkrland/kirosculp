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
import { base44 } from "@/api/base44Client";

const STEPS = ["your details", "shipping address", "review order"];

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [placed, setPlaced] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const savedAddr = getSavedAddress();

  const [details, setDetails] = useState({ name: "", email: "" });
  const [address, setAddress] = useState(
    savedAddr || { line1: "", line2: "", city: "", country: "", postal: "" }
  );
  const [saveAddr, setSaveAddr] = useState(!!savedAddr);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const c = getCart();
    if (c.length === 0 && !placed) navigate("/explore");
    setCart(c);
  }, [navigate, placed]);

  const total = getCartTotal(cart);

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

  const placeOrder = async () => {
    setIsPlacing(true);
    const shippingAddress = `${address.line1}${address.line2 ? ", " + address.line2 : ""}, ${address.city}, ${address.postal}, ${address.country}`;

    for (const item of cart) {
      await base44.entities.Order.create({
        artifact_id: item.artifactId,
        artifact_name: item.artifactName,
        artifact_image_url: item.artifactImage || "",
        creator_handle: item.creatorHandle || "",
        customer_email: details.email,
        customer_name: details.name,
        material: item.material,
        price: item.price * (item.quantity || 1),
        manufacturing_cost: 0,
        creator_earnings: 0,
        shipping_address: shippingAddress,
        notes: notes || "",
        status: "placed",
      });
    }

    clearCart();
    setPlaced(true);
    setIsPlacing(false);
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
                  <div key={`${item.artifactId}-${item.material}`} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.artifactImage && <img src={item.artifactImage} alt={item.artifactName} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm tracking-wide text-foreground lowercase truncate">{item.artifactName}</p>
                      <p className="text-[11px] text-muted-foreground/50 tracking-wide">{item.material} x{item.quantity || 1}</p>
                    </div>
                    <span className="text-sm font-light text-foreground">${(item.price * (item.quantity || 1)).toFixed(0)}</span>
                  </div>
                ))}
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground tracking-wide">total</span>
                  <span className="text-xl font-light tracking-wide text-foreground">${total.toFixed(0)}</span>
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
                  payment is not collected now. the sculptura team will contact you within 24 hours to confirm your order and arrange payment before production begins.
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
                  {isPlacing ? "placing order..." : "confirm order"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}