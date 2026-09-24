// public collection page
//
// shows all published artifacts inside a creator's collection, addressed at
// /shop/<handle>/c/<slug>. lightweight on purpose: a header with the
// collection metadata and a grid of cards, reusing ArtifactCard.

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import ArtifactCard from '@/components/artifacts/ArtifactCard';
import { Skeleton } from '@/components/ui/skeleton';
import SeoTags from '@/components/seo/SeoTags';

export default function CollectionPage() {
  const { username, collectionSlug } = useParams();

  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ['collection', username, collectionSlug],
    queryFn: () =>
      db.entities.Collection.filter({ creator_handle: username, slug: collectionSlug }).then((r) => r?.[0] ?? null),
    enabled: !!username && !!collectionSlug,
  });

  const { data: artifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ['collection-artifacts', collection?.id],
    queryFn: () =>
      db.entities.Artifact.filter(
        { collection_id: collection.id, status: 'published' },
        '-created_date',
        50,
      ),
    initialData: [],
    enabled: !!collection?.id,
  });

  if (collectionLoading) {
    return (
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-[20px]" />)}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-2xl font-light tracking-wide text-muted-foreground/40 mb-4">collection not found</p>
        <Link to={`/shop/${username}`} className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">
          back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <SeoTags
        title={`${collection.name} - ${username} on sculptura`}
        description={collection.description || `${collection.name}, a collection by ${username} on sculptura`}
        image={collection.cover_image_url}
        canonical={`/shop/${username}/c/${collection.slug}`}
      />

      <div className="max-w-7xl mx-auto">
        <Link to={`/shop/${username}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors">
          <ArrowLeft className="w-4 h-4" />
          back to {username}'s store
        </Link>

        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/40">
            <FolderOpen className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-[11px] tracking-widest text-muted-foreground/60 uppercase">collection</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-tight lowercase text-foreground">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-sm text-muted-foreground tracking-wide font-light leading-relaxed max-w-xl">
              {collection.description}
            </p>
          )}
        </div>

        {artifactsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-[20px]" />)}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground/50 tracking-wide text-sm">no published artifacts in this collection yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artifacts.map((a) => <ArtifactCard key={a.id} artifact={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
