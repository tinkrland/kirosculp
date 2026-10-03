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
  getCartTotalFromServer,
  getSavedAddress,
  saveAddress,
  clearCart,
  cartToPurchaseRequests,
} from "@/lib/cartStore";

// ISO 3166-1 alpha-2 country codes for checkout
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
];

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
  const [total, setTotal] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  const savedAddr = getSavedAddress();

  const [details, setDetails] = useState({ name: "", email: "" });
  const [address, setAddress] = useState(
    savedAddr || { line1: "", line2: "", city: "", country_code: "", postal: "" }
  );
  const [saveAddr, setSaveAddr] = useState(!!savedAddr);
  const [notes, setNotes] = useState("");
  const [destinationNotice, setDestinationNotice] = useState(null);

  useEffect(() => {
    const initCheckout = async () => {
      const c = getCart();
      if (c.length === 0 && !placed) {
        navigate("/explore");
        return;
      }
      
      setCart(c);
      
      // Get server-side pricing
      try {
        const serverTotal = await getCartTotalFromServer(c);
        if (serverTotal !== null) {
          setTotal(serverTotal);
        }
      } catch (error) {
        console.error('Failed to get cart total:', error);
        toast.error('Failed to load pricing. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [navigate, placed]);

  const goNext = () => {
    if (step === 0) {
      if (!details.name.trim() || !details.email.trim()) {
        toast.error("please fill in your name and email");
        return;
      }
    }
    if (step === 1) {
      if (!address.line1.trim() || !address.city.trim() || !address.country_code) {
        toast.error("please fill in your shipping address");
        return;
      }
      if (saveAddr) saveAddress(address);
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  // Check if destination has approved routes (non-blocking notice)
  const checkDestinationRoute = async (countryCode) => {
    if (!countryCode) {
      setDestinationNotice(null);
      return;
    }

    try {
      // Load shipping markets data (in production, this would be an API call)
      // For now, client-side check against static data
      const response = await fetch('/operations/country-rollout/shipping-markets.json');
      const data = await response.json();
      
      const market = data.markets.find(m => m.country_code === countryCode);
      
      if (!market) {
        setDestinationNotice({
          type: 'warning',
          message: "this destination isn't enabled yet. we're working on expanding availability."
        });
      } else if (market.approved_routes.length === 0) {
        setDestinationNotice({
          type: 'warning',
          message: `${market.country_name} is in ${market.status} status. route approval is pending.`
        });
      } else {
        setDestinationNotice({
          type: 'success',
          message: `${market.country_name} is available for delivery.`
        });
      }
    } catch (error) {
      console.error('Failed to check destination route:', error);
      // Don't block on client-side check failure; server is authoritative
      setDestinationNotice(null);
    }
  };

  const placeOrder = async () => {
    setIsPlacing(true);
    
    try {
      // Require authentication per purchase-request.schema.json (buyer_id required)
      // In real implementation, check auth context and get buyer_id from session
      const buyerId = sessionStorage.getItem('buyer_id');
      if (!buyerId) {
        toast.error("please sign in to complete your purchase");
        navigate('/auth?redirect=/checkout');
        return;
      }

      // Convert destination to schema-compliant format
      // per contracts/purchase-request.schema.json: {country_code, region?, postal_code?}
      const destination = {
        country_code: address.country_code, // Already ISO 3166-1 alpha-2 from select
        region: address.line2 || null,
        postal_code: address.postal || null
      };

      // Convert cart to release-bound purchase requests
      const purchaseRequests = cartToPurchaseRequests(cart, buyerId, destination);

      // Submit to operations for pricing and confirmation
      const response = await fetch('/api/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseRequests,
          customerDetails: details,
          shippingAddress: address,
          notes,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle machine-readable rejection codes per contracts/checkout-intake.md
        if (errorData.error && errorData.error.code) {
          const { code, message, details } = errorData.error;
          
          // Log rejection for analytics
          console.error('Checkout rejected:', {
            reason_code: code,
            destination: details.destination,
            request_ids: details.request_ids,
            timestamp: new Date().toISOString()
          });
          
          // Show user-friendly error
          toast.error(message);
          
          // Don't retry with same request_id - user must modify and resubmit
          // which will mint new request_ids per idempotency rule
          return;
        }
        
        throw new Error('Failed to submit order');
      }

      const { orderId } = await response.json();
      
      clearCart();
      setPlaced(true);
      
      // Store order ID for confirmation display
      sessionStorage.setItem('lastOrderId', orderId);
      
    } catch (error) {
      console.error('Order submission failed:', error);
      toast.error('Failed to place order. Please try again.');
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
            <h2 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground">order submitted</h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide mt-2">
              your release-bound purchase requests have been submitted to operations for pricing and confirmation. 
              we will contact {details.email} within 24 hours with final pricing and payment details.
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

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">loading checkout...</p>
        </div>
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
                  <p className="text-sm text-muted-foreground tracking-wide">
                    {savedAddr.line1}{savedAddr.line2 ? ", " + savedAddr.line2 : ""}, {savedAddr.city}, {savedAddr.postal}, {COUNTRIES.find(c => c.code === savedAddr.country_code)?.name || savedAddr.country_code}
                  </p>
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
                  <select
                    value={address.country_code}
                    onChange={(e) => {
                      const newCountryCode = e.target.value;
                      setAddress((p) => ({ ...p, country_code: newCountryCode }));
                      checkDestinationRoute(newCountryCode);
                    }}
                    className="w-full rounded-xl bg-card border border-border/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  >
                    <option value="">select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {destinationNotice && (
                  <div className={`rounded-xl px-4 py-3 text-xs tracking-wide leading-relaxed ${
                    destinationNotice.type === 'warning' 
                      ? 'bg-amber-50 border border-amber-100 text-amber-700/80' 
                      : 'bg-emerald-50 border border-emerald-100 text-emerald-700/80'
                  }`}>
                    {destinationNotice.message}
                  </div>
                )}
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
                  <div key={`${item.releaseId}-${item.variant}-${item.size || "_"}`} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground/40">preview</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm tracking-wide text-foreground lowercase truncate">release {item.releaseId.substring(0, 8)}...</p>
                      <p className="text-[11px] text-muted-foreground/50 tracking-wide">
                        {item.variant}{item.size ? ` · size ${item.size}` : ""} x{item.quantity || 1}
                      </p>
                    </div>
                    <span className="text-sm font-light text-foreground">
                      {item.serverPrice ? `$${(item.serverPrice * (item.quantity || 1)).toFixed(0)}` : "pricing..."}
                    </span>
                  </div>
                ))}
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground tracking-wide">total</span>
                  <span className="text-xl font-light tracking-wide text-foreground">
                    ${total.toFixed(0)}
                  </span>
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
                  this creates release-bound purchase requests for operations to price and confirm. 
                  payment is arranged separately after manufacturing cost verification and route selection.
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
                  {isPlacing ? "submitting..." : "submit purchase requests"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}