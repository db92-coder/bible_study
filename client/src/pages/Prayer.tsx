import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { BOOKS, findBook } from '../data/books';
import { api } from '../lib/api';
import {
  CATEGORY_LABELS,
  usePrayerMutations,
  usePrayerPattern,
  usePrayerPatterns,
  usePrayerRequests,
  type PrayerCategory,
  type PrayerRequest,
  type PrayerStatus,
} from '../lib/prayerApi';
import { useReaderStore } from '../stores/useReaderStore';

const inputCls =
  'rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert';

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ── Prayer list (planning) ──────────────────────────────────────────────

function PrayerListItem({ request }: { request: PrayerRequest }) {
  const { markAnswered, reopen, remove } = usePrayerMutations();
  const [answering, setAnswering] = useState(false);
  const [note, setNote] = useState('');

  return (
    <li className="rounded-xl border border-parchment-300 bg-white p-4 dark:border-parchment-700 dark:bg-parchment-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg leading-snug">{request.title}</span>
            <span className="rounded-full bg-teal/10 px-2 py-px text-[0.65rem] font-medium text-teal dark:bg-gold/15 dark:text-gold-soft">
              {CATEGORY_LABELS[request.category]}
            </span>
          </div>
          {request.body_md && <p className="mt-1 text-sm text-ink-faint">{request.body_md}</p>}
          <p className="mt-1 text-xs text-ink-faint">Added {timeAgo(request.created_at)}</p>
          {request.status === 'answered' && (
            <div className="mt-2 rounded-lg bg-gold-soft/15 p-2.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                Answered {request.answered_at ? timeAgo(request.answered_at) : ''}
              </p>
              {request.answered_note && <p className="mt-1">{request.answered_note}</p>}
            </div>
          )}
        </div>
        <button
          onClick={() => remove.mutate(request.id)}
          aria-label="Delete request"
          className="shrink-0 text-ink-faint hover:text-red-700"
        >
          ×
        </button>
      </div>

      {request.status === 'active' && !answering && (
        <button
          onClick={() => setAnswering(true)}
          className="mt-3 rounded-lg border border-gold-soft px-3 py-1.5 text-xs font-medium text-gold transition hover:bg-gold-soft/15"
        >
          ✓ Mark answered
        </button>
      )}
      {answering && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="How did God answer this? (optional)"
            className={inputCls}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                markAnswered.mutate({ id: request.id, note: note.trim() });
                setAnswering(false);
              }}
              className="rounded-lg bg-teal px-3 py-1.5 text-xs font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
            >
              Save
            </button>
            <button onClick={() => setAnswering(false)} className="text-xs text-ink-faint hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}
      {request.status === 'answered' && (
        <button onClick={() => reopen.mutate(request.id)} className="mt-2 text-xs text-ink-faint hover:underline">
          Still praying about this — reopen
        </button>
      )}
    </li>
  );
}

function PrayerList() {
  const [tab, setTab] = useState<PrayerStatus>('active');
  const requests = usePrayerRequests(tab);
  const { create } = usePrayerMutations();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('other');

  async function add() {
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), category, body_md: '' });
    setTitle('');
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Prayer list</h2>
        <div className="flex overflow-hidden rounded-lg border border-parchment-300 text-xs dark:border-parchment-700">
          {(['active', 'answered'] as PrayerStatus[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 font-medium capitalize transition ${
                tab === t
                  ? 'bg-parchment-200 text-ink dark:bg-parchment-700 dark:text-ink-invert'
                  : 'bg-white text-ink-faint dark:bg-parchment-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'active' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add something to pray for…"
            className={`${inputCls} min-w-0 flex-1`}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value as PrayerCategory)} className={inputCls}>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={add}
            disabled={!title.trim() || create.isPending}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
          >
            Add
          </button>
        </div>
      )}

      <div className="mt-4">
        {requests.isLoading ? (
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-20 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
            ))}
          </div>
        ) : (requests.data ?? []).length === 0 ? (
          <p className="rounded-xl border border-dashed border-parchment-300 p-6 text-center text-sm text-ink-faint dark:border-parchment-700">
            {tab === 'active' ? 'Nothing on your list yet.' : 'Nothing marked answered yet.'}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {(requests.data ?? []).map((r) => (
              <PrayerListItem key={r.id} request={r} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ── Guided prayer session (learning) ────────────────────────────────────

function RequestsInline() {
  const requests = usePrayerRequests('active');
  const { create } = usePrayerMutations();
  const [quick, setQuick] = useState('');

  async function addQuick() {
    if (!quick.trim()) return;
    await create.mutateAsync({ title: quick.trim(), category: 'other', body_md: '' });
    setQuick('');
  }

  return (
    <div className="mt-3 rounded-lg bg-parchment-100 p-3 dark:bg-parchment-900">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
        Your prayer list
      </h4>
      {requests.data && requests.data.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 text-sm">
          {requests.data.map((r) => (
            <li key={r.id}>• {r.title}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-sm text-ink-faint">Nothing on your list yet.</p>
      )}
      <div className="mt-2 flex gap-2">
        <input
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addQuick()}
          placeholder="Add something to pray for…"
          className={`${inputCls} min-w-0 flex-1 text-xs`}
        />
        <button
          onClick={addQuick}
          disabled={!quick.trim()}
          className="rounded-lg bg-teal px-3 py-1.5 text-xs font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function GuidedSession({ slug, onExit }: { slug: string; onExit: () => void }) {
  const pattern = usePrayerPattern(slug);
  const version = useReaderStore((s) => s.version);

  const [book, setBook] = useState('Psalms');
  const [chapter, setChapter] = useState(23);
  const [stepIndex, setStepIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookInfo = findBook(book);
  const maxChapter = bookInfo?.chapters ?? 150;

  const usesPassage = pattern.data?.uses_passage_picker ?? false;

  const chapterQuery = useQuery({
    queryKey: ['scripture', version, book, chapter],
    enabled: usesPassage,
    queryFn: async () =>
      (
        await api.get<{ verses: Array<{ verse: number; text: string }> }>(
          `/scripture/${encodeURIComponent(version)}/${encodeURIComponent(book)}/${chapter}`,
        )
      ).data,
  });
  const passageText = (chapterQuery.data?.verses ?? []).map((v) => v.text).join(' ');
  const ref = `${book} ${chapter}`;

  if (pattern.isLoading || !pattern.data) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-16 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
          ))}
        </div>
      </div>
    );
  }

  const steps = pattern.data.steps;
  const currentStep = stepIndex >= 1 && stepIndex <= steps.length ? steps[stepIndex - 1] : null;
  const dotLabels = ['Start', ...steps.map((s) => s.title.split(' —')[0]), 'Save'];

  function assembleMarkdown(): string {
    const parts: string[] = [];
    if (usesPassage && passageText) {
      parts.push(`> ${passageText}`, `> — ${ref}`, '');
    }
    for (const s of steps) {
      parts.push(`## ${s.title}`, (drafts[s.key] ?? '').trim(), '');
    }
    return parts.join('\n').trim();
  }

  async function save() {
    if (saving || !pattern.data) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/notes', {
        title: title.trim() || `Prayer — ${pattern.data.title}`,
        body_md: assembleMarkdown(),
        book: usesPassage ? book : null,
        chapter: usesPassage ? chapter : null,
        verse_start: null,
        verse_end: null,
        tags: ['prayer'],
      });
      onExit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 pb-16">
      <button onClick={onExit} className="text-sm text-ink-faint hover:underline">
        ← All patterns
      </button>
      <h1 className="mt-3 font-display text-3xl">{pattern.data.title}</h1>

      <div className="mt-4 flex gap-1.5">
        {dotLabels.map((label, i) => (
          <button
            key={label + i}
            onClick={() => i <= stepIndex && setStepIndex(i)}
            className={`h-1.5 flex-1 rounded-full transition ${
              i < stepIndex ? 'bg-gold' : i === stepIndex ? 'bg-teal dark:bg-gold-soft' : 'bg-parchment-200 dark:bg-parchment-700'
            }`}
            aria-label={label}
            title={label}
          />
        ))}
      </div>

      {stepIndex === 0 && (
        <div className="mt-6">
          <p className="rounded-lg bg-gold-soft/15 p-3 text-sm leading-relaxed">
            {pattern.data.intro_md}
          </p>
          {usesPassage && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={book}
                  onChange={(e) => {
                    setBook(e.target.value);
                    setChapter(1);
                  }}
                  className={inputCls}
                >
                  {BOOKS.map((b) => (
                    <option key={b.name}>{b.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={maxChapter}
                  value={chapter}
                  onChange={(e) => setChapter(Math.max(1, Math.min(Number(e.target.value) || 1, maxChapter)))}
                  className={`${inputCls} w-20`}
                  aria-label="Chapter"
                />
              </div>
              <blockquote className="mt-3 max-h-64 overflow-y-auto rounded-xl border-l-4 border-gold bg-white p-4 font-display text-base leading-relaxed dark:bg-parchment-800">
                {chapterQuery.isLoading ? 'Loading…' : passageText || 'No verses found.'}
                <footer className="mt-2 font-sans text-xs text-ink-faint">— {ref}</footer>
              </blockquote>
            </div>
          )}
          <button
            onClick={() => setStepIndex(1)}
            disabled={usesPassage && !passageText}
            className="mt-4 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
          >
            Begin →
          </button>
        </div>
      )}

      {currentStep && (
        <div className="mt-6">
          <h2 className="font-display text-xl">{currentStep.title}</h2>
          {currentStep.scripture_ref && (
            <p className="mt-0.5 text-xs font-medium text-gold">{currentStep.scripture_ref}</p>
          )}
          <p className="mt-2 rounded-lg bg-gold-soft/15 p-3 text-sm leading-relaxed">
            {currentStep.teaching}
          </p>

          {currentStep.show_requests && <RequestsInline />}

          <textarea
            value={drafts[currentStep.key] ?? ''}
            onChange={(e) => setDrafts((d) => ({ ...d, [currentStep.key]: e.target.value }))}
            rows={6}
            placeholder={currentStep.placeholder}
            className="mt-3 w-full rounded-xl border border-parchment-300 bg-white p-4 text-sm leading-relaxed outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
          />

          <div className="mt-4 flex justify-between">
            <button onClick={() => setStepIndex((i) => i - 1)} className="rounded-lg px-3 py-2 text-sm text-ink-faint hover:underline">
              ← Back
            </button>
            <button
              onClick={() => setStepIndex((i) => i + 1)}
              className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
            >
              {stepIndex === steps.length ? 'Review →' : 'Next →'}
            </button>
          </div>
        </div>
      )}

      {stepIndex === steps.length + 1 && (
        <div className="mt-6">
          <h2 className="font-display text-xl">Review &amp; keep it</h2>
          <p className="mt-1 text-sm text-ink-faint">
            Saving keeps this prayer with your notes, tagged so you can find it again.
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Prayer — ${pattern.data.title}`}
            className={`${inputCls} mt-3 w-full font-display text-lg`}
          />
          <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-parchment-300 bg-white p-4 text-sm leading-relaxed dark:border-parchment-700 dark:bg-parchment-800">
            {assembleMarkdown()}
          </div>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <div className="mt-4 flex justify-between">
            <button onClick={() => setStepIndex(steps.length)} className="rounded-lg px-3 py-2 text-sm text-ink-faint hover:underline">
              ← Back
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
            >
              {saving ? 'Saving…' : 'Save prayer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PatternPicker({ onSelect }: { onSelect: (slug: string) => void }) {
  const patterns = usePrayerPatterns();
  return (
    <section>
      <h2 className="font-display text-2xl">Guided prayer</h2>
      <p className="mt-1 text-sm text-ink-faint">
        Pick a pattern to walk through, movement by movement — your words, at your pace.
      </p>
      {patterns.isLoading ? (
        <div className="mt-3 grid animate-pulse gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-28 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(patterns.data ?? []).map((p) => (
            <button
              key={p.slug}
              onClick={() => onSelect(p.slug)}
              className="rounded-xl border border-parchment-300 bg-white p-4 text-left transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800"
            >
              <h3 className="font-display text-lg leading-snug">{p.title}</h3>
              <p className="mt-1 text-xs text-ink-faint">{p.summary}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Prayer() {
  const [sessionSlug, setSessionSlug] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {sessionSlug ? (
          <GuidedSession slug={sessionSlug} onExit={() => setSessionSlug(null)} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-8 p-6 pb-16">
            <div>
              <h1 className="font-display text-3xl">Prayer</h1>
              <p className="mt-1 text-sm text-ink-faint">
                A place to learn how to pray and a place to remember what you're praying for.
              </p>
            </div>
            <PatternPicker onSelect={setSessionSlug} />
            <PrayerList />
          </div>
        )}
      </main>
    </div>
  );
}
