// shop artifact page (slug-based)
//
// resolves an artifact by (creator_handle, slug) instead of by uuid. lets
// creators have human, seo-friendly urls like /shop/kai/signet-01. once
// the artifact is loaded we render the existing detail layout from
// ArtifactDetail by passing the resolved id through the url.
//
// rather than duplicate the whole layout, we redirect to /artifact/<id>
// once the slug resolves. that keeps visual behavior 1:1 with the legacy
// route. the seo tags are injected here so crawlers see them on the slug.

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import SeoTags from '@/components/seo/SeoTags';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopArtifactBySlug() {
  const { username, slug } = useParams();
  const navigate = useNavigate();

  const { data: artifact, isLoading, isError } = useQuery({
    queryKey: ['shop-artifact-slug', username, slug],
    queryFn: () =>
      db.entities.Artifact.filter({ creator_handle: username, slug }).then((r) => r?.[0] ?? null),
    enabled: !!username && !!slug,
  });

  useEffect(() => {
    if (artifact?.id) {
      // hand off to the existing detail page so all interactions (cart,
      // material picker, viewer) keep working unchanged.
      navigate(`/artifact/${artifact.id}`, { replace: true });
    }
  }, [artifact?.id, navigate]);

  if (isLoading) {
    return (
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <Skeleton className="aspect-square rounded-[24px] max-w-md" />
      </div>
    );
  }

  if (isError || !artifact) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground tracking-wide">artifact not found</p>
        <Link to={`/shop/${username}`} className="text-primary text-sm mt-4 inline-block tracking-wide">
          back to {username}'s store
        </Link>
      </div>
    );
  }

  return (
    <SeoTags
      title={artifact.seo_title || `${artifact.name} by ${artifact.creator_handle} - sculptura`}
      description={artifact.seo_description || artifact.description}
      image={artifact.image_url}
      canonical={`/shop/${artifact.creator_handle}/${artifact.slug}`}
      keywords={(artifact.keywords || []).join(', ')}
    />
  );
}
