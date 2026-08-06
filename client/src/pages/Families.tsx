import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FamilyTreeGraph } from '../components/families/FamilyTreeGraph';
import { TopBar } from '../components/layout/TopBar';
import { findBook } from '../data/books';
import { useElementSize } from '../hooks/useElementSize';
import { api } from '../lib/api';
import { useFamilyTree, useGenealogySearch, usePersonFamily, type PersonSummary } from '../lib/genealogyApi';
import { useReaderStore } from '../stores/useReaderStore';
import { useThemeStore } from '../stores/useThemeStore';

const SUGGESTED_STARTS = ['Adam', 'Noah', 'Abraham', 'Jacob', 'Aaron', 'Moses'];

function parseVerseRef(ref: string): { book: string; chapter: number } | null {
  const m = ref.trim().match(/^((?:[123] )?[A-Za-z ]+?)\s+(\d+)/);
  if (!m) return null;
  const book = findBook(m[1].trim());
  if (!book) return null;
  return { book: book.name, chapter: Math.min(Number(m[2]), book.chapters) };
}

export default function Families() {
  const dark = useThemeStore((s) => s.dark);
  const setLocation = useReaderStore((s) => s.setLocation);
  const navigate = useNavigate();
  const { ref: canvasBox, width, height } = useElementSize<HTMLDivElement>();

  const [rootId, setRootId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const searchResults = useGenealogySearch(search);
  const tree = useFamilyTree(rootId);
  const selected = usePersonFamily(rootId);
  const person = selected.data?.person ?? null;
  const parents = selected.data?.parents ?? [];
  const children = selected.data?.children ?? [];

  async function jumpToName(name: string) {
    const res = await api.get<{ results: PersonSummary[] }>(`/genealogy/search?q=${encodeURIComponent(name)}`);
    const exact = res.data.results.find((r) => r.name === name) ?? res.data.results[0];
    if (exact) {
      setRootId(exact.id);
      setSearch('');
    }
  }

  function openReference(ref: string) {
    const parsed = parseVerseRef(ref);
    if (!parsed) return;
    setLocation(parsed.book, parsed.chapter);
    navigate('/read');
  }

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />

      <div className="flex flex-wrap items-center gap-2 border-b border-parchment-300 bg-parchment-50 px-4 py-2 dark:border-parchment-700 dark:bg-parchment-800">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a person…"
            className="w-48 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold sm:w-64 dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
          />
          {search.trim().length >= 2 && searchResults.data && searchResults.data.length > 0 && (
            <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border border-parchment-300 bg-white shadow-xl dark:border-parchment-700 dark:bg-parchment-800">
              {searchResults.data.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRootId(r.id);
                    setSearch('');
                  }}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-parchment-100 dark:hover:bg-parchment-700"
                >
                  {r.name}
                  {r.source_ref && <span className="ml-1.5 text-xs text-ink-faint">{r.source_ref}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SUGGESTED_STARTS.map((name) => (
            <button
              key={name}
              onClick={() => jumpToName(name)}
              className="rounded-full border border-parchment-300 bg-white px-2.5 py-1 text-xs font-medium text-ink-soft transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
            >
              {name}
            </button>
          ))}
        </div>
        <span className="ml-auto hidden text-xs text-ink-faint md:block">
          click a person to re-center the tree on them
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div ref={canvasBox} className="min-w-0 flex-1">
          {rootId === null ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-sm text-center">
                <p className="font-display text-2xl text-ink-faint">Explore a family</p>
                <p className="mt-2 text-sm text-ink-faint">
                  Search for someone, or pick a starting point above, to see how they connect to the rest of
                  Scripture's families.
                </p>
              </div>
            </div>
          ) : tree.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">
              Loading family tree…
            </div>
          ) : tree.isError ? (
            <div className="flex h-full items-center justify-center text-sm text-red-700">
              Couldn't load this family tree.
            </div>
          ) : (
            tree.data &&
            width > 0 && (
              <FamilyTreeGraph
                tree={tree.data}
                width={width}
                height={height}
                dark={dark}
                rootId={rootId}
                search={search}
                onSelect={setRootId}
              />
            )
          )}
        </div>

        {person && (
          <aside className="absolute inset-y-0 right-0 z-10 w-full max-w-80 overflow-y-auto border-l border-parchment-300 bg-parchment-50 p-4 shadow-xl md:static md:shrink-0 md:shadow-none dark:border-parchment-700 dark:bg-parchment-800">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-xl">{person.name}</h2>
              <button
                onClick={() => setRootId(null)}
                aria-label="Close"
                className="rounded p-0.5 text-ink-faint hover:bg-parchment-200 dark:hover:bg-parchment-700"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {person.source_ref && (
              <button
                onClick={() => openReference(person.source_ref!)}
                className="mt-1 text-xs text-teal hover:underline dark:text-gold-soft"
              >
                Read {person.source_ref} →
              </button>
            )}

            {parents.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Parents</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {parents.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setRootId(p.id)}
                      className="rounded-md border border-parchment-300 bg-white px-2 py-0.5 font-display text-sm text-teal transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-gold-soft"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {children.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Children</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {children.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setRootId(p.id)}
                      className="rounded-md border border-parchment-300 bg-white px-2 py-0.5 font-display text-sm text-teal transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-gold-soft"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
