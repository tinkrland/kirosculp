import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Package, 
  Truck,
  Shield,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addToCart } from "@/lib/cartStore";
import { toast } from "sonner";

export default function ListingDetailPage() {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [serverPrice, setServerPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (listing && selectedVariant) {
      fetchPricing();
    }
  }, [listing, selectedVariant, selectedSize, quantity]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data.listing);
        
        // Set default selections
        if (data.listing.variants?.length > 0) {
          setSelectedVariant(data.listing.variants[0]);
        }
        if (data.listing.sizes?.length > 0) {
          setSelectedSize(data.listing.sizes[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    if (!selectedVariant) return;
    
    setPriceLoading(true);
    try {
      const response = await fetch('/api/pricing/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId: listing.release_id,
          variant: selectedVariant,
          size: selectedSize || null,
          quantity
        })
      });
      
      if (response.ok) {
        const { price } = await response.json();
        setServerPrice(price);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("please select a variant");
      return;
    }

    addToCart(listing.release_id, selectedVariant, selectedSize, listing.id);
    toast.success("added to cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-secondary rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-secondary rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/2" />
                <div className="h-20 bg-secondary rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">listing not found</p>
          <Link to="/explore">
            <Button variant="outline" className="mt-4">
              back to explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link 
            to="/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            back to explore
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
              {listing.release?.preview_url ? (
                <img 
                  src={listing.release.preview_url} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground/20" />
                </div>
              )}
            </div>
            
            {/* Additional images would go here */}
          </div>

          {/* Product details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                    {listing.title}
                  </h1>
                  <Link 
                    to={`/creators/${listing.creator_handle}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 inline-block"
                  >
                    by @{listing.creator_handle}
                  </Link>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="mt-4">
                {priceLoading ? (
                  <div className="h-8 w-24 bg-secondary rounded animate-pulse" />
                ) : serverPrice ? (
                  <p className="text-2xl font-light tracking-wide text-foreground">
                    ${serverPrice}
                  </p>
                ) : (
                  <p className="text-lg text-muted-foreground">
                    select options for pricing
                  </p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-1">
                  made to order · server-computed pricing
                </p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="text-sm font-medium tracking-wide text-foreground lowercase mb-2">
                  description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Release info */}
            <div className="bg-secondary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-xs tracking-widest text-muted-foreground/50 uppercase">
                  design release
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                release {listing.release_id.substring(0, 8)}...
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                validated geometry · {listing.release?.family} family
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Variant selection */}
              {listing.variants && listing.variants.length > 0 && (
                <div>
                  <label className="text-sm font-medium tracking-wide text-foreground lowercase block mb-2">
                    material
                  </label>
                  <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="choose material" />
                    </SelectTrigger>
                    <SelectContent>
                      {listing.variants.map((variant) => (
                        <SelectItem key={variant} value={variant}>
                          {variant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Size selection */}
              {listing.sizes && listing.sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium tracking-wide text-foreground lowercase block mb-2">
                    size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="choose size" />
                    </SelectTrigger>
                    <SelectContent>
                      {listing.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium tracking-wide text-foreground lowercase block mb-2">
                  quantity
                </label>
                <Select value={quantity.toString()} onValueChange={(v) => setQuantity(parseInt(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart}
                disabled={!selectedVariant || priceLoading}
                className="w-full rounded-full py-6 text-sm tracking-wider"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                add to cart
              </Button>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3">
                  <Package className="w-5 h-5 text-muted-foreground/60 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground/60">made to order</p>
                </div>
                <div className="p-3">
                  <Truck className="w-5 h-5 text-muted-foreground/60 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground/60">worldwide shipping</p>
                </div>
                <div className="p-3">
                  <Shield className="w-5 h-5 text-muted-foreground/60 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground/60">secure checkout</p>
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-700/80 leading-relaxed">
                this piece will be manufactured after order confirmation. 
                operations will contact you within 24 hours with routing and timeline details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}