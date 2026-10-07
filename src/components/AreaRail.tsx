import { AREAS } from '@/data/areas';
import type { Account } from '@/data/accounts';

interface Props {
  active: string;
  counts: Record<string, number>;
  onSelect: (key: string) => void;
}

export default function AreaRail({ active, counts, onSelect }: Props) {
  return (
    <div className="area-rail">
      {AREAS.map(a => {
        const on = a.key === active;
        const n = counts[a.key] ?? 0;
        return (
          <button
            key={a.key}
            className={`area-chip${on ? ' on' : ''}`}
            onClick={() => onSelect(a.key)}
          >
            <span className="area-chip-label">{a.label}</span>
            <span className="area-chip-count">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

export function countByArea(accounts: Account[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of accounts) {
    if (a.latitude == null) continue;
    if (a.area) counts[a.area] = (counts[a.area] ?? 0) + 1;
    counts.world = (counts.world ?? 0) + 1;
  }
  return counts;
}
