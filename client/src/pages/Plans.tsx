import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { DailyReading } from '../components/plans/DailyReading';
import { PlanBuilder } from '../components/plans/PlanBuilder';
import { ProgressRing } from '../components/plans/ProgressRing';
import {
  computeStreak,
  generatePlan,
  usePlan,
  usePlanMutations,
  usePlans,
  type PlanDetail,
  type PlanInput,
  type PlanSummary,
} from '../lib/plansApi';

function PlanCard({ plan, onOpen }: { plan: PlanSummary; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-xl border border-parchment-300 bg-white p-4 text-left transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800 dark:hover:border-gold"
    >
      <ProgressRing completed={plan.completed_count} total={plan.day_count} size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate font-display text-lg">{plan.title}</h3>
          {plan.is_public && !plan.is_mine && (
            <span className="shrink-0 rounded-full bg-teal/10 px-2 py-px text-[0.65rem] font-medium text-teal dark:bg-gold/15 dark:text-gold-soft">
              starter
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink-faint">{plan.description}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {plan.completed_count}/{plan.day_count} days
        </p>
      </div>
    </button>
  );
}

export default function Plans() {
  const plansQuery = usePlans();
  const [openId, setOpenId] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PlanDetail | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [generating, setGenerating] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const planQuery = usePlan(openId);
  const { create, update, remove, setProgress } = usePlanMutations();

  async function handleGenerate() {
    if (generating || (!goal.trim() && !knowledge)) return;
    setGenerating(true);
    setWizardError(null);
    try {
      const plan = await generatePlan({
        goal: goal.trim() || undefined,
        knowledge_level: (knowledge || undefined) as 'new' | 'some' | 'experienced' | undefined,
        age_group: ageGroup || undefined,
      });
      setDraft({
        id: '',
        title: plan.title,
        description: plan.description,
        is_public: false,
        is_mine: true,
        plan_days: plan.days,
      });
      setWizardOpen(false);
      setBuilding(true);
    } catch (err) {
      setWizardError(err instanceof Error ? err.message : 'Generation failed — try rephrasing');
    } finally {
      setGenerating(false);
    }
  }

  const streak = computeStreak(plansQuery.data?.progress ?? []);

  async function handleSave(input: PlanInput) {
    if (editing && openId) {
      await update.mutateAsync({ id: openId, ...input });
      setEditing(false);
    } else {
      const plan = await create.mutateAsync(input);
      setBuilding(false);
      setDraft(null);
      setOpenId(plan.id);
    }
  }

  const detail = planQuery.data;

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {building || (editing && detail) ? (
          <PlanBuilder
            existing={editing ? (detail?.plan ?? null) : draft}
            saving={create.isPending || update.isPending}
            onSave={handleSave}
            onCancel={() => {
              setBuilding(false);
              setEditing(false);
              setDraft(null);
            }}
          />
        ) : openId && detail ? (
          <div className="mx-auto max-w-3xl p-6">
            <button onClick={() => setOpenId(null)} className="text-sm text-ink-faint hover:underline">
              ← All plans
            </button>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl">{detail.plan.title}</h2>
                <p className="mt-1 text-sm text-ink-faint">{detail.plan.description}</p>
              </div>
              <ProgressRing completed={detail.progress.length} total={detail.plan.plan_days.length} />
            </div>
            {detail.plan.is_mine && (
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => setEditing(true)} className="text-teal hover:underline dark:text-gold-soft">
                  Edit plan
                </button>
                <button
                  onClick={async () => {
                    await remove.mutateAsync(detail.plan.id);
                    setOpenId(null);
                  }}
                  className="text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
            <div className="mt-6">
              <DailyReading
                days={detail.plan.plan_days}
                progress={detail.progress}
                onToggle={(day_number, completed) =>
                  setProgress.mutate({ planId: detail.plan.id, day_number, completed })
                }
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-3xl">Study plans</h2>
                {streak > 0 && (
                  <p className="mt-1 text-sm text-gold">
                    🔥 {streak}-day streak — keep it going!
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setWizardOpen((o) => !o)}
                  className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
                >
                  ✨ Create with AI
                </button>
                <button
                  onClick={() => setBuilding(true)}
                  className="rounded-lg border border-parchment-300 bg-white px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert"
                >
                  + Build by hand
                </button>
              </div>
            </div>

            {wizardOpen && (
              <div className="mt-5 rounded-xl border border-parchment-300 bg-white p-5 dark:border-parchment-700 dark:bg-parchment-800">
                <h3 className="font-display text-xl">What would you like to do?</h3>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={2}
                  placeholder='e.g. "I want to read all 4 gospels in 1 month" — or leave blank for a starter plan matched to you'
                  className="mt-3 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-faint">
                    How well do you know the Bible?
                    <select
                      value={knowledge}
                      onChange={(e) => setKnowledge(e.target.value)}
                      className="rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm text-ink outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
                    >
                      <option value="">No preference</option>
                      <option value="new">I&apos;m new to it</option>
                      <option value="some">Some familiarity</option>
                      <option value="experienced">Very familiar</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-faint">
                    Age group (optional)
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm text-ink outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="teenager">Teen</option>
                      <option value="young adult (18-30)">18–30</option>
                      <option value="adult (31-50)">31–50</option>
                      <option value="over 50">50+</option>
                    </select>
                  </label>
                </div>
                {wizardError && <p className="mt-3 text-sm text-red-700">{wizardError}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <p className="max-w-[32ch] text-xs text-ink-faint sm:max-w-none">
                    You&apos;ll get a full draft to review and adjust before it becomes your plan.
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={generating || (!goal.trim() && !knowledge)}
                    className="shrink-0 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
                  >
                    {generating ? 'Designing your plan…' : 'Generate plan'}
                  </button>
                </div>
              </div>
            )}

            {plansQuery.isLoading ? (
              <div className="mt-6 animate-pulse space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-parchment-200 dark:bg-parchment-700" />
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {(plansQuery.data?.plans ?? []).map((p) => (
                  <PlanCard key={p.id} plan={p} onOpen={() => setOpenId(p.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
