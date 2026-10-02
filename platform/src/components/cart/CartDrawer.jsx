import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCart,
  removeFromCart,
  updateQuantity,
  getCartTotalFromServer,
} from "@/lib/cartStore";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const [cart, setCart] = useState(getCart());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sync = () => setCart(getCart());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  useEffect(() => {
    if (open) {
      const currentCart = getCart();
      setCart(currentCart);
      fetchCartTotal(currentCart);
    }
  }, [open]);

  const fetchCartTotal = async (cartItems) => {
    if (cartItems.length === 0) {
      setTotal(0);
      return;
    }
    
    setLoading(true);
    try {
      const serverTotal = await getCartTotalFromServer(cartItems);
      if (serverTotal !== null) {
        setTotal(serverTotal);
      }
    } catch (error) {
      console.error('Failed to fetch cart total:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (releaseId, variant, size, newQuantity) => {
    updateQuantity(releaseId, variant, size, newQuantity);
    const updatedCart = getCart();
    setCart(updatedCart);
    await fetchCartTotal(updatedCart);
  };

  const handleRemoveItem = async (releaseId, variant, size) => {
    removeFromCart(releaseId, variant, size);
    const updatedCart = getCart();
    setCart(updatedCart);
    await fetchCartTotal(updatedCart);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border/50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-muted-foreground/60" />
                <h2 className="text-sm font-light tracking-wide lowercase text-foreground">
                  your queue
                </h2>
                {cart.length > 0 && (
                  <span className="text-[11px] font-mono text-muted-foreground/50">
                    ({cart.length})
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground/40 tracking-wide">your queue is empty</p>
                  <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">
                    browse listings and add them here
                  </p>
                  <Link to="/explore" onClick={onClose}>
                    <Button variant="outline" className="mt-6 rounded-full text-xs tracking-wider">
                      explore listings
                    </Button>
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.releaseId}-${item.variant}-${item.size || "_"}`}
                    className="flex gap-4 bg-background rounded-[16px] border border-border/40 p-4"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      {/* Release preview image will come from server */}
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground/40">preview</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/release/${item.releaseId}`}
                        onClick={onClose}
                        className="text-sm tracking-wide text-foreground lowercase hover:text-primary transition-colors truncate block"
                      >
                        release {item.releaseId.substring(0, 8)}...
                      </Link>
                      <p className="text-[11px] text-muted-foreground/50 tracking-wide mt-0.5">
                        {item.variant}{item.size ? ` · size ${item.size}` : ""}, made to order
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.releaseId,
                                item.variant,
                                item.size,
                                Math.max(1, (item.quantity || 1) - 1)
                              )
                            }
                            className="w-6 h-6 rounded-full border border-border/60 flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <span className="text-xs font-mono text-foreground w-4 text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.releaseId,
                                item.variant,
                                item.size,
                                (item.quantity || 1) + 1
                              )
                            }
                            className="w-6 h-6 rounded-full border border-border/60 flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                        <span className="text-sm font-light tracking-wide text-foreground">
                          {loading ? (
                            <span className="text-muted-foreground/40">...</span>
                          ) : (
                            item.serverPrice && `$${(item.serverPrice * (item.quantity || 1)).toFixed(0)}`
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.releaseId, item.variant, item.size)}
                      className="self-start w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-border/30 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground tracking-wide">total</span>
                  <span className="text-xl font-light tracking-wide text-foreground">
                    {loading ? (
                      <span className="text-muted-foreground/40">calculating...</span>
                    ) : (
                      `$${total.toFixed(0)}`
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/40 tracking-wide">
                  all items are made to order. pricing computed server-side.
                </p>
                <Button
                  onClick={() => { onClose(); onCheckout(); }}
                  disabled={loading}
                  className="w-full rounded-full py-5 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2 disabled:opacity-50"
                >
                  proceed to checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}