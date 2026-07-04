import MDEditor from '@uiw/react-md-editor';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { api } from '../lib/api';
import { useLearnStore } from '../stores/useLearnStore';
import { useReaderStore } from '../stores/useReaderStore';
import { useThemeStore } from '../stores/useThemeStore';

interface LessonSummary {
  slug: string;
  order: number;
  title: string;
  summary: string;
}

interface Lesson extends LessonSummary {
  body_md: string;
  exercise: { prompt: string; book: string; chapter: number } | null;
}

export default function Learn() {
  const dark = useThemeStore((s) => s.dark);
  const completed = useLearnStore((s) => s.completed);
  const toggleComplete = useLearnStore((s) => s.toggleComplete);
  const setLocation = useReaderStore((s) => s.setLocation);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [openSlug, setOpenSlug] = useState<string | null>(() => searchParams.get('lesson'));

  const list = useQuery({
    queryKey: ['learn'],
    queryFn: async () => (await api.get<{ lessons: LessonSummary[] }>('/learn')).data.lessons,
    staleTime: Infinity,
  });

  const lesson = useQuery({
    queryKey: ['learn', openSlug],
    enabled: openSlug !== null,
    queryFn: async () => (await api.get<{ lesson: Lesson }>(`/learn/${openSlug}`)).data.lesson,
    staleTime: Infinity,
  });

  const lessons = list.data ?? [];
  const doneCount = lessons.filter((l) => completed[l.slug]).length;

  function openExercise(book: string, chapter: number) {
    setLocation(book, chapter);
    navigate('/');
  }

  const current = lesson.data;
  const currentIndex = current ? lessons.findIndex((l) => l.slug === current.slug) : -1;
  const next = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {openSlug && current ? (
          <article className="mx-auto max-w-3xl p-6">
            <button onClick={() => setOpenSlug(null)} className="text-sm text-ink-faint hover:underline">
              ← All lessons
            </button>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold">
              Lesson {current.order} of {lessons.length}
            </p>
            <h1 className="mt-1 font-display text-4xl">{current.title}</h1>

            <div
              data-color-mode={dark ? 'dark' : 'light'}
              className="mt-6 [&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:font-sans [&_.wmde-markdown]:text-[0.95rem] [&_.wmde-markdown]:leading-relaxed"
            >
              <MDEditor.Markdown source={current.body_md} />
            </div>

            {current.exercise && (
              <div className="mt-8 rounded-xl border border-gold-soft bg-gold-soft/15 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">
                  Try it now
                </h2>
                <p className="mt-2 text-sm leading-relaxed">{current.exercise.prompt}</p>
                <button
                  onClick={() => openExercise(current.exercise!.book, current.exercise!.chapter)}
                  className="mt-4 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
                >
                  Read {current.exercise.book} {current.exercise.chapter} →
                </button>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300 pt-5 dark:border-parchment-700">
              <button
                onClick={() => toggleComplete(current.slug)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  completed[current.slug]
                    ? 'bg-parchment-200 text-ink-soft dark:bg-parchment-700 dark:text-ink-invert'
                    : 'bg-teal text-white hover:bg-teal-deep dark:bg-gold dark:text-parchment-900'
                }`}
              >
                {completed[current.slug] ? '✓ Completed — undo' : 'Mark lesson complete'}
              </button>
              <div className="flex gap-3 text-sm">
                {prev && (
                  <button onClick={() => setOpenSlug(prev.slug)} className="text-ink-faint hover:underline">
                    ← {prev.title}
                  </button>
                )}
                {next && (
                  <button onClick={() => setOpenSlug(next.slug)} className="text-teal hover:underline dark:text-gold-soft">
                    {next.title} →
                  </button>
                )}
              </div>
            </div>
          </article>
        ) : (
          <div className="mx-auto max-w-3xl p-6">
            <h1 className="font-display text-3xl">Learn to read the Bible</h1>
            <p className="mt-1 text-sm text-ink-faint">
              Eight short lessons on how the Bible works — what it is, how its genres want to be
              read, why context changes everything, and how prayer and study belong together. Each
              one ends with a passage to try it on.
            </p>

            {lessons.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-parchment-200 dark:bg-parchment-700">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${(doneCount / lessons.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-ink-faint">
                  {doneCount}/{lessons.length}
                </span>
              </div>
            )}

            {list.isLoading ? (
              <div className="mt-6 animate-pulse space-y-3">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
                ))}
              </div>
            ) : (
              <ol className="mt-6 space-y-3 pb-10">
                {lessons.map((l) => (
                  <li key={l.slug}>
                    <button
                      onClick={() => setOpenSlug(l.slug)}
                      className="flex w-full items-start gap-4 rounded-xl border border-parchment-300 bg-white p-4 text-left transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800"
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          completed[l.slug]
                            ? 'bg-gold text-white'
                            : 'bg-parchment-200 text-ink-soft dark:bg-parchment-700 dark:text-ink-invert'
                        }`}
                      >
                        {completed[l.slug] ? '✓' : l.order}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-lg leading-snug">{l.title}</span>
                        <span className="mt-1 block text-sm text-ink-faint">{l.summary}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
