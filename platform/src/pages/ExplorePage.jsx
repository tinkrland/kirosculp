import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Filter, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ListingCard from "@/components/artifacts/ListingCard";

const TABS = [
  { key: "pieces", label: "pieces" },
  { key: "creators", label: "creators" },
  { key: "collections", label: "collections" },
];

const STYLE_FILTERS = [
  "all", "minimalist", "ornate", "geometric", "organic", "art nouveau", "modern", "vintage"
];

const CONTEXT_FILTERS = [
  "all", "everyday", "statement", "stacks", "bridal", "professional", "casual"
];

const METAL_FILTERS = [
  "all", "sterling silver", "14k gold", "18k gold", "rose gold", "white gold", "brass", "copper"
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "pieces");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [styleFilter, setStyleFilter] = useState("all");
  const [contextFilter, setContextFilter] = useState("all");
  const [metalFilter, setMetalFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchIntent, setSearchIntent] = useState(null);

  useEffect(() => {
    performSearch();
  }, [tab, query, styleFilter, contextFilter, metalFilter]);

  const performSearch = async () => {
    setLoading(true);
    
    try {
      // Build query for the discovery system
      const searchQuery = {
        query,
        tab,
        filters: {
          style: styleFilter !== 'all' ? styleFilter : null,
          context: contextFilter !== 'all' ? contextFilter : null,
          metal: metalFilter !== 'all' ? metalFilter : null,
        }
      };

      const response = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery)
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSearchIntent(data.intent || null);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    setSearchParams({ tab, q: newQuery });
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab, q: query });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50" />
              <Input
                placeholder="search pieces, creators, collections..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 rounded-full bg-background border-border/60"
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              />
            </div>

            {/* Tabs */}
            <div className="flex border border-border/60 rounded-full overflow-hidden">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`px-4 py-2 text-sm tracking-wide lowercase transition-colors ${
                    tab === key
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs"
              >
                <Filter className="w-3 h-3 mr-1" />
                filters
              </Button>
              
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

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-card rounded-lg border border-border/50 space-y-4">
              <div>
                <p className="text-xs tracking-widest text-muted-foreground/50 uppercase mb-2">style</p>
                <div className="flex flex-wrap gap-2">
                  {STYLE_FILTERS.map((style) => (
                    <button
                      key={style}
                      onClick={() => setStyleFilter(style)}
                      className={`px-3 py-1.5 rounded-full text-xs tracking-wider transition-colors ${
                        styleFilter === style
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs tracking-widest text-muted-foreground/50 uppercase mb-2">wear context</p>
                <div className="flex flex-wrap gap-2">
                  {CONTEXT_FILTERS.map((context) => (
                    <button
                      key={context}
                      onClick={() => setContextFilter(context)}
                      className={`px-3 py-1.5 rounded-full text-xs tracking-wider transition-colors ${
                        contextFilter === context
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {context}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs tracking-widest text-muted-foreground/50 uppercase mb-2">metal</p>
                <div className="flex flex-wrap gap-2">
                  {METAL_FILTERS.map((metal) => (
                    <button
                      key={metal}
                      onClick={() => setMetalFilter(metal)}
                      className={`px-3 py-1.5 rounded-full text-xs tracking-wider transition-colors ${
                        metalFilter === metal
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {metal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search intent display */}
        {searchIntent && (
          <div className="mb-6 p-4 bg-secondary/20 rounded-lg border border-border/30">
            <p className="text-sm text-muted-foreground">
              showing {tab} for "<span className="font-medium">{query}</span>"
              {searchIntent.styles?.length > 0 && (
                <span> · styles: {searchIntent.styles.join(', ')}</span>
              )}
            </p>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'searching...' : `${results.length} ${tab} found`}
          </p>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className={
            view === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card rounded-lg p-4">
                <Skeleton className="w-full h-48 rounded-lg mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground/40 tracking-wide mb-2">
              {query ? `no ${tab} found for "${query}"` : `no ${tab} available`}
            </p>
            <p className="text-xs text-muted-foreground/30 tracking-wide">
              try different search terms or filters
            </p>
          </div>
        ) : (
          <div className={
            view === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {results.map((result) => {
              if (tab === 'pieces') {
                return (
                  <ListingCard
                    key={result.id}
                    listing={result}
                    onView={(listing) => window.open(`/listings/${listing.id}`, '_self')}
                  />
                );
              }
              
              // Handle creators and collections result cards here
              return (
                <div key={result.id} className="bg-card rounded-lg p-4 border border-border/40">
                  <p className="text-sm text-foreground">{result.title || result.name}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{result.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}