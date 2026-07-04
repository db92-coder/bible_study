import type { FeatureCollection } from 'geojson';
import maplibregl, { Map as MLMap, type GeoJSONSource, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { Journey, Place } from '../../pages/Map';

export const ERA_COLORS: Record<string, string> = {
  Patriarchs: '#8b5e34',
  'Exodus & Conquest': '#2f6f6a',
  Kingdom: '#b48a3c',
  'Exile & Return': '#7a4a8b',
  'New Testament': '#8b3a3a',
};

const PARCHMENT_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    base: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a> · Places: <a href="https://www.openbible.info/geo/">OpenBible.info</a> (CC-BY)',
    },
  },
  layers: [{ id: 'base', type: 'raster', source: 'base' }],
};

// Cycled through to give journey lines a marching-ants motion.
const DASH_PHASES = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 0.5, 3, 3.5],
];

function placesToGeoJSON(places: Place[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places.map((p, idx) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: { idx, name: p.name, era: p.era },
    })),
  };
}

interface BibleMapProps {
  places: Place[];
  journeys: Journey[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
}

export function BibleMap({ places, journeys, selectedPlace, onSelectPlace }: BibleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const placesRef = useRef(places);
  const journeyLayerIds = useRef<string[]>([]);
  const dashTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ready, setReady] = useState(false);
  placesRef.current = places;

  // Init once
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: PARCHMENT_STYLE,
      center: [35.5, 33.5],
      zoom: 5.2,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('places', { type: 'geojson', data: placesToGeoJSON(placesRef.current) });

      const eraColor: unknown = [
        'match',
        ['get', 'era'],
        ...Object.entries(ERA_COLORS).flat(),
        '#6b6b6b',
      ];

      map.addLayer({
        id: 'places-circles',
        type: 'circle',
        source: 'places',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 8, 6.5],
          'circle-color': eraColor as never,
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': '#f6f1e7',
        },
      });
      map.addLayer({
        id: 'places-selected',
        type: 'circle',
        source: 'places',
        filter: ['==', ['get', 'name'], ''],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 7, 8, 12],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#b48a3c',
        },
      });
      map.addLayer({
        id: 'places-labels',
        type: 'symbol',
        source: 'places',
        minzoom: 6.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#2b2118',
          'text-halo-color': '#f6f1e7',
          'text-halo-width': 1.2,
        },
      });

      map.on('click', 'places-circles', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const idx = feature.properties?.idx as number;
        const place = placesRef.current[idx];
        if (place) onSelectPlace(place);
      });
      map.on('click', (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: ['places-circles'] });
        if (hits.length === 0) onSelectPlace(null);
      });
      map.on('mouseenter', 'places-circles', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'places-circles', () => (map.getCanvas().style.cursor = ''));

      setReady(true);
    });

    return () => {
      if (dashTimer.current) clearInterval(dashTimer.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker data + fit bounds when the place set changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource('places') as GeoJSONSource).setData(placesToGeoJSON(places));

    if (places.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      for (const p of places) bounds.extend([p.lon, p.lat]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 7.5, duration: 1400 });
    }
  }, [places, ready]);

  // Journey routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    for (const id of journeyLayerIds.current) {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    }
    journeyLayerIds.current = [];
    if (dashTimer.current) {
      clearInterval(dashTimer.current);
      dashTimer.current = null;
    }
    if (journeys.length === 0) return;

    journeys.forEach((j, i) => {
      const lineId = `journey-line-${i}`;
      const stopsId = `journey-stops-${i}`;
      map.addSource(lineId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: j.stops.map((s) => [s.lon, s.lat]) },
          properties: {},
        },
      });
      map.addSource(stopsId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: j.stops.map((s) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
            properties: { name: s.name },
          })),
        },
      });
      map.addLayer(
        {
          id: lineId,
          type: 'line',
          source: lineId,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': j.color, 'line-width': 2.5, 'line-dasharray': DASH_PHASES[0] },
        },
        'places-circles',
      );
      map.addLayer(
        {
          id: stopsId,
          type: 'circle',
          source: stopsId,
          paint: {
            'circle-radius': 3.5,
            'circle-color': j.color,
            'circle-stroke-width': 1.2,
            'circle-stroke-color': '#f6f1e7',
          },
        },
        'places-circles',
      );
      journeyLayerIds.current.push(lineId, stopsId);
    });

    let phase = 0;
    dashTimer.current = setInterval(() => {
      phase = (phase + 1) % DASH_PHASES.length;
      for (const id of journeyLayerIds.current) {
        if (id.startsWith('journey-line-') && mapRef.current?.getLayer(id)) {
          mapRef.current.setPaintProperty(id, 'line-dasharray', DASH_PHASES[phase]);
        }
      }
    }, 120);
  }, [journeys, ready]);

  // Selection highlight + flyTo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setFilter('places-selected', ['==', ['get', 'name'], selectedPlace?.name ?? '']);
    if (selectedPlace) {
      map.flyTo({
        center: [selectedPlace.lon, selectedPlace.lat],
        zoom: Math.max(map.getZoom(), 7.5),
        speed: 1.1,
        essential: true,
      });
    }
  }, [selectedPlace, ready]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full [&_.maplibregl-canvas]:[filter:sepia(0.35)_saturate(0.8)_brightness(1.02)] dark:[&_.maplibregl-canvas]:[filter:sepia(0.3)_saturate(0.75)_brightness(0.82)]"
    />
  );
}
