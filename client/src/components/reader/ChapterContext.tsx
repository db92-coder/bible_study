import MDEditor from '@uiw/react-md-editor';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { createNode, TYPE_COLORS } from '../../lib/graphApi';
import { useReaderStore } from '../../stores/useReaderStore';
import { useThemeStore } from '../../stores/useThemeStore';

interface ChapterBrief {
  book: string;
  chapter: number;
  brief_md: string;
  cached: boolean;
}

interface ChapterPlace {
  name: string;
}

export function ChapterContext() {
  const book = useReaderStore((s) => s.book);
  const chapter = useReaderStore((s) => s.chapter);
  const dark = useThemeStore((s) => s.dark);
  const navigate = useNavigate();

  const placesQuery = useQuery({
    queryKey: ['chapter-places', book, chapter],
    queryFn: async () =>
      (
        await api.get<{ places: ChapterPlace[] }>(
          `/places?book=${encodeURIComponent(book)}&chapter=${chapter}`,
        )
      ).data.places,
    staleTime: Infinity,
  });

  const brief = useQuery({
    queryKey: ['chapter-brief', book, chapter],
    queryFn: async () =>
      (await api.get<ChapterBrief>(`/context/${encodeURIComponent(book)}/${chapter}`)).data,
    staleTime: Infinity,
    retry: 1,
  });

  async function addChapterToGraph() {
    await createNode({
      label: `${book} ${chapter}`,
      type: 'verse',
      body_md: '',
      verse_ref: `${book} ${chapter}`,
      color: TYPE_COLORS.verse,
    });
    navigate('/graph');
  }

  return (
    <div className="border-b border-parchment-300 px-5 py-6 dark:border-parchment-700">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">
          This chapter <span className="text-gold">· {chapter}</span>
        </h2>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => navigate(`/notes?new=1&book=${encodeURIComponent(book)}&chapter=${chapter}`)}
            className="text-teal hover:underline dark:text-gold-soft"
          >
            Note
          </button>
          <button onClick={addChapterToGraph} className="text-teal hover:underline dark:text-gold-soft">
            + Graph
          </button>
        </div>
      </div>

      {placesQuery.data && placesQuery.data.length > 0 && (
        <div className="mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Places in this chapter
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {placesQuery.data.slice(0, 10).map((p) => (
              <button
                key={p.name}
                onClick={() => navigate(`/map?place=${encodeURIComponent(p.name)}`)}
                title={`Show ${p.name} on the map`}
                className="rounded-md border border-parchment-300 bg-white px-2 py-0.5 text-xs text-teal transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-gold-soft"
              >
                {p.name}
              </button>
            ))}
            {placesQuery.data.length > 10 && (
              <span className="px-1 py-0.5 text-xs text-ink-faint">
                +{placesQuery.data.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        {brief.isLoading && (
          <div>
            <p className="text-xs italic text-ink-faint">Studying the background of this chapter…</p>
            <div className="mt-2 animate-pulse space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-3 rounded bg-parchment-200 dark:bg-parchment-700" />
              ))}
            </div>
          </div>
        )}
        {brief.isError && (
          <p className="text-xs text-ink-faint">
            Chapter background unavailable right now — the book overview below still applies.
          </p>
        )}
        {brief.data && (
          <div
            data-color-mode={dark ? 'dark' : 'light'}
            className="[&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:font-sans [&_.wmde-markdown]:text-[0.85rem] [&_.wmde-markdown]:leading-relaxed [&_.wmde-markdown_h2]:mt-4 [&_.wmde-markdown_h2]:border-none [&_.wmde-markdown_h2]:pb-0 [&_.wmde-markdown_h2]:text-[0.7rem] [&_.wmde-markdown_h2]:font-semibold [&_.wmde-markdown_h2]:uppercase [&_.wmde-markdown_h2]:tracking-widest [&_.wmde-markdown_h2]:text-ink-faint"
          >
            <MDEditor.Markdown source={brief.data.brief_md} />
          </div>
        )}
      </div>
    </div>
  );
}
