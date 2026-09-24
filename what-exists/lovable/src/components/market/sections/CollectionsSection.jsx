// collections section
//
// lets a creator group their artifacts into named collections (e.g. "spring 26",
// "wearables", "limited drops"). each collection has a slug used in the public
// url /shop/<handle>/c/<slug>. ownership is enforced by an rls policy that
// matches the creator's auth.uid against creator_profiles.username.
//
// note: market accounts that haven't claimed a creator_profile won't pass
// the rls owner check, so we surface a friendly hint in that case.

import { db } from '@/lib/db';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, FolderOpen, Save, Link as LinkIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { slugify, uniqueSlug } from '@/lib/slug';

export default function CollectionsSection({ handle }) {
  const queryClient = useQueryClient();
  const [draftName, setDraftName] = useState('');

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections', handle],
    queryFn: () => db.entities.Collection.filter({ creator_handle: handle }, 'sort_order', 100),
    initialData: [],
    enabled: !!handle,
  });

  const { data: artifactsForCounts } = useQuery({
    queryKey: ['market-artifacts', handle],
    queryFn: () => db.entities.Artifact.filter({ creator_handle: handle }, '-created_date', 200),
    initialData: [],
    enabled: !!handle,
  });

  const countFor = (collectionId) =>
    artifactsForCounts.filter((a) => a.collection_id === collectionId).length;

  const createMutation = useMutation({
    mutationFn: async () => {
      const name = draftName.trim();
      if (!name) throw new Error('name required');
      const base = slugify(name) || 'collection';
      const slug = uniqueSlug(base, collections.map((c) => c.slug));
      return db.entities.Collection.create({
        creator_handle: handle,
        name,
        slug,
        sort_order: collections.length,
      });
    },
    onSuccess: () => {
      setDraftName('');
      queryClient.invalidateQueries({ queryKey: ['collections', handle] });
      toast.success('collection created');
    },
    onError: (err) => toast.error(err?.message || 'could not create collection'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light tracking-wide lowercase text-foreground">collections</h1>
        <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">
          group your artifacts into themed sets, each gets its own url
        </p>
      </div>

      {/* create new */}
      <div className="bg-card rounded-[18px] border border-border/50 p-5 space-y-4">
        <Label className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">new collection</Label>
        <div className="flex gap-3">
          <Input
            placeholder="e.g. spring 26"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide flex-1"
          />
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !draftName.trim()}
            className="rounded-full px-4 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> create
          </Button>
        </div>
        {draftName && (
          <p className="text-[11px] text-muted-foreground/50 tracking-wide">
            url preview: /shop/{handle}/c/<span className="text-foreground/70">{slugify(draftName) || 'collection'}</span>
          </p>
        )}
      </div>

      {/* list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-[14px]" />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-card rounded-[18px] border border-dashed border-border/60 p-10 text-center">
          <FolderOpen className="w-5 h-5 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground/40 tracking-wide">no collections yet</p>
          <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">create one above to start grouping artifacts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => (
            <CollectionRow
              key={col.id}
              collection={col}
              handle={handle}
              count={countFor(col.id)}
              onChanged={() => queryClient.invalidateQueries({ queryKey: ['collections', handle] })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionRow({ collection, handle, count, onChanged }) {
  const [form, setForm] = useState({
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? '',
  });
  const [editing, setEditing] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () =>
      db.entities.Collection.update(collection.id, {
        name: form.name,
        slug: slugify(form.slug) || collection.slug,
        description: form.description,
      }),
    onSuccess: () => {
      toast.success('collection saved');
      setEditing(false);
      onChanged?.();
    },
    onError: (err) => toast.error(err?.message || 'could not save'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => db.entities.Collection.delete(collection.id),
    onSuccess: () => {
      toast.success('collection deleted');
      onChanged?.();
    },
    onError: (err) => toast.error(err?.message || 'could not delete'),
  });

  return (
    <div className="bg-card rounded-[14px] border border-border/50 px-5 py-4 space-y-3">
      <div className="flex items-center gap-3">
        <FolderOpen className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm tracking-wide text-foreground lowercase truncate">{collection.name}</p>
          <p className="text-[11px] text-muted-foreground/50 tracking-wide flex items-center gap-1">
            <LinkIcon className="w-2.5 h-2.5" />
            /shop/{handle}/c/{collection.slug}
          </p>
        </div>
        <span className="text-[11px] tracking-wider text-muted-foreground/50 px-2.5 py-0.5 rounded-full bg-secondary">
          {count} {count === 1 ? 'artifact' : 'artifacts'}
        </span>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-[11px] tracking-wider text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {editing ? 'close' : 'edit'}
        </button>
        <button
          onClick={() => {
            if (confirm(`delete "${collection.name}"? artifacts will not be deleted, just unassigned.`)) {
              deleteMutation.mutate();
            }
          }}
          className="text-muted-foreground/30 hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {editing && (
        <div className="space-y-3 pt-3 border-t border-border/40">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="rounded-xl bg-background border-border/50 text-sm tracking-wide"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="rounded-xl bg-background border-border/50 text-sm tracking-wide font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="rounded-xl bg-background border-border/50 text-sm tracking-wide min-h-[60px]"
              placeholder="optional, shown on the collection page"
            />
          </div>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="rounded-full px-4 py-3 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? 'saving...' : 'save'}
          </Button>
        </div>
      )}
    </div>
  );
}
