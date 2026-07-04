import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { api } from '../lib/api';
import { autoLinkVersesToThemes, createEdge, createNode, TYPE_COLORS } from '../lib/graphApi';
import { useReaderStore } from '../stores/useReaderStore';

interface SearchResult {
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  label: string;
  why: string | null;
  text: string | null;
}

type Mode = 'topical' | 'text';

export default function Search() {
  const navigate = useNavigate();
  const setLocation = useReaderStore((s) => s.setLocation);

  const [mode, setMode] = useState<Mode>('topical');
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicLabel, setTopicLabel] = useState('');
  const [planting, setPlanting] = useState(false);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const path = mode === 'topical' ? '/search/topical' : '/search/text';
      const { data } = await api.get<{ results: SearchResult[] }>(
        `${path}?q=${encodeURIComponent(q)}`,
      );
      setResults(data.results);
      setChecked(new Set(data.results.map((r) => r.label)));
      setSearched(q);
      setTopicLabel(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function toggle(label: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  async function plantInGraph() {
    const selected = results.filter((r) => checked.has(r.label));
    const topic = topicLabel.trim() || searched;
    if (selected.length === 0 || !topic || planting) return;
    setPlanting(true);
    try {
      const theme = await createNode({
        label: topic,
        type: 'theme',
        body_md: `Verses gathered from a Scribe search for **${searched}**.`,
        verse_ref: null,
        color: TYPE_COLORS.theme,
      });
      const planted: Array<{ nodeId: string; ref: string; text?: string | null }> = [];
      for (const r of selected) {
        const verseNode = await createNode({
          label: r.label,
          type: 'verse',
          body_md: [r.text ? `> ${r.text}` : null, r.why].filter(Boolean).join('\n\n'),
          verse_ref: r.label,
          color: TYPE_COLORS.verse,
        });
        await createEdge(theme.id, verseNode.id, topic);
        planted.push({ nodeId: verseNode.id, ref: r.label, text: r.text });
      }
      // Cross-link the new verses to the user's other themes (best-effort).
      try {
        await autoLinkVersesToThemes(planted, [theme.id]);
      } catch {
        /* non-fatal */
      }
      navigate('/graph');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add to graph');
    } finally {
      setPlanting(false);
    }
  }

  const selectedCount = results.filter((r) => checked.has(r.label)).length;

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-6 pb-28">
          <h1 className="font-display text-3xl">Search the Scriptures</h1>
          <p className="mt-1 text-sm text-ink-faint">
            Search by meaning — &ldquo;being scared&rdquo;, &ldquo;food and eating&rdquo;,
            &ldquo;forgiving someone who hurt you&rdquo; — or by exact words. Then gather what you
            find into your knowledge graph.
          </p>

          <form onSubmit={runSearch} className="mt-5">
            <div className="flex overflow-hidden rounded-lg border border-parchment-300 text-sm dark:border-parchment-700">
              {(
                [
                  ['topical', 'By meaning'],
                  ['text', 'Exact words'],
                ] as Array<[Mode, string]>
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`flex-1 px-3 py-2 font-medium transition sm:flex-none sm:px-4 ${
                    mode === value
                      ? 'bg-parchment-200 text-ink dark:bg-parchment-700 dark:text-ink-invert'
                      : 'bg-white text-ink-faint hover:text-ink-soft dark:bg-parchment-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === 'topical' ? 'What are you looking for? e.g. being scared' : 'Word or phrase, e.g. shepherd'
                }
                className="min-w-0 flex-1 rounded-xl border border-parchment-300 bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="rounded-xl bg-teal px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
              >
                Search
              </button>
            </div>
          </form>

          {loading && (
            <div className="mt-6">
              {mode === 'topical' && (
                <p className="text-xs italic text-ink-faint">
                  Searching the whole counsel of Scripture — this takes a few seconds the first
                  time…
                </p>
              )}
              <div className="mt-3 animate-pulse space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          {!loading && results.length > 0 && (
            <ul className="mt-6 space-y-3">
              {results.map((r) => (
                <li
                  key={r.label}
                  className="flex items-start gap-3 rounded-xl border border-parchment-300 bg-white p-4 dark:border-parchment-700 dark:bg-parchment-800"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(r.label)}
                    onChange={() => toggle(r.label)}
                    className="mt-1.5 h-4 w-4 accent-gold"
                    aria-label={`Include ${r.label}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-display text-lg">{r.label}</span>
                      <button
                        onClick={() => {
                          setLocation(r.book, r.chapter);
                          navigate('/');
                        }}
                        className="text-xs font-medium text-teal hover:underline dark:text-gold-soft"
                      >
                        Read →
                      </button>
                    </div>
                    {r.text && (
                      <p className="mt-1 font-display text-sm leading-relaxed">“{r.text}”</p>
                    )}
                    {r.why && <p className="mt-1.5 text-xs italic text-ink-faint">{r.why}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <p className="mt-6 text-sm text-ink-faint">
              Nothing found for “{searched}” — try different words
              {mode === 'text' ? ', or switch to searching by meaning' : ''}.
            </p>
          )}
        </div>

        {/* Plant-in-graph bar */}
        {results.length > 0 && !loading && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-parchment-300 bg-parchment-50/95 backdrop-blur dark:border-parchment-700 dark:bg-parchment-800/95">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 p-3">
              <span className="text-xs text-ink-faint">Topic label:</span>
              <input
                value={topicLabel}
                onChange={(e) => setTopicLabel(e.target.value)}
                className="w-40 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
              />
              <button
                onClick={plantInGraph}
                disabled={planting || selectedCount === 0 || !topicLabel.trim()}
                className="ml-auto rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
              >
                {planting
                  ? 'Planting…'
                  : `Add ${selectedCount} verse${selectedCount === 1 ? '' : 's'} to graph`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
