// follow + "save to list" controls used on shop profile pages.
//
// works for both authed buyers (persisted to supabase) and demo/guest
// users (persisted to localStorage). lets buyers organize creators into
// themed lists like "wedding rings", "everyday earrings", etc.

import { useEffect, useState } from "react";
import { Heart, Plus, Check, Bookmark, Share2, Lock, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  isFollowing,
  toggleFollow,
  getLists,
  createList,
  addCreatorToList,
  removeCreatorFromList,
} from "@/lib/followStore";

export default function FollowButton({ creatorHandle, creatorName }) {
  const [following, setFollowing] = useState(false);
  const [lists, setLists] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const refresh = async () => {
    setFollowing(await isFollowing(creatorHandle));
    setLists(await getLists());
  };

  useEffect(() => {
    refresh();
    const sync = () => refresh();
    window.addEventListener("follows-updated", sync);
    return () => window.removeEventListener("follows-updated", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorHandle]);

  const onFollow = async () => {
    const now = await toggleFollow(creatorHandle);
    setFollowing(now);
    toast({ title: now ? `following ${creatorName || creatorHandle}` : "unfollowed", duration: 1500 });
  };

  const inList = (l) => (l.items || []).some((it) => it.creator_handle === creatorHandle);

  const toggleInList = async (l) => {
    if (inList(l)) await removeCreatorFromList(l.id, creatorHandle);
    else await addCreatorToList(l.id, creatorHandle);
    refresh();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const l = await createList({ name: newName.trim() });
    await addCreatorToList(l.id, creatorHandle);
    setNewName("");
    setCreating(false);
    refresh();
    toast({ title: `added to "${l.name}"`, duration: 1500 });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onFollow}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] tracking-wider lowercase border transition-all ${
          following
            ? "bg-foreground text-background border-foreground"
            : "bg-card text-foreground border-border/60 hover:border-foreground/40"
        }`}
      >
        <Heart className={`w-3 h-3 ${following ? "fill-current" : ""}`} />
        {following ? "following" : "follow"}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] tracking-wider lowercase border border-border/60 bg-card text-foreground hover:border-foreground/40 transition-all">
            <Bookmark className="w-3 h-3" />
            save to list
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs lowercase tracking-wide">your creator lists</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {lists.length === 0 && !creating && (
            <p className="px-2 py-3 text-[11px] text-muted-foreground tracking-wide lowercase">no lists yet</p>
          )}
          <div className="max-h-56 overflow-auto">
            {lists.map((l) => (
              <DropdownMenuItem
                key={l.id}
                onSelect={(e) => { e.preventDefault(); toggleInList(l); }}
                className="text-xs lowercase justify-between"
              >
                <span className="flex items-center gap-2 truncate">
                  {l.visibility === "unlisted" ? <Eye className="w-3 h-3 text-muted-foreground" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
                  <span className="truncate">{l.name}</span>
                </span>
                {inList(l) && <Check className="w-3.5 h-3.5 text-foreground" />}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          {creating ? (
            <div className="p-2 space-y-2">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. wedding rings"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-8 text-xs"
              />
              <div className="flex gap-1">
                <Button size="sm" className="h-7 text-[11px] flex-1" onClick={handleCreate}>create + add</Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setCreating(false)}>cancel</Button>
              </div>
            </div>
          ) : (
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCreating(true); }} className="text-xs lowercase">
              <Plus className="w-3.5 h-3.5 mr-2" />
              new list
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
