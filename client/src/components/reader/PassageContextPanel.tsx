import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useReaderStore } from '../../stores/useReaderStore';

interface BookContext {
  book: string;
  author: string | null;
  date_written: string | null;
  location_written: string | null;
  audience: string | null;
  purpose: string | null;
  historical_setting_md: string | null;
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

export function PassageContextPanel() {
  const book = useReaderStore((s) => s.book);

  const { data, isLoading } = useQuery({
    queryKey: ['context', book],
    queryFn: async () => (await api.get<BookContext>(`/context/${encodeURIComponent(book)}`)).data,
    staleTime: Infinity,
  });

  return (
    <div className="px-5 py-6">
      <h2 className="font-display text-xl">About {book}</h2>

      {isLoading && (
        <div className="mt-4 animate-pulse space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-3 rounded bg-parchment-200 dark:bg-parchment-700" />
          ))}
        </div>
      )}

      {data && (
        <>
          <dl className="mt-4 space-y-4">
            <Field label="Author" value={data.author} />
            <Field label="Date" value={data.date_written} />
            <Field label="Written from" value={data.location_written} />
            <Field label="Audience" value={data.audience} />
            <Field label="Purpose" value={data.purpose} />
          </dl>
          {data.historical_setting_md && (
            <div className="mt-6 border-t border-parchment-300 pt-4 dark:border-parchment-700">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                Historical setting
              </h3>
              {data.historical_setting_md.split(/\n\n+/).map((para, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
