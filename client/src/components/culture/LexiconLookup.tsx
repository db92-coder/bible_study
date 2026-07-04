import { useState } from 'react';
import { useLexiconSearch } from '../../lib/lexiconApi';
import { HebrewWordCard } from './HebrewWordCard';

export function LexiconLookup() {
  const [query, setQuery] = useState('');
  const search = useLexiconSearch(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the lexicon — a word (love, shepherd), transliteration (hesed), or Strong's number (H2617, G26)…"
        className="w-full rounded-xl border border-parchment-300 bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert"
      />

      {search.isFetching && (
        <div className="mt-4 grid animate-pulse gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-40 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
          ))}
        </div>
      )}

      {search.data && search.data.length === 0 && (
        <p className="mt-4 text-sm text-ink-faint">
          Nothing found — try a transliteration (e.g. “shalom”) or a Strong's number (e.g. “H7965”).
        </p>
      )}

      {search.data && search.data.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {search.data.map((w) => (
            <HebrewWordCard key={w.id} word={w} expanded />
          ))}
        </div>
      )}
    </div>
  );
}
