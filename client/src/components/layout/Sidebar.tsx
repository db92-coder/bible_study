import { useState } from 'react';
import { BOOKS } from '../../data/books';
import { useReaderStore } from '../../stores/useReaderStore';

function BookRow({ name, chapters }: { name: string; chapters: number }) {
  const currentBook = useReaderStore((s) => s.book);
  const currentChapter = useReaderStore((s) => s.chapter);
  const setLocation = useReaderStore((s) => s.setLocation);
  const isCurrent = currentBook === name;
  const [expanded, setExpanded] = useState(isCurrent);

  return (
    <li>
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition hover:bg-parchment-200 dark:hover:bg-parchment-700 ${
          isCurrent ? 'font-semibold text-teal dark:text-gold-soft' : 'text-ink-soft dark:text-ink-invert'
        }`}
      >
        {name}
        <span className="text-xs text-ink-faint">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="mb-2 grid grid-cols-6 gap-1 px-3 pt-1">
          {Array.from({ length: chapters }, (_, i) => i + 1).map((ch) => (
            <button
              key={ch}
              onClick={() => setLocation(name, ch)}
              className={`rounded py-1 text-center text-xs transition ${
                isCurrent && currentChapter === ch
                  ? 'bg-teal font-semibold text-white dark:bg-gold dark:text-parchment-900'
                  : 'text-ink-soft hover:bg-parchment-200 dark:text-ink-invert dark:hover:bg-parchment-700'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

export function Sidebar() {
  const testaments: Array<{ label: string; key: 'OT' | 'NT' }> = [
    { label: 'Old Testament', key: 'OT' },
    { label: 'New Testament', key: 'NT' },
  ];

  return (
    <nav className="h-full overflow-y-auto px-2 py-4">
      {testaments.map(({ label, key }) => (
        <section key={key} className="mb-4">
          <h2 className="px-3 pb-1 text-xs font-semibold uppercase tracking-widest text-ink-faint">
            {label}
          </h2>
          <ul>
            {BOOKS.filter((b) => b.testament === key).map((b) => (
              <BookRow key={b.name} name={b.name} chapters={b.chapters} />
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
