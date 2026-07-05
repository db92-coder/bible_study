import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { BOOKS, findBook } from '../data/books';
import { api } from '../lib/api';
import { useReaderStore } from '../stores/useReaderStore';

type StepKey = 'observation' | 'interpretation' | 'application' | 'prayer';

const STEPS: Array<{
  key: StepKey;
  title: string;
  teaching: string;
  placeholder: string;
}> = [
  {
    key: 'observation',
    title: 'Observation — what does it say?',
    teaching:
      'Read the passage twice, slowly. Before asking what it means, notice what it says: Who is speaking, and to whom? Which words repeat? What surprises you, comforts you, or bothers you? Write down what you actually see — plain noticing is the foundation everything else stands on.',
    placeholder: 'I notice that… The word ___ appears twice… I\'m surprised that…',
  },
  {
    key: 'interpretation',
    title: 'Interpretation — what did it mean to them?',
    teaching:
      'Before the verse can mean something for you, it meant something to its first hearers. Who wrote this, to whom, and why? What would these words have meant in their world? The cross-references below show where the rest of Scripture connects — and the reader\'s context panel is one tap away if you need the background.',
    placeholder: 'To the people who first heard this, it would have meant… In the flow of this book, this comes after…',
  },
  {
    key: 'application',
    title: 'Application — what does it mean for me?',
    teaching:
      'Now build the bridge: if that\'s what it meant to them, what timeless truth carries over — and what does that truth look like in your actual week? Be concrete and honest. "Trust God more" is a poster; "bring Thursday\'s conversation to God before I have it" is an application.',
    placeholder: 'Because this is true, today I will… This confronts the way I\'ve been…',
  },
  {
    key: 'prayer',
    title: 'Prayer — respond',
    teaching:
      'Turn what you saw into a response. Thank, ask, confess, or simply sit with it — in your own words, to God. No eloquence required; the psalms show that honesty is the only requirement.',
    placeholder: 'Father, today I saw that…',
  },
];

export default function Devotional() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readerBook = useReaderStore((s) => s.book);
  const readerChapter = useReaderStore((s) => s.chapter);
  const version = useReaderStore((s) => s.version);

  const [book, setBook] = useState(searchParams.get('book') || readerBook);
  const [chapter, setChapter] = useState(Number(searchParams.get('chapter')) || readerChapter);
  const [verseStart, setVerseStart] = useState<number>(Number(searchParams.get('vs')) || 1);
  const [verseEnd, setVerseEnd] = useState<number>(
    Number(searchParams.get('ve')) || Number(searchParams.get('vs')) || 1,
  );
  const [stepIndex, setStepIndex] = useState(0); // 0 = passage, 1..4 = SOAP steps, 5 = review
  const [drafts, setDrafts] = useState<Record<StepKey, string>>({
    observation: '',
    interpretation: '',
    application: '',
    prayer: '',
  });
  const [coach, setCoach] = useState<Partial<Record<StepKey, string>>>({});
  const [coaching, setCoaching] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookInfo = findBook(book);
  const maxChapter = bookInfo?.chapters ?? 150;

  const chapterQuery = useQuery({
    queryKey: ['scripture', version, book, chapter],
    queryFn: async () =>
      (
        await api.get<{ verses: Array<{ verse: number; text: string }> }>(
          `/scripture/${encodeURIComponent(version)}/${encodeURIComponent(book)}/${chapter}`,
        )
      ).data,
  });

  const maxVerse = chapterQuery.data?.verses.length ?? 176;
  const vs = Math.min(verseStart, maxVerse);
  const ve = Math.min(Math.max(verseEnd, vs), maxVerse);
  const passageText = (chapterQuery.data?.verses ?? [])
    .filter((v) => v.verse >= vs && v.verse <= ve)
    .map((v) => v.text)
    .join(' ');
  const ref = `${book} ${chapter}:${vs}${ve !== vs ? `–${ve}` : ''}`;

  const crossrefs = useQuery({
    queryKey: ['crossrefs', book, chapter],
    enabled: stepIndex === 2,
    queryFn: async () =>
      (await api.get<{ refs: Record<number, string[]> }>(`/crossrefs/${encodeURIComponent(book)}/${chapter}`)).data
        .refs,
    staleTime: Infinity,
  });

  const inputCls =
    'rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert';

  async function askCoach(step: StepKey) {
    const draft = drafts[step].trim();
    if (!draft || coaching) return;
    setCoaching(true);
    setError(null);
    try {
      const prior = STEPS.slice(0, STEPS.findIndex((s) => s.key === step))
        .map((s) => (drafts[s.key].trim() ? `${s.key}: ${drafts[s.key].trim()}` : null))
        .filter(Boolean)
        .join('\n')
        .slice(0, 2800);
      const { data } = await api.post<{ feedback: string }>('/devotional/coach', {
        ref,
        verse_text: passageText.slice(0, 1100),
        step,
        draft,
        prior: prior || undefined,
      });
      setCoach((c) => ({ ...c, [step]: data.feedback }));
    } catch {
      setError('The coach is unavailable right now — keep writing, your words are the point.');
    } finally {
      setCoaching(false);
    }
  }

  function assembleMarkdown(): string {
    return [
      `## Scripture`,
      `> ${passageText}`,
      `> — ${ref}`,
      '',
      `## Observation`,
      drafts.observation.trim(),
      '',
      `## Interpretation`,
      drafts.interpretation.trim(),
      '',
      `## Application`,
      drafts.application.trim(),
      '',
      `## Prayer`,
      drafts.prayer.trim(),
    ].join('\n');
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/notes', {
        title: title.trim() || `Devotional — ${ref}`,
        body_md: assembleMarkdown(),
        book,
        chapter,
        verse_start: vs,
        verse_end: ve,
        tags: ['devotional'],
      });
      navigate('/notes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
      setSaving(false);
    }
  }

  const currentStep = stepIndex >= 1 && stepIndex <= 4 ? STEPS[stepIndex - 1] : null;
  const filledSteps = STEPS.filter((s) => drafts[s.key].trim()).length;

  const crossrefChips =
    stepIndex === 2 && crossrefs.data
      ? Object.entries(crossrefs.data)
          .filter(([v]) => Number(v) >= vs && Number(v) <= ve)
          .flatMap(([, refs]) => refs)
          .slice(0, 8)
          .map((osis) => osis.replace(/\./g, ' ').replace(/(\d+) (\d+)$/, '$1:$2'))
      : [];

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6 pb-16">
          <h1 className="font-display text-3xl">Write a devotional</h1>
          <p className="mt-1 text-sm text-ink-faint">
            A guided practice around a verse that matters to you: Scripture → Observation →
            Interpretation → Application → Prayer. Your words, your pace — the coach only asks
            questions.
          </p>

          {/* Progress */}
          <div className="mt-4 flex gap-1.5">
            {['Passage', 'Observe', 'Interpret', 'Apply', 'Pray', 'Save'].map((label, i) => (
              <button
                key={label}
                onClick={() => i <= stepIndex && setStepIndex(i)}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i < stepIndex ? 'bg-gold' : i === stepIndex ? 'bg-teal dark:bg-gold-soft' : 'bg-parchment-200 dark:bg-parchment-700'
                }`}
                aria-label={label}
                title={label}
              />
            ))}
          </div>

          {/* Step 0: passage */}
          {stepIndex === 0 && (
            <div className="mt-6">
              <h2 className="font-display text-xl">Choose your passage</h2>
              <p className="mt-1 text-sm text-ink-faint">
                A verse or a few that mean something to you — from today&apos;s reading, a search,
                or memory.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select value={book} onChange={(e) => { setBook(e.target.value); setChapter(1); setVerseStart(1); setVerseEnd(1); }} className={inputCls}>
                  {BOOKS.map((b) => (
                    <option key={b.name}>{b.name}</option>
                  ))}
                </select>
                <input type="number" min={1} max={maxChapter} value={chapter} onChange={(e) => setChapter(Math.max(1, Math.min(Number(e.target.value) || 1, maxChapter)))} className={`${inputCls} w-20`} aria-label="Chapter" />
                <span className="text-xs text-ink-faint">verses</span>
                <input type="number" min={1} value={verseStart} onChange={(e) => setVerseStart(Math.max(1, Number(e.target.value) || 1))} className={`${inputCls} w-20`} aria-label="Start verse" />
                <span className="text-xs text-ink-faint">to</span>
                <input type="number" min={verseStart} value={verseEnd} onChange={(e) => setVerseEnd(Math.max(verseStart, Number(e.target.value) || verseStart))} className={`${inputCls} w-20`} aria-label="End verse" />
              </div>
              <blockquote className="mt-4 rounded-xl border-l-4 border-gold bg-white p-4 font-display text-base leading-relaxed dark:bg-parchment-800">
                {chapterQuery.isLoading ? 'Loading…' : passageText || 'No verses in that range.'}
                <footer className="mt-2 font-sans text-xs text-ink-faint">— {ref}</footer>
              </blockquote>
              <button
                onClick={() => setStepIndex(1)}
                disabled={!passageText}
                className="mt-4 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
              >
                Begin with this passage →
              </button>
            </div>
          )}

          {/* Steps 1-4: SOAP */}
          {currentStep && (
            <div className="mt-6">
              <blockquote className="rounded-lg bg-white px-4 py-3 font-display text-sm leading-relaxed dark:bg-parchment-800">
                “{passageText}” <span className="font-sans text-xs text-ink-faint">— {ref}</span>
              </blockquote>
              <h2 className="mt-5 font-display text-xl">{currentStep.title}</h2>
              <p className="mt-2 rounded-lg bg-gold-soft/15 p-3 text-sm leading-relaxed">
                {currentStep.teaching}
              </p>

              {stepIndex === 2 && crossrefChips.length > 0 && (
                <p className="mt-2 text-xs text-ink-faint">
                  Scripture connects here: {crossrefChips.join(' · ')}
                </p>
              )}

              <textarea
                value={drafts[currentStep.key]}
                onChange={(e) => setDrafts((d) => ({ ...d, [currentStep.key]: e.target.value }))}
                rows={7}
                placeholder={currentStep.placeholder}
                className="mt-3 w-full rounded-xl border border-parchment-300 bg-white p-4 text-sm leading-relaxed outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
              />

              {coach[currentStep.key] && (
                <div className="mt-3 rounded-lg border border-teal/30 bg-teal/5 p-3 text-sm leading-relaxed dark:border-gold/30 dark:bg-gold/5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal dark:text-gold-soft">
                    Coach
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{coach[currentStep.key]}</p>
                </div>
              )}
              {error && <p className="mt-2 text-xs text-ink-faint">{error}</p>}

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => askCoach(currentStep.key)}
                  disabled={coaching || !drafts[currentStep.key].trim()}
                  className="rounded-lg border border-parchment-300 px-3.5 py-2 text-sm text-teal transition hover:border-gold disabled:opacity-40 dark:border-parchment-700 dark:text-gold-soft"
                >
                  {coaching ? 'Thinking…' : '🕊 Coach me deeper'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setStepIndex((i) => i - 1)} className="rounded-lg px-3 py-2 text-sm text-ink-faint hover:underline">
                    ← Back
                  </button>
                  <button
                    onClick={() => setStepIndex((i) => i + 1)}
                    className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
                  >
                    {stepIndex === 4 ? 'Review →' : 'Next →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: review & save */}
          {stepIndex === 5 && (
            <div className="mt-6">
              <h2 className="font-display text-xl">Review &amp; keep it</h2>
              <p className="mt-1 text-sm text-ink-faint">
                {filledSteps < 4
                  ? `You've filled ${filledSteps} of 4 sections — you can go back, or save as is and finish later.`
                  : 'Saved devotionals live with your notes, anchored to the verse — a dot in the reader margin will bring you back here.'}
              </p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Devotional — ${ref}`}
                className={`${inputCls} mt-3 w-full font-display text-lg`}
              />
              <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-parchment-300 bg-white p-4 text-sm leading-relaxed dark:border-parchment-700 dark:bg-parchment-800">
                {assembleMarkdown()}
              </div>
              {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
              <div className="mt-4 flex justify-between">
                <button onClick={() => setStepIndex(4)} className="rounded-lg px-3 py-2 text-sm text-ink-faint hover:underline">
                  ← Back
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
                >
                  {saving ? 'Saving…' : 'Save devotional'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
