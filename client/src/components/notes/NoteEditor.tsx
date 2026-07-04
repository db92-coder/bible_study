import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNode, TYPE_COLORS } from '../../lib/graphApi';
import { noteAnchorLabel, type Note, type NoteInput } from '../../lib/notesApi';
import { VerseAnchorPicker, type VerseAnchor } from './VerseAnchorPicker';

interface NoteEditorProps {
  note: Note | null; // null = new note
  initialAnchor?: VerseAnchor;
  initialTitle?: string;
  dark: boolean;
  saving: boolean;
  onSave: (input: NoteInput) => void;
  onDelete?: () => void;
}

export function NoteEditor({ note, initialAnchor, initialTitle, dark, saving, onSave, onDelete }: NoteEditorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [addingToGraph, setAddingToGraph] = useState(false);
  const [anchor, setAnchor] = useState<VerseAnchor>({
    book: null,
    chapter: null,
    verse_start: null,
    verse_end: null,
  });

  useEffect(() => {
    setTitle(note?.title ?? initialTitle ?? '');
    setBody(note?.body_md ?? '');
    setTagsText(note?.tags.join(', ') ?? '');
    setAnchor(
      note
        ? { book: note.book, chapter: note.chapter, verse_start: note.verse_start, verse_end: note.verse_end }
        : (initialAnchor ?? { book: null, chapter: null, verse_start: null, verse_end: null }),
    );
  }, [note, initialAnchor, initialTitle]);

  async function addToGraph() {
    const anchorRef = noteAnchorLabel({
      book: anchor.book,
      chapter: anchor.chapter,
      verse_start: anchor.verse_start,
      verse_end: anchor.verse_end,
    });
    const type = anchorRef ? 'verse' : 'idea';
    setAddingToGraph(true);
    try {
      await createNode({
        label: title.trim() || anchorRef || 'Note',
        type,
        body_md: body,
        verse_ref: anchorRef,
        color: TYPE_COLORS[type],
      });
      navigate('/graph');
    } finally {
      setAddingToGraph(false);
    }
  }

  function handleSave() {
    onSave({
      title: title.trim(),
      body_md: body,
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 20),
      ...anchor,
    });
  }

  return (
    <div className="flex h-full flex-col gap-3" data-color-mode={dark ? 'dark' : 'light'}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title…"
        className="rounded-lg border border-parchment-300 bg-white px-3 py-2 font-display text-lg outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
      />

      <VerseAnchorPicker anchor={anchor} onChange={setAnchor} />

      <div className="min-h-0 flex-1">
        <MDEditor
          value={body}
          onChange={(v) => setBody(v ?? '')}
          height="100%"
          preview="live"
          visibleDragbar={false}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="tags, comma, separated"
          className="flex-1 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
        />
        <button
          onClick={addToGraph}
          disabled={addingToGraph || (!title.trim() && !body.trim() && !anchor.book)}
          title="Create a knowledge-graph node from this note"
          className="rounded-lg border border-parchment-300 px-3 py-1.5 text-sm text-teal transition hover:border-gold disabled:opacity-50 dark:border-parchment-700 dark:text-gold-soft"
        >
          {addingToGraph ? 'Adding…' : 'Add to graph'}
        </button>
        {note && onDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || (!title.trim() && !body.trim())}
          className="rounded-lg bg-teal px-4 py-1.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
        >
          {saving ? 'Saving…' : note ? 'Save changes' : 'Create note'}
        </button>
      </div>
    </div>
  );
}
