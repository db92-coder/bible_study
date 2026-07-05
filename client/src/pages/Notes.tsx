import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { NoteEditor } from '../components/notes/NoteEditor';
import { NoteList } from '../components/notes/NoteList';
import type { VerseAnchor } from '../components/notes/VerseAnchorPicker';
import { useNoteMutations, useNotes, type Note, type NoteInput } from '../lib/notesApi';
import { useThemeStore } from '../stores/useThemeStore';

export default function Notes() {
  const dark = useThemeStore((s) => s.dark);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const notesQuery = useNotes();
  const { create, update, remove } = useNoteMutations();

  const [selected, setSelected] = useState<Note | null>(null);
  const [creating, setCreating] = useState(searchParams.get('new') === '1');
  const [search, setSearch] = useState('');

  const initialAnchor = useMemo<VerseAnchor>(
    () => ({
      book: searchParams.get('book'),
      chapter: searchParams.get('chapter') ? Number(searchParams.get('chapter')) : null,
      verse_start: searchParams.get('vs') ? Number(searchParams.get('vs')) : null,
      verse_end: searchParams.get('ve') ? Number(searchParams.get('ve')) : null,
    }),
    [searchParams],
  );

  const notes = notesQuery.data ?? [];
  const filtered = search
    ? notes.filter((n) =>
        `${n.title} ${n.body_md} ${n.tags.join(' ')} ${n.book ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : notes;

  const saving = create.isPending || update.isPending;

  async function handleSave(input: NoteInput) {
    if (selected) {
      const note = await update.mutateAsync({ id: selected.id, ...input });
      setSelected(note);
    } else {
      const note = await create.mutateAsync(input);
      setSelected(note);
      setCreating(false);
      setSearchParams({}, { replace: true });
    }
  }

  async function handleDelete() {
    if (!selected) return;
    await remove.mutateAsync(selected.id);
    setSelected(null);
  }

  const editorVisible = creating || selected !== null;

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <div className="flex min-h-0 flex-1">
        <aside
          className={`${editorVisible ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r border-parchment-300 bg-parchment-50 md:w-96 dark:border-parchment-700 dark:bg-parchment-800`}
        >
          <div className="flex items-center gap-2 border-b border-parchment-300 p-3 dark:border-parchment-700">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="min-w-0 flex-1 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
            />
            <button
              onClick={() => navigate('/devotional')}
              title="Write a guided devotional"
              className="shrink-0 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
            >
              🕊 Devotional
            </button>
            <button
              onClick={() => {
                setSelected(null);
                setCreating(true);
              }}
              className="shrink-0 rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
            >
              + New
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {notesQuery.isLoading ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
                ))}
              </div>
            ) : (
              <NoteList
                notes={filtered}
                selectedId={selected?.id ?? null}
                onSelect={(n) => {
                  setSelected(n);
                  setCreating(false);
                }}
              />
            )}
          </div>
        </aside>

        <main className={`${editorVisible ? 'block' : 'hidden md:block'} min-w-0 flex-1 p-5`}>
          {editorVisible ? (
            <>
              <button
                onClick={() => {
                  setSelected(null);
                  setCreating(false);
                  setSearchParams({}, { replace: true });
                }}
                className="mb-3 text-sm text-ink-faint hover:underline md:hidden"
              >
                ← All notes
              </button>
              <NoteEditor
              key={selected?.id ?? 'new'}
              note={selected}
              initialAnchor={initialAnchor}
              initialTitle={searchParams.get('title') ?? undefined}
              dark={dark}
              saving={saving}
              onSave={handleSave}
              onDelete={selected ? handleDelete : undefined}
            />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="font-display text-2xl text-ink-faint">Your study notes</p>
                <p className="mt-2 text-sm text-ink-faint">
                  Select a note on the left, or press <kbd className="rounded border border-parchment-300 px-1.5 dark:border-parchment-700">n</kbd> anywhere in the reader to start one.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
