import { useMemo } from 'react';
import { useReaderStore } from '../../stores/useReaderStore';

export interface Verse {
  verse: number;
  text: string;
}

export interface NameMatcher {
  pattern: RegExp;
  idByName: Map<string, string>;
}

export function VerseRenderer({
  verse,
  hasNote,
  nameMatcher,
  onNameClick,
}: {
  verse: Verse;
  hasNote?: boolean;
  nameMatcher?: NameMatcher | null;
  onNameClick?: (id: string, anchor: HTMLElement) => void;
}) {
  const selection = useReaderStore((s) => s.selection);
  const selectVerse = useReaderStore((s) => s.selectVerse);
  const selected = selection !== null && verse.verse >= selection.start && verse.verse <= selection.end;

  // Splitting on a regex with one capturing group interleaves the captured
  // (known-person) substrings back into the result, so odd checks against
  // idByName below are enough to tell a name apart from ordinary text.
  const textParts = useMemo(
    () => (nameMatcher ? verse.text.split(nameMatcher.pattern) : [verse.text]),
    [verse.text, nameMatcher],
  );

  return (
    <span
      data-verse={verse.verse}
      onClick={() => selectVerse(verse.verse)}
      className={`cursor-pointer rounded px-0.5 transition-colors duration-150 ${
        selected
          ? 'bg-gold-soft/40 dark:bg-gold/30'
          : 'hover:bg-parchment-200/70 dark:hover:bg-parchment-700/60'
      }`}
    >
      <sup className="mr-1 select-none whitespace-nowrap font-sans text-[0.65em] font-semibold text-gold">
        {hasNote && (
          <span
            title="You have a note on this verse"
            className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle dark:bg-gold-soft"
          />
        )}
        {verse.verse}
      </sup>
      {textParts.map((part, i) => {
        const id = nameMatcher?.idByName.get(part);
        if (id && onNameClick) {
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNameClick(id, e.currentTarget);
              }}
              className="rounded px-0.5 underline decoration-dotted decoration-teal/60 underline-offset-2 transition hover:bg-parchment-200/70 dark:decoration-gold-soft/60 dark:hover:bg-parchment-700/60"
            >
              {part}
            </button>
          );
        }
        return part;
      })}{' '}
    </span>
  );
}
