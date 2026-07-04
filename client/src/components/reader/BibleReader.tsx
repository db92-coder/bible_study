import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useNotes } from '../../lib/notesApi';
import { useReaderStore } from '../../stores/useReaderStore';
import { VerseRenderer, type Verse } from './VerseRenderer';

interface ChapterContent {
  version: string;
  book: string;
  chapter: number;
  verses: Verse[];
  copyright?: string;
}

function ChapterSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-parchment-200 dark:bg-parchment-700"
          style={{ width: `${85 - (i % 4) * 10}%` }}
        />
      ))}
    </div>
  );
}

export function BibleReader() {
  const { book, chapter, version, selection, clearSelection, goToAdjacentChapter } =
    useReaderStore();
  const navigate = useNavigate();

  const chapterNotes = useNotes({ book, chapter });
  const notedVerses = useMemo(() => {
    const set = new Set<number>();
    for (const n of chapterNotes.data ?? []) {
      if (n.verse_start == null) continue;
      for (let v = n.verse_start; v <= (n.verse_end ?? n.verse_start); v++) set.add(v);
    }
    return set;
  }, [chapterNotes.data]);

  function newNoteFromSelection() {
    const params = new URLSearchParams({ new: '1', book, chapter: String(chapter) });
    if (selection) {
      params.set('vs', String(selection.start));
      params.set('ve', String(selection.end));
    }
    navigate(`/notes?${params}`);
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['scripture', version, book, chapter],
    queryFn: async () =>
      (
        await api.get<ChapterContent>(
          `/scripture/${encodeURIComponent(version)}/${encodeURIComponent(book)}/${chapter}`,
        )
      ).data,
  });

  return (
    <article className="mx-auto max-w-[70ch] px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-4xl">
          {book} <span className="text-gold">{chapter}</span>
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => goToAdjacentChapter(-1)}
            title="Previous chapter (k)"
            className="rounded-lg border border-parchment-300 px-3 py-1 text-sm text-ink-soft transition hover:bg-parchment-200 dark:border-parchment-700 dark:text-ink-invert dark:hover:bg-parchment-700"
          >
            ←
          </button>
          <button
            onClick={() => goToAdjacentChapter(1)}
            title="Next chapter (j)"
            className="rounded-lg border border-parchment-300 px-3 py-1 text-sm text-ink-soft transition hover:bg-parchment-200 dark:border-parchment-700 dark:text-ink-invert dark:hover:bg-parchment-700"
          >
            →
          </button>
        </div>
      </header>

      {selection && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-gold-soft bg-gold-soft/20 px-4 py-2 text-sm">
          <span>
            Selected: <strong>
              {book} {chapter}:{selection.start}
              {selection.end !== selection.start ? `–${selection.end}` : ''}
            </strong>{' '}
            <span className="text-ink-faint">(shift-click to extend)</span>
          </span>
          <span className="flex gap-3">
            <button
              onClick={newNoteFromSelection}
              className="font-medium text-teal hover:underline dark:text-gold-soft"
            >
              Add note (n)
            </button>
            <button onClick={clearSelection} className="text-ink-faint hover:underline">
              Clear
            </button>
          </span>
        </div>
      )}

      {isLoading && <ChapterSkeleton />}
      {isError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load this chapter: {error instanceof Error ? error.message : 'unknown error'}
        </p>
      )}
      {data && (
        <>
          <p className="font-display text-lg leading-8">
            {data.verses.map((v) => (
              <VerseRenderer key={v.verse} verse={v} hasNote={notedVerses.has(v.verse)} />
            ))}
          </p>
          {data.copyright && (
            <p className="mt-10 border-t border-parchment-300 pt-4 text-xs leading-relaxed text-ink-faint dark:border-parchment-700">
              {data.copyright}
            </p>
          )}
        </>
      )}
    </article>
  );
}
