import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, Eye, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReleasesOverview({ creatorId }) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReleases();
  }, [creatorId]);

  const fetchReleases = async () => {
    try {
      const response = await fetch(`/api/creators/${creatorId}/releases?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setReleases(data.releases || []);
      }
    } catch (error) {
      console.error('Failed to fetch releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'validating':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground/60" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'validating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-[18px] border border-border/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[18px] border border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-light tracking-wide lowercase text-foreground">recent releases</h3>
          <p className="text-xs text-muted-foreground/60 tracking-wide mt-1">
            validated designs ready for listing
          </p>
        </div>
        <Link to="/studio">
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="w-3 h-3 mr-1" />
            new release
          </Button>
        </Link>
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/40 tracking-wide">no releases yet</p>
          <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">
            create and validate designs in the studio
          </p>
          <Link to="/studio">
            <Button variant="outline" className="mt-4 text-xs">
              go to studio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {releases.map((release) => (
            <div key={release.id} className="flex items-center gap-4 p-3 bg-background rounded-xl border border-border/30">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                {release.preview_url ? (
                  <img 
                    src={release.preview_url} 
                    alt={`Release ${release.id.substring(0, 8)}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm tracking-wide text-foreground lowercase truncate">
                    release {release.id.substring(0, 8)}...
                  </p>
                  {getStatusIcon(release.status)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(release.status)}`}>
                    {release.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground/50">
                    {release.family} · {release.validated_metals?.length || 0} metals
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {release.status === 'validated' && !release.listing_id && (
                  <Button variant="outline" size="sm" className="text-xs">
                    create listing
                  </Button>
                )}
                {release.listing_id && (
                  <Link to={`/listings/${release.listing_id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      view listing
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
          
          {releases.length >= 5 && (
            <Link to="/console/releases">
              <Button variant="ghost" className="w-full mt-4 text-xs">
                view all releases
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}