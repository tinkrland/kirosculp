// inbox of commission requests for a creator.
//
// reads from the commission_requests table for live creators, and from
// localStorage for the demo sandbox. presents them as a simple list
// with name / budget / timeline summary plus an expandable detail panel.

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Mail, Clock, ChevronRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDemoRequestsForHandle, deleteDemoRequest } from "@/lib/demoSandbox";

export default function CommissionRequestsSection({ handle, isDemo = false }) {
  const queryClient = useQueryClient();
  const [demoTick, setDemoTick] = useState(0);
  void demoTick; // re-render trigger only

  // re-read demo storage when other tabs / forms update it
  useEffect(() => {
    if (!isDemo) return;
    const sync = () => setDemoTick((t) => t + 1);
    window.addEventListener("demo-sandbox-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("demo-sandbox-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [isDemo]);

  const { data: liveRequests = [] } = useQuery({
    queryKey: ["commission-requests", handle],
    queryFn: () => db.entities.CommissionRequest.filter({ creator_handle: handle }, "-created_at", 100),
    enabled: !!handle && !isDemo,
  });

  const requests = isDemo ? getDemoRequestsForHandle(handle) : liveRequests;

  const removeDemo = (id) => {
    deleteDemoRequest(id);
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-light tracking-wide lowercase text-foreground">commissions</h1>
        <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">
          {requests.length === 0 ? "no requests yet" : `${requests.length} request${requests.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card rounded-[18px] border border-border/50 p-10 text-center">
          <Mail className="w-6 h-6 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm tracking-wide text-muted-foreground/60">no commission requests yet</p>
          <p className="text-[12px] text-muted-foreground/40 tracking-wide mt-1">
            share <span className="font-mono">/shop/{handle}/commission</span> to start receiving requests
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <RequestRow key={req.id} req={req} onDelete={isDemo ? () => removeDemo(req.id) : null} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestRow({ req, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-[18px] border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-muted-foreground/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm tracking-wide text-foreground truncate">{req.customer_name}</p>
            <Badge variant="outline" className="text-[10px] tracking-wider rounded-full border-border/60">
              {req.status}
            </Badge>
          </div>
          <p className="text-[12px] text-muted-foreground/60 tracking-wide truncate">{req.customer_email}</p>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          {req.budget && <p className="text-sm tracking-wide text-foreground">${req.budget}</p>}
          {req.timeline && <p className="text-[11px] text-muted-foreground/60 tracking-wide">{req.timeline}</p>}
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground/40 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border/40 p-5 space-y-4 bg-background/40">
          <Block label="intended use" value={req.intended_use} />
          <Block label="description" value={req.description} multiline />
          {Array.isArray(req.reference_urls) && req.reference_urls.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-1">references</p>
              <ul className="space-y-1">
                {req.reference_urls.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-xs text-foreground underline tracking-wide break-all">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {req.answers && Object.keys(req.answers).length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-1">answers</p>
              <div className="space-y-1">
                {Object.entries(req.answers).map(([id, val]) => (
                  <p key={id} className="text-xs tracking-wide text-foreground">
                    <span className="text-muted-foreground/60">{id}: </span>{val}
                  </p>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="text-[11px] text-muted-foreground/50 tracking-wide flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(req.created_at).toLocaleString()}
            </span>
            {onDelete && (
              <Button onClick={onDelete} size="sm" variant="ghost"
                className="text-[11px] text-muted-foreground/60 hover:text-foreground gap-1.5">
                <Trash2 className="w-3 h-3" /> remove
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Block({ label, value, multiline }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-1">{label}</p>
      <p className={`text-xs tracking-wide text-foreground ${multiline ? "whitespace-pre-line leading-relaxed" : ""}`}>
        {value}
      </p>
    </div>
  );
}
