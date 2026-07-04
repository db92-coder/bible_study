import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BibleMap } from '../components/map/BibleMap';
import { EraTimelineSlider } from '../components/map/EraTimelineSlider';
import { PlaceCard } from '../components/map/PlaceCard';
import { TopBar } from '../components/layout/TopBar';
import { api } from '../lib/api';
import { useReaderStore } from '../stores/useReaderStore';

export interface Place {
  name: string;
  modern_name: string | null;
  lat: number;
  lon: number;
  verse_refs: string[];
  era: string;
  description: string;
}

export interface Journey {
  name: string;
  color: string;
  refs: string;
  stops: Array<{ name: string; lat: number; lon: number }>;
}

type Scope = 'book' | 'all';

export default function MapPage() {
  const book = useReaderStore((s) => s.book);
  const [scope, setScope] = useState<Scope>('book');
  const [era, setEra] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const placesQuery = useQuery({
    queryKey: ['places', scope === 'book' ? book : null, era],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (scope === 'book') params.set('book', book);
      if (era !== 'All') params.set('era', era);
      return (await api.get<{ places: Place[] }>(`/places?${params}`)).data.places;
    },
    staleTime: 5 * 60_000,
  });

  const journeysQuery = useQuery({
    queryKey: ['journeys', book],
    queryFn: async () =>
      (await api.get<{ journeys: Journey[] }>(`/places/journeys/${encodeURIComponent(book)}`)).data
        .journeys,
    staleTime: Infinity,
  });

  const places = placesQuery.data ?? [];
  const journeys = (scope === 'book' && journeysQuery.data) || [];

  // Deep link from the reader's chapter place chips: /map?place=Name
  useEffect(() => {
    const wanted = searchParams.get('place');
    if (!wanted || places.length === 0) return;
    const match = places.find((p) => p.name === wanted);
    if (match) {
      setSelectedPlace(match);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, places, setSearchParams]);

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <div className="relative flex-1 overflow-hidden">
        <BibleMap
          places={places}
          journeys={journeys}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
        />

        {/* Scope toggle */}
        <div className="pointer-events-auto absolute left-4 top-4 flex overflow-hidden rounded-xl border border-parchment-300 shadow-lg dark:border-parchment-700">
          {(
            [
              ['book', book],
              ['all', 'All places'],
            ] as Array<[Scope, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setScope(value);
                setSelectedPlace(null);
              }}
              className={`px-3.5 py-2 text-sm font-medium transition ${
                scope === value
                  ? 'bg-teal text-white dark:bg-gold dark:text-parchment-900'
                  : 'bg-parchment-50/95 text-ink-soft backdrop-blur hover:bg-parchment-100 dark:bg-parchment-800/95 dark:text-ink-invert dark:hover:bg-parchment-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Place info card */}
        {selectedPlace && (
          <div className="pointer-events-none absolute left-4 top-16 z-10">
            <PlaceCard place={selectedPlace} onClose={() => setSelectedPlace(null)} />
          </div>
        )}

        {/* Journey legend */}
        {journeys.length > 0 && (
          <div className="pointer-events-auto absolute right-4 top-16 hidden rounded-xl border border-parchment-300 bg-parchment-50/95 px-4 py-3 shadow-lg backdrop-blur md:block dark:border-parchment-700 dark:bg-parchment-800/95">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Journeys
            </h4>
            <ul className="mt-2 space-y-1.5">
              {journeys.map((j) => (
                <li key={j.name} className="flex items-center gap-2 text-xs">
                  <span className="h-0.5 w-5 rounded" style={{ backgroundColor: j.color }} />
                  <span>{j.name}</span>
                  <span className="text-ink-faint">({j.refs})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Era slider */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
          <EraTimelineSlider
            era={era}
            onChange={(next) => {
              setEra(next);
              setSelectedPlace(null);
            }}
          />
        </div>

        {/* Loading shimmer */}
        {placesQuery.isLoading && (
          <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-gold" />
        )}
      </div>
    </div>
  );
}
