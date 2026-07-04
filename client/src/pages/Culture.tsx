import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { CultureArticle } from '../components/culture/CultureArticle';
import { HebrewWordCard } from '../components/culture/HebrewWordCard';
import { LexiconLookup } from '../components/culture/LexiconLookup';
import { useCultureArticles, useFeaturedWords } from '../lib/lexiconApi';

export default function Culture() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const articles = useCultureArticles();
  const featured = useFeaturedWords();

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {openSlug ? (
          <CultureArticle slug={openSlug} onBack={() => setOpenSlug(null)} />
        ) : (
          <div className="mx-auto max-w-5xl p-6">
            <h1 className="font-display text-3xl">Word & Culture</h1>
            <p className="mt-1 text-sm text-ink-faint">
              The Bible was written in Hebrew and Greek, inside cultures of covenant, honor, and
              temple. Study the original words and the world behind the text.
            </p>

            <section className="mt-6">
              <LexiconLookup />
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl">The world behind the text</h2>
              {articles.isLoading ? (
                <div className="mt-4 grid animate-pulse gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="h-36 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(articles.data ?? []).map((a) => (
                    <button
                      key={a.slug}
                      onClick={() => setOpenSlug(a.slug)}
                      className="rounded-xl border border-parchment-300 bg-white p-5 text-left transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800"
                    >
                      <h3 className="font-display text-lg leading-snug">{a.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-ink-faint">{a.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-teal/10 px-2 py-px text-[0.65rem] text-teal dark:bg-gold/15 dark:text-gold-soft"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-10 pb-10">
              <h2 className="font-display text-2xl">Words worth knowing</h2>
              <p className="mt-1 text-sm text-ink-faint">
                Twenty Hebrew and Greek words that carry more than any translation can hold.
              </p>
              {featured.isLoading ? (
                <div className="mt-4 grid animate-pulse gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-48 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {(featured.data ?? []).map((w) => (
                    <HebrewWordCard key={w.id} word={w} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
