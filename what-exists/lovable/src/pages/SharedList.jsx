// public shared creator list (read-only).
//
// reachable via /list/:token. unlisted lists can be opened by anyone
// who has the link; private lists return a not-found message.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Lock, Heart } from "lucide-react";
import { getListByToken } from "@/lib/followStore";
import { supabase } from "@/integrations/supabase/client";
import SeoTags from "@/components/seo/SeoTags";

export default function SharedList() {
  const { token } = useParams();
  const [list, setList] = useState(null);
  const [creators, setCreators] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const l = await getListByToken(token);
      setList(l);
      if (l?.items?.length) {
        const handles = l.items.map((it) => it.creator_handle);
        const { data } = await supabase
          .from("market_accounts")
          .select("handle, display_name, avatar_url, store_heading")
          .in("handle", handles);
        const map = {};
        (data || []).forEach((m) => { map[m.handle] = m; });
        setCreators(map);
      }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return <div className="px-6 py-20 text-center text-sm text-muted-foreground">loading list...</div>;
  }

  if (!list || list.visibility === "private") {
    return (
      <div className="px-6 py-20 text-center max-w-md mx-auto">
        <Lock className="w-6 h-6 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground tracking-wide">this list isn't public, or the link is invalid.</p>
        <Link to="/explore" className="text-xs text-foreground hover:underline tracking-wider mt-4 inline-block">
          back to explore
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-4xl mx-auto">
      <SeoTags title={`${list.name} - a creator list on sculptura`} description={list.description || ""} />
      <p className="text-[11px] tracking-widest uppercase text-muted-foreground/60 mb-2">a creator list</p>
      <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight lowercase text-foreground mb-2">
        {list.name}
      </h1>
      {list.description && (
        <p className="text-sm text-muted-foreground tracking-wide mb-8 max-w-2xl">{list.description}</p>
      )}

      {(list.items || []).length === 0 ? (
        <p className="text-sm text-muted-foreground tracking-wide">no creators in this list yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.items.map((it) => {
            const c = creators[it.creator_handle];
            return (
              <Link
                key={it.id || it.creator_handle}
                to={`/shop/${it.creator_handle}`}
                className="bg-card rounded-[16px] border border-border/50 p-4 flex items-center gap-3 hover:shadow-paper transition"
              >
                <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                  {c?.avatar_url && <img src={c.avatar_url} alt={c.display_name || it.creator_handle} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground lowercase tracking-wide truncate">{c?.display_name || it.creator_handle}</p>
                  <p className="text-[11px] text-muted-foreground tracking-wide truncate">@{it.creator_handle}</p>
                  {it.note && <p className="text-[11px] text-muted-foreground/70 tracking-wide truncate mt-0.5">{it.note}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
