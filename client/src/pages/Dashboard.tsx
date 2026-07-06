import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { ProgressRing } from '../components/plans/ProgressRing';
import { GENRE_INFO, findBook } from '../data/books';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { useNoteMutations } from '../lib/notesApi';
import { passageLabel, usePlan, usePlans } from '../lib/plansApi';
import { CATEGORY_LABELS, usePrayerMutations, usePrayerRequests } from '../lib/prayerApi';
import { useReaderStore } from '../stores/useReaderStore';

interface Profile {
  display_name: string | null;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-parchment-300 bg-white p-5 dark:border-parchment-700 dark:bg-parchment-800">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ContinueReading() {
  const book = useReaderStore((s) => s.book);
  const chapter = useReaderStore((s) => s.chapter);
  const info = findBook(book);
  const genre = info ? GENRE_INFO[info.genre] : null;

  return (
    <Link
      to="/read"
      className="block rounded-xl border border-gold-soft bg-gold-soft/15 p-5 transition hover:border-gold"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">Continue reading</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <h2 className="font-display text-2xl">
          {book} <span className="text-gold">{chapter}</span>
        </h2>
        {genre && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: genre.color }}
          >
            {genre.label}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-faint">Pick up right where you left off →</p>
    </Link>
  );
}

function FeaturedPlanDay({ planId }: { planId: string }) {
  const navigate = useNavigate();
  const setLocation = useReaderStore((s) => s.setLocation);
  const { data } = usePlan(planId);
  if (!data) return null;

  const doneDays = new Set(data.progress.map((p) => p.day_number));
  const nextDay = data.plan.plan_days
    .slice()
    .sort((a, b) => a.day_number - b.day_number)
    .find((d) => !doneDays.has(d.day_number));
  if (!nextDay) return null;

  return (
    <div className="mt-3 rounded-lg bg-parchment-100 p-3 dark:bg-parchment-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
        {data.plan.title} — Day {nextDay.day_number}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {nextDay.passages.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setLocation(p.book, p.chapter_start);
              navigate('/read');
            }}
            className="rounded-md border border-parchment-300 bg-white px-2.5 py-1 font-display text-sm transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800"
          >
            {passageLabel(p)}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlansWidget() {
  const plansQuery = usePlans();
  const plans = plansQuery.data?.plans ?? [];
  const featured = plans.find((p) => p.day_count > 0 && p.completed_count < p.day_count);

  return (
    <Card title="Reading plans" action={<Link to="/plans" className="text-xs text-teal hover:underline dark:text-gold-soft">View all →</Link>}>
      {plansQuery.isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-16 rounded-lg bg-parchment-200 dark:bg-parchment-700" />
        </div>
      ) : plans.length === 0 ? (
        <p className="text-sm text-ink-faint">
          No plans yet — <Link to="/plans" className="text-teal hover:underline dark:text-gold-soft">start one</Link>, or let AI build one for you.
        </p>
      ) : (
        <>
          {featured && <FeaturedPlanDay planId={featured.id} />}
          <ul className="mt-3 space-y-2">
            {plans.slice(0, 4).map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <ProgressRing completed={p.completed_count} total={p.day_count} size={36} />
                <span className="min-w-0 flex-1 truncate text-sm">{p.title}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function PrayerWidget() {
  const requests = usePrayerRequests('active');
  const { create } = usePrayerMutations();
  const [title, setTitle] = useState('');

  async function add() {
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), category: 'other', body_md: '' });
    setTitle('');
  }

  return (
    <Card title="Prayer points" action={<Link to="/prayer" className="text-xs text-teal hover:underline dark:text-gold-soft">View all →</Link>}>
      {requests.isError ? (
        <p className="text-sm text-ink-faint">Couldn&apos;t load your prayer list right now.</p>
      ) : requests.isLoading ? (
        <div className="animate-pulse h-16 rounded-lg bg-parchment-200 dark:bg-parchment-700" />
      ) : (requests.data ?? []).length === 0 ? (
        <p className="text-sm text-ink-faint">Nothing on your list yet.</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {(requests.data ?? []).slice(0, 5).map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <span className="rounded-full bg-teal/10 px-1.5 py-px text-[0.6rem] font-medium text-teal dark:bg-gold/15 dark:text-gold-soft">
                {CATEGORY_LABELS[r.category]}
              </span>
              <span className="min-w-0 flex-1 truncate">{r.title}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add something to pray for…"
          className="min-w-0 flex-1 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
        />
        <button
          onClick={add}
          disabled={!title.trim()}
          className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
        >
          Add
        </button>
      </div>
    </Card>
  );
}

function QuickNoteWidget() {
  const { create } = useNoteMutations();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!text.trim() || create.isPending) return;
    await create.mutateAsync({
      title: '',
      body_md: text.trim(),
      book: null,
      chapter: null,
      verse_start: null,
      verse_end: null,
      tags: [],
    });
    setText('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Card title="Quick note" action={<Link to="/notes" className="text-xs text-teal hover:underline dark:text-gold-soft">View all →</Link>}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Jot something down before it slips away…"
        className="w-full rounded-lg border border-parchment-300 bg-white p-3 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={save}
          disabled={!text.trim() || create.isPending}
          className="rounded-lg bg-teal px-4 py-1.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
        >
          {create.isPending ? 'Saving…' : 'Save note'}
        </button>
        {saved && <span className="text-sm text-teal dark:text-gold-soft">Saved ✓</span>}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get<{ profile: Profile | null }>('/me')).data,
  });
  const name = me.data?.profile?.display_name || user?.email?.split('@')[0] || 'friend';

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 p-6 pb-16">
          <div>
            <h1 className="font-display text-3xl">
              {greeting()}, {name}
            </h1>
            <p className="mt-1 text-sm text-ink-faint">Here&apos;s where things stand.</p>
          </div>

          <ContinueReading />

          <div className="grid gap-5 sm:grid-cols-2">
            <PlansWidget />
            <PrayerWidget />
          </div>

          <QuickNoteWidget />

          <div className="rounded-xl border border-dashed border-parchment-300 p-5 text-center dark:border-parchment-700">
            <p className="font-display text-lg">New here, or not sure what a feature does?</p>
            <p className="mt-1 text-sm text-ink-faint">
              Visit the{' '}
              <Link to="/help" className="text-teal hover:underline dark:text-gold-soft">
                Help page
              </Link>{' '}
              for a guide to every feature, keyboard shortcuts, and answers to common questions —
              or the{' '}
              <Link to="/learn" className="text-teal hover:underline dark:text-gold-soft">
                Learn
              </Link>{' '}
              tab to build skill reading the Bible itself.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
