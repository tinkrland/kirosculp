// follows + creator lists section on the buyer dashboard.
//
// shows accounts the buyer follows and any custom lists they've made
// (e.g. "wedding rings"). lists can be private or unlisted; unlisted
// lists expose a copyable share link backed by /list/:token. works for
// authed buyers (supabase) and demo/guest buyers (localStorage).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Lock, Eye, Plus, Share2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getFollows,
  getLists,
  createList,
  updateList,
  deleteList,
  removeCreatorFromList,
  toggleFollow,
} from "@/lib/followStore";
import { toast } from "@/components/ui/use-toast";

export default function FollowsAndLists() {
  const [follows, setFollows] = useState([]);
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState("");

  const refresh = async () => {
    setFollows(await getFollows());
    setLists(await getLists());
  };

  useEffect(() => {
    refresh();
    const sync = () => refresh();
    window.addEventListener("follows-updated", sync);
    return () => window.removeEventListener("follows-updated", sync);
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    await createList({ name: newName.trim() });
    setNewName("");
    refresh();
  };

  const setVisibility = async (l, visibility) => {
    await updateList(l.id, { visibility });
    refresh();
  };

  const copyShare = (l) => {
    const url = `${window.location.origin}/list/${l.share_token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "share link copied", description: url, duration: 2000 });
  };

  const removeList = async (l) => {
    if (!confirm(`delete "${l.name}"?`)) return;
    await deleteList(l.id);
    refresh();
  };

  return (
    <div className="space-y-12">
      {/* followed creators */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-muted-foreground/60" />
          <h2 className="text-sm tracking-widest uppercase text-muted-foreground/60">following</h2>
        </div>
        {follows.length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wide">
            tap "follow" on any creator's store to keep tabs on them.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {follows.map((f) => (
              <div key={f.id || f.creator_handle} className="inline-flex items-center gap-2 bg-card border border-border/50 rounded-full pl-3 pr-1 py-1">
                <Link to={`/shop/${f.creator_handle}`} className="text-xs lowercase tracking-wide text-foreground hover:underline">
                  @{f.creator_handle}
                </Link>
                <button
                  onClick={async () => { await toggleFollow(f.creator_handle); refresh(); }}
                  className="w-5 h-5 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
                  aria-label={`unfollow ${f.creator_handle}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* creator lists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm tracking-widest uppercase text-muted-foreground/60">your creator lists</h2>
        </div>

        <div className="flex gap-2 max-w-md">
          <Input
            placeholder='new list name (e.g. "wedding rings")'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            className="text-sm"
          />
          <Button onClick={create} className="rounded-full text-xs tracking-wider">
            <Plus className="w-3.5 h-3.5 mr-1" /> create
          </Button>
        </div>

        {lists.length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wide">
            no lists yet. group creators by what they make - like "everyday earrings" or "wedding rings".
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lists.map((l) => (
              <div key={l.id} className="bg-card rounded-[16px] border border-border/50 p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm tracking-wide text-foreground lowercase truncate">{l.name}</p>
                    <p className="text-[11px] text-muted-foreground/60 tracking-wide">
                      {(l.items || []).length} creator{(l.items || []).length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeList(l)}
                    className="text-muted-foreground/60 hover:text-destructive"
                    aria-label="delete list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(l.items || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(l.items || []).map((it) => (
                      <div key={it.id || it.creator_handle} className="inline-flex items-center gap-1 bg-secondary rounded-full pl-2 pr-1 py-0.5">
                        <Link to={`/shop/${it.creator_handle}`} className="text-[11px] lowercase tracking-wide text-foreground hover:underline">
                          @{it.creator_handle}
                        </Link>
                        <button
                          onClick={async () => { await removeCreatorFromList(l.id, it.creator_handle); refresh(); }}
                          className="w-4 h-4 rounded-full hover:bg-background flex items-center justify-center text-muted-foreground"
                          aria-label="remove"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <button
                    onClick={() => setVisibility(l, l.visibility === "private" ? "unlisted" : "private")}
                    className="inline-flex items-center gap-1.5 text-[11px] tracking-wider lowercase text-muted-foreground hover:text-foreground"
                  >
                    {l.visibility === "unlisted"
                      ? (<><Eye className="w-3 h-3" /> unlisted</>)
                      : (<><Lock className="w-3 h-3" /> private</>)}
                  </button>
                  {l.visibility === "unlisted" && l.share_token && (
                    <button
                      onClick={() => copyShare(l)}
                      className="ml-auto inline-flex items-center gap-1.5 text-[11px] tracking-wider lowercase text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="w-3 h-3" />
                      copy share link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
