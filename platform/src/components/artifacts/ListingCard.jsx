import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit, MoreHorizontal, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ListingCard({ listing, onEdit, onView, onDelete }) {
  const [loading, setLoading] = useState(false);

  // Listing references a release, not raw artifact data
  const release = listing.release;
  
  return (
    <div className="bg-card rounded-[16px] border border-border/40 p-4 hover:border-border/60 transition-colors">
      <div className="flex gap-4">
        {/* Preview */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
          {release?.preview_url ? (
            <img 
              src={release.preview_url} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
              <Package className="w-6 h-6 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium tracking-wide text-foreground lowercase truncate">
                {listing.title}
              </h3>
              <p className="text-xs text-muted-foreground/60 tracking-wide mt-0.5">
                release {release?.id?.substring(0, 8)}... · {listing.variants?.length || 0} variants
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(listing)}>
                  <Eye className="w-4 h-4 mr-2" />
                  view public listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(listing)}>
                  <Edit className="w-4 h-4 mr-2" />
                  edit listing
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(listing)}
                  className="text-red-600"
                >
                  <Package className="w-4 h-4 mr-2" />
                  remove listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and metrics */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                listing.status === 'published' ? 'bg-green-500' : 
                listing.status === 'draft' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`} />
              <span className="text-xs text-muted-foreground/60 tracking-wide">
                {listing.status}
              </span>
            </div>
            
            {listing.scheduled_publish_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground/60 tracking-wide">
                  scheduled
                </span>
              </div>
            )}
            
            {listing.server_price && (
              <span className="text-sm font-light text-foreground ml-auto">
                from ${listing.server_price}
              </span>
            )}
          </div>

          {/* Available variants preview */}
          {listing.variants && listing.variants.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {listing.variants.slice(0, 3).map((variant, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-secondary/60 px-2 py-0.5 rounded-md text-muted-foreground"
                >
                  {variant}
                </span>
              ))}
              {listing.variants.length > 3 && (
                <span className="text-xs text-muted-foreground/40">
                  +{listing.variants.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}