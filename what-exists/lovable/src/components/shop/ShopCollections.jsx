// collections strip on a creator's public store
//
// shows the creator's collections as a horizontal list of cards that link
// out to the per-collection page. hidden when there are no collections so
// the layout stays clean for solo-artifact stores.

import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';

export default function ShopCollections({ username, collections }) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">collections</p>
      <div className="flex flex-wrap gap-3">
        {collections.map((c) => (
          <Link
            key={c.id}
            to={`/shop/${username}/c/${c.slug}`}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/60 hover:border-foreground/30 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            <span className="text-xs tracking-wider lowercase text-foreground">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
