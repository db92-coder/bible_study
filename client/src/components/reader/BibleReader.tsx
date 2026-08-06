import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findBook, GENRE_INFO, parseOsisRef } from '../../data/books';
import { api } from '../../lib/api';
import { useGenealogyNames } from '../../lib/genealogyApi';
import { autoLinkVersesToThemes, createNode, TYPE_COLORS } from '../../lib/graphApi';
import { useNotes } from '../../lib/notesApi';
import { useReaderStore } from '../../stores/useReaderStore';
import { PersonPopup } from './PersonPopup';
import { SelectionPopup } from './SelectionPopup';
import { VerseRenderer, type NameMatcher, type Verse } from './VerseRenderer';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
  const { book, chapter, version, selection, lastTapped, clearSelection, goToAdjacentChapter, setLocation } =
    useReaderStore();
  const navigate = useNavigate();
  const [showGenreHelp, setShowGenreHelp] = useState(false);
  const genre = findBook(book) ? GENRE_INFO[findBook(book)!.genre] : null;
  const passageRef = useRef<HTMLParagraphElement>(null);
  const [openPerson, setOpenPerson] = useState<{ id: string; anchor: HTMLElement } | null>(null);

  useEffect(() => setOpenPerson(null), [book, chapter]);

  const genealogyNames = useGenealogyNames();
  const nameMatcher = useMemo<NameMatcher | null>(() => {
    const names = genealogyNames.data;
    if (!names || names.length === 0) return null;
    const idByName = new Map(names.map((n) => [n.name, n.id]));
    const sorted = [...idByName.keys()].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${sorted.map(escapeRegex).join('|')})\\b`);
    return { pattern, idByName };
  }, [genealogyNames.data]);

  const chapterNotes = useNotes({ book, chapter });
  const notedVerses = useMemo(() => {
    const set = new Set<number>();
    for (const n of chapterNotes.data ?? []) {
      if (n.verse_start == null) continue;
      for (let v = n.verse_start; v <= (n.verse_end ?? n.verse_start); v++) set.add(v);
    }
    return set;
  }, [chapterNotes.data]);

  async function addSelectionToGraph() {
    if (!selection) return;
    const range =
      selection.end !== selection.start ? `${selection.start}–${selection.end}` : `${selection.start}`;
    const ref = `${book} ${chapter}:${range}`;
    const text = data?.verses
      .filter((v) => v.verse >= selection.start && v.verse <= selection.end)
      .map((v) => v.text)
      .join(' ')
      .slice(0, 380);
    const node = await createNode({
      label: ref,
      type: 'verse',
      body_md: '',
      verse_ref: ref,
      color: TYPE_COLORS.verse,
    });
    try {
      await autoLinkVersesToThemes([{ nodeId: node.id, ref, text }]);
    } catch {
      /* non-fatal */
    }
    navigate('/graph');
  }

  const crossrefs = useQuery({
    queryKey: ['crossrefs', book, chapter],
    queryFn: async () =>
      (
        await api.get<{ refs: Record<number, string[]> }>(
          `/crossrefs/${encodeURIComponent(book)}/${chapter}`,
        )
      ).data.refs,
    staleTime: Infinity,
  });

  const selectionRefs = useMemo(() => {
    if (!selection || !crossrefs.data) return [];
    const seen = new Set<string>();
    const out: Array<{ osis: string; label: string; book: string; chapter: number }> = [];
    for (let v = selection.start; v <= selection.end && out.length < 10; v++) {
      for (const osis of crossrefs.data[v] ?? []) {
        if (seen.has(osis) || out.length >= 10) continue;
        seen.add(osis);
        const parsed = parseOsisRef(osis);
        if (parsed) out.push({ osis, label: parsed.label, book: parsed.book, chapter: parsed.chapter });
      }
    }
    return out;
  }, [selection, crossrefs.data]);

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
        <div>
          <h2 className="font-display text-4xl">
            {book} <span className="text-gold">{chapter}</span>
          </h2>
          {genre && (
            <button
              onClick={() => setShowGenreHelp((s) => !s)}
              title="How do I read this kind of writing?"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white transition hover:opacity-85"
              style={{ backgroundColor: genre.color }}
            >
              {genre.label}
              <span className="opacity-75">?</span>
            </button>
          )}
        </div>
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

      {showGenreHelp && genre && (
        <div className="mb-6 rounded-lg border p-4 text-sm leading-relaxed" style={{ borderColor: genre.color, backgroundColor: `${genre.color}14` }}>
          <p>
            <strong>Reading {genre.label.toLowerCase()}:</strong> {genre.howToRead}
          </p>
          <button
            onClick={() => navigate(`/learn?lesson=${genre.lessonSlug}`)}
            className="mt-2 text-xs font-medium text-teal hover:underline dark:text-gold-soft"
          >
            Full lesson →
          </button>
        </div>
      )}

      {selection && (
        <SelectionPopup
          containerRef={passageRef}
          anchorVerse={lastTapped ?? selection.end}
          label={`${book} ${chapter}:${selection.start}${selection.end !== selection.start ? `–${selection.end}` : ''}`}
          onNote={newNoteFromSelection}
          onGraph={addSelectionToGraph}
          onDevotional={() =>
            navigate(
              `/devotional?book=${encodeURIComponent(book)}&chapter=${chapter}&vs=${selection.start}&ve=${selection.end}`,
            )
          }
          onClear={clearSelection}
          crossRefs={selectionRefs}
          onSelectRef={setLocation}
        />
      )}

      {isLoading && <ChapterSkeleton />}
      {isError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load this chapter: {error instanceof Error ? error.message : 'unknown error'}
        </p>
      )}
      {data && (
        <>
          <p ref={passageRef} className="font-display text-lg leading-8">
            {data.verses.map((v) => (
              <VerseRenderer
                key={v.verse}
                verse={v}
                hasNote={notedVerses.has(v.verse)}
                nameMatcher={nameMatcher}
                onNameClick={(id, anchor) => setOpenPerson({ id, anchor })}
              />
            ))}
          </p>
          {data.copyright && (
            <p className="mt-10 border-t border-parchment-300 pt-4 text-xs leading-relaxed text-ink-faint dark:border-parchment-700">
              {data.copyright}
            </p>
          )}
        </>
      )}

      {openPerson && (
        <PersonPopup
          anchor={openPerson.anchor}
          personId={openPerson.id}
          onSelectPerson={(id) => setOpenPerson((cur) => (cur ? { ...cur, id } : cur))}
          onClose={() => setOpenPerson(null)}
        />
      )}
    </article>
  );
}
