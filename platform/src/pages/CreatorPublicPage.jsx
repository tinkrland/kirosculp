import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, 
  MessageCircle, 
  ExternalLink, 
  Instagram, 
  Globe, 
  Mail,
  Calendar,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ListingCard from "@/components/artifacts/ListingCard";

const TABS = [
  { key: "overview", label: "overview" },
  { key: "catalog", label: "catalog" },
  { key: "collections", label: "collections" },
  { key: "commissions", label: "commissions" },
  { key: "about", label: "about" },
  { key: "links", label: "links" },
];

export default function CreatorPublicPage() {
  const { handle } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [creator, setCreator] = useState(null);
  const [listings, setListings] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreatorData();
  }, [handle]);

  const fetchCreatorData = async () => {
    try {
      // Fetch creator profile
      const creatorResponse = await fetch(`/api/creators/${handle}/profile`);
      if (creatorResponse.ok) {
        const creatorData = await creatorResponse.json();
        setCreator(creatorData.creator);
      }

      // Fetch creator's published listings
      const listingsResponse = await fetch(`/api/creators/${handle}/listings?status=published`);
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        setListings(listingsData.listings || []);
      }

      // Fetch creator's collections
      const collectionsResponse = await fetch(`/api/creators/${handle}/collections`);
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.collections || []);
      }
    } catch (error) {
      console.error('Failed to fetch creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (listing, variant, size) => {
    // Integration with platform cart system
    console.log('Add to cart:', { listing, variant, size });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-secondary rounded-lg" />
            <div className="h-8 bg-secondary rounded w-1/3" />
            <div className="h-4 bg-secondary rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">creator not found</p>
          <Link to="/explore">
            <Button variant="outline" className="mt-4">
              back to explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const featuredListings = listings.filter(l => l.is_featured).slice(0, 3);
  const filteredListings = activeTab === "catalog" ? listings : featuredListings;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-secondary/20 to-background border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary flex-shrink-0">
              {creator.avatar_url ? (
                <img 
                  src={creator.avatar_url} 
                  alt={creator.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground/40 font-light">
                    {creator.display_name?.charAt(0) || creator.handle.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-light tracking-wide lowercase text-foreground">
                    {creator.display_name || creator.handle}
                  </h1>
                  <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                    @{creator.handle}
                  </p>
                  {creator.store_heading && (
                    <p className="text-base text-muted-foreground tracking-wide mt-2">
                      {creator.store_heading}
                    </p>
                  )}
                  {creator.store_subheading && (
                    <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
                      {creator.store_subheading}
                    </p>
                  )}
                </div>

                {/* Commission status */}
                {creator.commissions_open && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    commissions open
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-sm text-muted-foreground">
                    {listings.length} piece{listings.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-sm text-muted-foreground">
                    {collections.length} collection{collections.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(({ key, label }) => {
              // Hide commissions tab if not open
              if (key === 'commissions' && !creator.commissions_open) return null;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-3 text-sm tracking-wide lowercase whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === key
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Featured pieces */}
            {featuredListings.length > 0 && (
              <div>
                <h3 className="text-lg font-light tracking-wide lowercase text-foreground mb-4">
                  featured pieces
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onView={(l) => window.open(`/listings/${l.id}`, '_self')}
                    />
                  ))}
                </div>
                {listings.length > featuredListings.length && (
                  <div className="text-center mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("catalog")}
                      className="text-sm"
                    >
                      view all pieces
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Collections preview */}
            {collections.length > 0 && (
              <div>
                <h3 className="text-lg font-light tracking-wide lowercase text-foreground mb-4">
                  collections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.slice(0, 3).map((collection) => (
                    <div key={collection.id} className="bg-card rounded-lg p-4 border border-border/40">
                      <h4 className="text-sm font-medium tracking-wide text-foreground lowercase">
                        {collection.title}
                      </h4>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {collection.piece_count} pieces
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catalog tab */}
        {activeTab === "catalog" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light tracking-wide lowercase text-foreground">
                catalog ({listings.length} pieces)
              </h3>
            </div>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onView={(l) => window.open(`/listings/${l.id}`, '_self')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground/40">no pieces available yet</p>
              </div>
            )}
          </div>
        )}

        {/* Collections tab */}
        {activeTab === "collections" && (
          <div>
            <h3 className="text-lg font-light tracking-wide lowercase text-foreground mb-6">
              collections ({collections.length})
            </h3>
            {collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <div key={collection.id} className="bg-card rounded-lg p-6 border border-border/40">
                    <h4 className="text-base font-medium tracking-wide text-foreground lowercase mb-2">
                      {collection.title}
                    </h4>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {collection.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      {collection.piece_count} pieces
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground/40">no collections yet</p>
              </div>
            )}
          </div>
        )}

        {/* Commissions tab */}
        {activeTab === "commissions" && creator.commissions_open && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-light tracking-wide lowercase text-foreground mb-6">
              commissions
            </h3>
            
            <div className="bg-card rounded-lg p-6 border border-border/40 space-y-6">
              <div>
                <h4 className="text-sm font-medium tracking-wide text-foreground lowercase mb-2">
                  how it works
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  submit a commission brief with your references and preferences. 
                  all work is escrowed through sculptura with milestone releases and dispute protection.
                </p>
              </div>

              {creator.commission_terms && (
                <div>
                  <h4 className="text-sm font-medium tracking-wide text-foreground lowercase mb-2">
                    terms
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {creator.commission_terms.pricing_model && (
                      <p>pricing: {creator.commission_terms.pricing_model}</p>
                    )}
                    {creator.commission_terms.turnaround && (
                      <p>turnaround: {creator.commission_terms.turnaround}</p>
                    )}
                    {creator.commission_terms.revisions && (
                      <p>revisions: {creator.commission_terms.revisions}</p>
                    )}
                  </div>
                </div>
              )}

              <Button className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                start commission request
              </Button>
            </div>
          </div>
        )}

        {/* About tab */}
        {activeTab === "about" && (
          <div className="max-w-2xl space-y-6">
            <h3 className="text-lg font-light tracking-wide lowercase text-foreground">
              about
            </h3>
            
            {creator.bio && (
              <div>
                <h4 className="text-sm font-medium tracking-wide text-foreground lowercase mb-2">
                  bio
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {creator.bio}
                </p>
              </div>
            )}

            {creator.philosophy && (
              <div>
                <h4 className="text-sm font-medium tracking-wide text-foreground lowercase mb-2">
                  philosophy
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {creator.philosophy}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Links tab */}
        {activeTab === "links" && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-light tracking-wide lowercase text-foreground mb-6">
              links & contact
            </h3>
            
            <div className="space-y-4">
              {creator.website_url && (
                <a 
                  href={creator.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/40 hover:border-border/60 transition-colors"
                >
                  <Globe className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-sm text-foreground">website</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground/60 ml-auto" />
                </a>
              )}

              {creator.instagram_handle && (
                <a 
                  href={`https://instagram.com/${creator.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/40 hover:border-border/60 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-sm text-foreground">@{creator.instagram_handle}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground/60 ml-auto" />
                </a>
              )}

              {creator.contact_email && (
                <a 
                  href={`mailto:${creator.contact_email}`}
                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/40 hover:border-border/60 transition-colors"
                >
                  <Mail className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-sm text-foreground">{creator.contact_email}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}