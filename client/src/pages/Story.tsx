import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { api } from '../lib/api';
import { useReaderStore } from '../stores/useReaderStore';

interface Era {
  name: string;
  start: number;
  end: number;
  color: string;
}

interface TimelineEvent {
  id: number;
  title: string;
  year: number;
  era: string;
  scripture: string;
  refs: Array<{ book: string; chapter: number }>;
  description: string;
  significance: string;
}

// Story eras → map era-slider values (where a sensible mapping exists)
const MAP_ERA: Record<string, string> = {
  Patriarchs: 'Patriarchs',
  'Egypt & Exodus': 'Exodus & Conquest',
  Judges: 'Exodus & Conquest',
  'United Kingdom': 'Kingdom',
  'Divided Kingdom': 'Kingdom',
  Exile: 'Exile & Return',
  Return: 'Exile & Return',
  'New Testament': 'New Testament',
  'Early Church': 'New Testament',
};

function formatYear(year: number): string {
  return year < 0 ? `c. ${-year} BC` : `AD ${year}`;
}

export default function Story() {
  const navigate = useNavigate();
  const setLocation = useReaderStore((s) => s.setLocation);

  const { data, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: async () => (await api.get<{ eras: Era[]; events: TimelineEvent[] }>('/timeline')).data,
    staleTime: Infinity,
  });

  function openRef(book: string, chapter: number) {
    setLocation(book, chapter);
    navigate('/');
  }

  const eras = data?.eras ?? [];
  const events = data?.events ?? [];

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-6">
          <h1 className="font-display text-3xl">The story of the Bible</h1>
          <p className="mt-1 text-sm text-ink-faint">
            One story from creation to new creation — 49 landmark moments across eleven eras.
            Every event links into the reader; most eras link to their places on the map.
          </p>

          {/* Era jump chips */}
          <div className="sticky top-0 z-10 -mx-6 mt-4 flex gap-1.5 overflow-x-auto bg-parchment/95 px-6 py-2 backdrop-blur [scrollbar-width:none] dark:bg-parchment-900/95 [&::-webkit-scrollbar]:hidden">
            {eras.map((era) => (
              <a
                key={era.name}
                href={`#era-${era.name.replace(/\W+/g, '-')}`}
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: era.color }}
              >
                {era.name}
              </a>
            ))}
          </div>

          {isLoading && (
            <div className="mt-6 animate-pulse space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-28 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
              ))}
            </div>
          )}

          <div className="mt-6 pb-16">
            {eras.map((era) => {
              const eraEvents = events.filter((e) => e.era === era.name);
              if (eraEvents.length === 0) return null;
              const mapEra = MAP_ERA[era.name];
              return (
                <section key={era.name} id={`era-${era.name.replace(/\W+/g, '-')}`} className="scroll-mt-14">
                  <div
                    className="mt-8 flex flex-wrap items-baseline justify-between gap-2 rounded-xl px-4 py-3 text-white"
                    style={{ backgroundColor: era.color }}
                  >
                    <h2 className="font-display text-2xl">{era.name}</h2>
                    <span className="text-xs opacity-90">
                      {formatYear(era.start)} – {formatYear(era.end)}
                      {mapEra && (
                        <button
                          onClick={() => navigate(`/map?era=${encodeURIComponent(mapEra)}`)}
                          className="ml-3 rounded-full bg-white/20 px-2 py-0.5 font-medium hover:bg-white/30"
                        >
                          Places on the map →
                        </button>
                      )}
                    </span>
                  </div>

                  <ol className="relative ml-3 border-l-2 pl-6" style={{ borderColor: era.color }}>
                    {eraEvents.map((event) => (
                      <li key={event.id} className="relative pb-8 pt-6 first:pt-4">
                        <span
                          className="absolute -left-[31px] top-7 h-3 w-3 rounded-full border-2 border-parchment-50 dark:border-parchment-900"
                          style={{ backgroundColor: era.color }}
                        />
                        <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                          {formatYear(event.year)}
                        </p>
                        <h3 className="mt-0.5 font-display text-xl leading-snug">{event.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed">{event.description}</p>
                        <p className="mt-1.5 text-sm italic leading-relaxed text-ink-faint">
                          {event.significance}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {event.refs.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => openRef(r.book, r.chapter)}
                              className="rounded-md border border-parchment-300 bg-white px-2.5 py-1 font-display text-sm transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800"
                            >
                              {r.book} {r.chapter} →
                            </button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
