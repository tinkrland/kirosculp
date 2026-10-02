import { useState, useEffect } from "react";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ListingCard from "./ListingCard";

export default function ListingManager({ creatorId }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft', 'scheduled'
  const [view, setView] = useState('grid'); // 'grid', 'list'

  useEffect(() => {
    fetchListings();
  }, [creatorId, filter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/creators/${creatorId}/listings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = () => {
    // Navigate to create listing flow - requires validated release
    window.location.href = '/console/listings/create';
  };

  const handleEditListing = (listing) => {
    window.location.href = `/console/listings/${listing.id}/edit`;
  };

  const handleViewListing = (listing) => {
    window.open(`/listings/${listing.id}`, '_blank');
  };

  const handleDeleteListing = async (listing) => {
    if (!confirm('Remove this listing? It will no longer be available for purchase.')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setListings(prev => prev.filter(l => l.id !== listing.id));
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  const filters = [
    { key: 'all', label: 'all', count: listings.length },
    { key: 'published', label: 'published', count: listings.filter(l => l.status === 'published').length },
    { key: 'draft', label: 'drafts', count: listings.filter(l => l.status === 'draft').length },
    { key: 'scheduled', label: 'scheduled', count: listings.filter(l => l.scheduled_publish_at).length },
  ];

  const filteredListings = listings.filter(listing => 
    searchTerm === "" || 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.release?.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light tracking-wide lowercase text-foreground">listings</h2>
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">
            manage release-bound marketplace offerings
          </p>
        </div>
        <Button onClick={handleCreateListing} className="text-sm">
          <Plus className="w-4 h-4 mr-2" />
          create listing
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs tracking-wider transition-colors ${
                filter === key
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {label} {count > 0 && `(${count})`}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 ml-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50" />
            <Input
              placeholder="search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
            />
          </div>
          
          <div className="flex border border-border/60 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2 ${view === 'grid' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 ${view === 'list' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Listings grid/list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-[16px] border border-border/40 p-4">
              <div className="animate-pulse flex gap-4">
                <div className="w-16 h-16 bg-secondary rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                  <div className="h-3 bg-secondary rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-[18px] border border-border/50">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground/40 tracking-wide mb-2">
            {searchTerm ? 'no listings match your search' : 'no listings yet'}
          </p>
          <p className="text-xs text-muted-foreground/30 tracking-wide mb-4">
            create listings from validated releases to start selling
          </p>
          <Button onClick={handleCreateListing} variant="outline">
            create your first listing
          </Button>
        </div>
      ) : (
        <div className={
          view === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={handleEditListing}
              onView={handleViewListing}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}