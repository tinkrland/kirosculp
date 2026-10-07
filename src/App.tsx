import { useMemo, useState } from 'react';
import MapView from '@/map/MapView';
import AreaRail, { countByArea } from '@/components/AreaRail';
import AccountCard from '@/components/AccountCard';
import { ACCOUNTS, type Account } from '@/data/accounts';
import { areaByKey } from '@/data/areas';

// area can be deep-linked via ?area=<key> (e.g. ?area=europe)
function initialArea(): string {
  const key = new URLSearchParams(window.location.search).get('area');
  return key && areaByKey(key) ? key : 'world';
}

export default function App() {
  const [area, setArea] = useState(initialArea);
  const [picked, setPicked] = useState<Account | null>(null);

  const config = areaByKey(area);
  const counts = useMemo(() => countByArea(ACCOUNTS), []);

  const visible = useMemo(() => {
    if (area === 'world') return ACCOUNTS;
    return ACCOUNTS.filter(a => a.area === area);
  }, [area]);

  const unplaced = useMemo(() => ACCOUNTS.filter(a => a.latitude == null).length, []);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);

  const selectArea = (key: string) => {
    setArea(key);
    setPicked(null);
    const c = areaByKey(key);
    setFlyTarget({ center: c.center, zoom: c.zoom });
  };

  return (
    <div className="atlas">
      <MapView
        accounts={visible}
        initialCenter={[22, 10]}
        initialZoom={2}
        flyTarget={flyTarget}
        mode={area === 'world' ? 'world' : 'area'}
        onMarkerClick={(acc) => setPicked(acc)}
        onMapClick={() => setPicked(null)}
      />

      {/* atmospheric vignette */}
      <div aria-hidden className="vignette" />

      {/* top center brand */}
      <div className="top-brand">roster atlas</div>

      {/* top-left meta */}
      <div className="top-meta">
        <div className="top-meta-eyebrow">atlas · {config.label}</div>
        <div className="top-meta-blurb">{config.blurb}</div>
        <div className="top-meta-count">
          {visible.filter(a => a.latitude != null).length} pinned
          {area === 'world' && <> · {unplaced} unplaced (region tbd)</>}
        </div>
      </div>

      {/* left rail: area toggles */}
      <AreaRail active={area} counts={counts} onSelect={selectArea} />

      {/* right: account card */}
      {picked && <AccountCard account={picked} onClose={() => setPicked(null)} />}

      {/* bottom-right legend */}
      <div className="legend">
        <span className="legend-dot" style={{ background: '#C87088' }} /> artist
        <span className="legend-dot" style={{ background: '#A888C4' }} /> buyer
      </div>
    </div>
  );
}
