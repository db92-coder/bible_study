import MDEditor from '@uiw/react-md-editor';
import { useCultureArticle, useFeaturedWords } from '../../lib/lexiconApi';
import { useThemeStore } from '../../stores/useThemeStore';
import { HebrewWordCard } from './HebrewWordCard';

export function CultureArticle({ slug, onBack }: { slug: string; onBack: () => void }) {
  const dark = useThemeStore((s) => s.dark);
  const { data: article, isLoading } = useCultureArticle(slug);
  const featured = useFeaturedWords();

  if (isLoading || !article) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 p-6">
        <div className="h-8 w-2/3 rounded bg-parchment-200 dark:bg-parchment-700" />
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-4 rounded bg-parchment-200 dark:bg-parchment-700" />
        ))}
      </div>
    );
  }

  const relatedWords = (featured.data ?? []).filter((w) => article.related_words.includes(w.id));

  return (
    <article className="mx-auto max-w-3xl p-6">
      <button onClick={onBack} className="text-sm text-ink-faint hover:underline">
        ← All articles
      </button>
      <h1 className="mt-3 font-display text-4xl">{article.title}</h1>
      <p className="mt-2 text-sm italic text-ink-faint">{article.summary}</p>
      <div className="mt-2 flex gap-1.5">
        {article.tags.map((t) => (
          <span key={t} className="rounded-full bg-teal/10 px-2 py-px text-xs text-teal dark:bg-gold/15 dark:text-gold-soft">
            {t}
          </span>
        ))}
      </div>

      <div
        data-color-mode={dark ? 'dark' : 'light'}
        className="prose-parchment mt-6 [&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:font-sans [&_.wmde-markdown]:text-[0.95rem] [&_.wmde-markdown]:leading-relaxed"
      >
        <MDEditor.Markdown source={article.body_md} />
      </div>

      {relatedWords.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl">Words to study alongside</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {relatedWords.map((w) => (
              <HebrewWordCard key={w.id} word={w} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
