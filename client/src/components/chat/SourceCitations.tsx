import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOOKS, findBook } from '../../data/books';
import { useChatStore } from '../../stores/useChatStore';
import { useReaderStore } from '../../stores/useReaderStore';

// Matches "John 3:16", "1 Corinthians 13:4-7", "Song of Solomon 2:1"…
const bookAlternation = [...BOOKS.map((b) => b.name), 'Psalm']
  .sort((a, b) => b.length - a.length)
  .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
const REF_REGEX = new RegExp(`\\b(${bookAlternation})\\s+(\\d{1,3})(?::(\\d{1,3}))?`, 'g');

interface Citation {
  label: string;
  book: string;
  chapter: number;
}

export function extractCitations(text: string): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const m of text.matchAll(REF_REGEX)) {
    const rawBook = m[1] === 'Psalm' ? 'Psalms' : m[1];
    const info = findBook(rawBook);
    if (!info) continue;
    const chapter = Math.min(Number(m[2]), info.chapters);
    const key = `${info.name}.${chapter}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label: `${info.name} ${chapter}${m[3] ? `:${m[3]}` : ''}`, book: info.name, chapter });
    if (out.length >= 8) break;
  }
  return out;
}

export function SourceCitations({ text }: { text: string }) {
  const citations = useMemo(() => extractCitations(text), [text]);
  const setLocation = useReaderStore((s) => s.setLocation);
  const setOpen = useChatStore((s) => s.setOpen);
  const navigate = useNavigate();

  if (citations.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {citations.map((c) => (
        <button
          key={c.label}
          onClick={() => {
            setLocation(c.book, c.chapter);
            setOpen(false);
            navigate('/');
          }}
          title={`Open ${c.label} in the reader`}
          className="rounded-md border border-parchment-300 bg-white px-2 py-0.5 font-display text-xs text-teal transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-gold-soft"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
