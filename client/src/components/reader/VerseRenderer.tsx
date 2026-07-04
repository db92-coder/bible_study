import { useReaderStore } from '../../stores/useReaderStore';

export interface Verse {
  verse: number;
  text: string;
}

export function VerseRenderer({ verse, hasNote }: { verse: Verse; hasNote?: boolean }) {
  const selection = useReaderStore((s) => s.selection);
  const selectVerse = useReaderStore((s) => s.selectVerse);
  const selected = selection !== null && verse.verse >= selection.start && verse.verse <= selection.end;

  return (
    <span
      onClick={(e) => selectVerse(verse.verse, e.shiftKey)}
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
      {verse.text}{' '}
    </span>
  );
}
