import { useEffect, useRef, useState } from 'react';
import type { Account } from '@/data/accounts';
import { makeIcon } from '@/map/pins';

interface Props {
  accounts: Account[];
  mode: 'world' | 'area';
  initialCenter?: [number, number];
  initialZoom?: number;
  flyTarget: { center: [number, number]; zoom: number } | null;
  onMarkerClick: (account: Account, x: number, y: number) => void;
  onMapClick: () => void;
}

// CartoDB Voyager nolabels (warm beige land) — tinted dusty-rose via CSS filter in index.css.
// CARTO now requires an api key for basemaps — set VITE_CARTO_API_KEY in .env (see .env.example).
const CARTO_KEY = (import.meta as any).env?.VITE_CARTO_API_KEY ?? '';
const TILE_VOYAGER = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'
  + (CARTO_KEY ? `?api_key=${CARTO_KEY}` : '');

// area name labels over the pale basemap, ported from wandery's AtlasMap:
// world mode -> big continent labels; area mode -> country labels from world.geo.json.
const CONTINENTS: { name: string; pos: [number, number] }[] = [
  { name: 'north america', pos: [46, -100] },
  { name: 'south america', pos: [-15, -60] },
  { name: 'europe',         pos: [54, 18] },
  { name: 'africa',         pos: [3, 22] },
  { name: 'asia',           pos: [46, 95] },
  { name: 'oceania',        pos: [-25, 140] },
  { name: 'antarctica',     pos: [-78, 0] },
];

// vendored copy of johan/world.geo.json — no github fetch at runtime
const COUNTRIES_URL = '/data/world.geo.json';
let countriesPromise: Promise<any> | null = null;
function loadCountries() {
  if (!countriesPromise) {
    countriesPromise = fetch(COUNTRIES_URL).then(r => r.json()).catch(() => null);

  }
  return countriesPromise;
}

// rough centroid from a GeoJSON feature (avg of the largest outer ring) — wandery's method
function featureCentroid(feat: any): [number, number] | null {
  const g = feat?.geometry; if (!g) return null;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : null;
  if (!polys) return null;
  let best: any[] = []; let bestLen = 0;
  polys.forEach((p: any) => { const ring = p[0] || []; if (ring.length > bestLen) { bestLen = ring.length; best = ring; } });
  if (!best.length) return null;
  let x = 0; let y = 0;
  best.forEach(([lng, lat]: number[]) => { x += lng; y += lat; });
  return [y / best.length, x / best.length];
}

// leaflet loads from CDN, no npm dependency — same loader pattern as fabnet/wandery.
let leafletReady = false;
const readyCallbacks: (() => void)[] = [];

function ensureLeaflet(cb: () => void) {
  if (leafletReady) { cb(); return; }
  readyCallbacks.push(cb);
  if (document.querySelector('#leaflet-js')) return;
  // vendored copies in public/vendor — no unpkg CDN at runtime
  const link = document.createElement('link');
  link.id = 'leaflet-css'; link.rel = 'stylesheet';
  link.href = '/vendor/leaflet.css';
  document.head.appendChild(link);
  const script = document.createElement('script'); script.id = 'leaflet-js';
  script.src = '/vendor/leaflet.js';
  script.onload = () => { leafletReady = true; readyCallbacks.forEach(fn => fn()); readyCallbacks.length = 0; };
  document.head.appendChild(script);
}

export default function MapView({ accounts, mode, initialCenter, initialZoom, flyTarget, onMarkerClick, onMapClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const labelsRef = useRef<any>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMapClickRef = useRef(onMapClick);
  const [leafletLoaded, setLeafletLoaded] = useState(leafletReady);

  useEffect(() => { onMarkerClickRef.current = onMarkerClick; }, [onMarkerClick]);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  useEffect(() => {
    ensureLeaflet(() => {
      setLeafletLoaded(true);
      if (mapRef.current || !containerRef.current) return;
      const L = (window as any).L;
      const map = L.map(containerRef.current, {
        center: initialCenter ?? [22, 10],
        zoom: initialZoom ?? 2,
        zoomControl: false,
        worldCopyJump: true,
        zoomSnap: 0.25,
        wheelPxPerZoomLevel: 140,
        inertia: true,
      });
      L.tileLayer(TILE_VOYAGER, {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 10,
      }).addTo(map);
      map.on('click', () => onMapClickRef.current());
      mapRef.current = map;
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // labels layer — continents in world mode, countries in area mode (wandery style)
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;
    if ((labelsRef as any).current) { (labelsRef as any).current.remove(); (labelsRef as any).current = null; }
    const group = L.layerGroup();
    if (mode === 'world') {
      CONTINENTS.forEach(({ name, pos }) => {
        L.marker(pos, {
          interactive: false,
          icon: L.divIcon({ className: 'at-continent-label', html: `<span>${name}</span>`, iconSize: [0, 0] }),
        }).addTo(group);
      });
      group.addTo(map);
      (labelsRef as any).current = group;
    } else {
      loadCountries().then((data: any) => {
        if (!data || !mapRef.current) return;
        data.features.forEach((feat: any) => {
          const c = featureCentroid(feat);
          const name = feat.properties?.name;
          if (!c || !name) return;
          L.marker(c, {
            interactive: false,
            icon: L.divIcon({ className: 'at-country-label', html: `<span>${name}</span>`, iconSize: [0, 0] }),
          }).addTo(group);
        });
        group.addTo(map);
        (labelsRef as any).current = group;
      });
    }
    return () => { if ((labelsRef as any).current) { (labelsRef as any).current.remove(); (labelsRef as any).current = null; } };
  }, [mode, leafletLoaded]);

  // fly when the area selection changes
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !flyTarget) return;
    mapRef.current.flyTo(flyTarget.center, flyTarget.zoom, { duration: 1.6, easeLinearity: 0.25 });
  }, [flyTarget, leafletLoaded]);

  // re-render pins when the filtered account list changes
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    accounts.forEach(acc => {
      if (acc.latitude == null || acc.longitude == null) return;
      const marker = L.marker([acc.latitude, acc.longitude], { icon: makeIcon(L, acc.kind) });
      marker.bindTooltip(
        `<div class="fab-tt-name">${acc.name}</div><div class="fab-tt-type">${acc.kind} · ${acc.region.replace(/_/g, ' ')}</div>`,
        { direction: 'top', offset: [0, -52], className: 'fab-hover-tooltip', sticky: false }
      );
      marker.on('click', (e: any) => {
        e.originalEvent?.stopPropagation();
        const pt = map.latLngToContainerPoint([acc.latitude, acc.longitude]);
        onMarkerClickRef.current(acc, pt.x, pt.y);
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [accounts, leafletLoaded]);

  return <div ref={containerRef} className="w-full h-full" />;
}
