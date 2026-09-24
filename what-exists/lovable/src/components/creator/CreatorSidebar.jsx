import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Pencil, Clock, Zap, Wrench, Monitor, Users } from "lucide-react";

export default function CreatorSidebar({ creator }) {
  return (
    <div className="space-y-5">
      {/* Avatar & identity */}
      <div className="bg-card rounded-[20px] border border-border/50 shadow-paper p-6 space-y-5">
        <div className="flex items-center gap-4">
          {creator.avatar_url ? (
            <img src={creator.avatar_url} alt={creator.handle} className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-lg font-hand text-muted-foreground">
              {creator.display_name?.[0]?.toUpperCase() || creator.handle?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <h2 className="text-sm font-medium tracking-wide lowercase text-foreground">
              {creator.display_name || creator.handle}
            </h2>
            <p className="text-[11px] text-muted-foreground/60 tracking-wide">
              sculptura.shop/{creator.handle}
            </p>
          </div>
        </div>

        {creator.bio && (
          <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide">
            {creator.bio}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" disabled className="rounded-full text-[11px] tracking-wider border-border/60 gap-1.5 px-2 min-w-0">
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">message</span>
          </Button>
          <Link to={`/shop/${creator.handle}/commission`} className="min-w-0">
            <Button variant="outline" className="w-full rounded-full text-[11px] tracking-wider border-border/60 gap-1.5 px-2 min-w-0">
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">request custom</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Commission info */}
      <div className="bg-card rounded-[20px] border border-border/50 shadow-paper p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs tracking-wider text-muted-foreground/70 uppercase">commissions</h3>
          <Badge
            variant="outline"
            className={`rounded-full text-[10px] tracking-wider ${
              creator.commissions_open
                ? "border-moss text-moss"
                : "border-clay text-clay"
            }`}
          >
            {creator.commissions_open ? "open" : "closed"}
          </Badge>
        </div>

        <div className="space-y-3">
          {creator.hourly_rate && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 tracking-wide">starts at</p>
                <p className="text-sm font-medium tracking-wide text-foreground">${creator.hourly_rate}/hr</p>
              </div>
            </div>
          )}

          {creator.turnaround && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 tracking-wide">turnaround</p>
                <p className="text-sm font-medium tracking-wide text-foreground">{creator.turnaround}</p>
                {creator.rush_available && (
                  <p className="text-[10px] text-dusty-orange tracking-wide mt-0.5">rush available</p>
                )}
              </div>
            </div>
          )}

          {creator.waitlist_count > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 tracking-wide">waitlist</p>
                <p className="text-sm font-medium tracking-wide text-foreground">{creator.waitlist_count} people</p>
              </div>
            </div>
          )}

          {creator.materials_worked?.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 tracking-wide">materials</p>
                <p className="text-sm tracking-wide text-foreground">{creator.materials_worked.join(", ")}</p>
              </div>
            </div>
          )}

          {creator.software?.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 tracking-wide">software</p>
                <p className="text-sm tracking-wide text-foreground">{creator.software.join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}