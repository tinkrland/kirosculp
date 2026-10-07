// areas you can toggle onto — world is the default view.
// centers/zooms follow the wandery atlas pattern; selecting an area
// flies the map and fits its pins.

export interface AreaConfig {
  key: string;
  label: string;
  center: [number, number];
  zoom: number;
  blurb: string;
}

export const AREAS: AreaConfig[] = [
  { key: 'world',         label: 'world',            center: [22, 10],  zoom: 2,   blurb: 'the whole roster, drawn quietly' },
  { key: 'north_america', label: 'north america',   center: [44, -97], zoom: 3.5, blurb: 'boreal forests, plains, and three federations' },
  { key: 'europe',        label: 'europe',           center: [51, 10],  zoom: 3.5, blurb: 'a peninsula folded into many republics' },
  { key: 'west_asia_mena',label: 'west asia / mena', center: [28, 38],  zoom: 4,   blurb: 'west asia threaded through north africa' },
  { key: 'latam',         label: 'latam',            center: [-18, -60],zoom: 3,   blurb: 'andes spine, amazon basin, southern cone' },
  { key: 'south_asia',    label: 'south asia',      center: [23, 80],  zoom: 4.5, blurb: 'the subcontinent and its strict corridors' },
  { key: 'asia_pacific',  label: 'asia pacific',    center: [-8, 150], zoom: 3,   blurb: 'an archipelago the size of an ocean' },
  { key: 'southeast_asia',label: 'southeast asia',   center: [10, 113], zoom: 4.5, blurb: 'strait cities and highland towns' },
  { key: 'africa',        label: 'africa',           center: [2, 20],   zoom: 3.5, blurb: 'fifty-four sovereignties along old caravan lines' },
];

export const AREA_ORDER = [
  'world', 'north_america', 'europe', 'west_asia_mena', 'latam',
  'south_asia', 'asia_pacific', 'southeast_asia', 'africa',
];

export const areaByKey = (key: string): AreaConfig =>
  AREAS.find(a => a.key === key) ?? AREAS[0];
