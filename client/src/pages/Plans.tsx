import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { DailyReading } from '../components/plans/DailyReading';
import { PlanBuilder } from '../components/plans/PlanBuilder';
import { ProgressRing } from '../components/plans/ProgressRing';
import {
  computeStreak,
  usePlan,
  usePlanMutations,
  usePlans,
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
  const planQuery = usePlan(openId);
  const { create, update, remove, setProgress } = usePlanMutations();

  const streak = computeStreak(plansQuery.data?.progress ?? []);

  async function handleSave(input: PlanInput) {
    if (editing && openId) {
      await update.mutateAsync({ id: openId, ...input });
      setEditing(false);
    } else {
      const plan = await create.mutateAsync(input);
      setBuilding(false);
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
            existing={editing ? (detail?.plan ?? null) : null}
            saving={create.isPending || update.isPending}
            onSave={handleSave}
            onCancel={() => {
              setBuilding(false);
              setEditing(false);
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
              <button
                onClick={() => setBuilding(true)}
                className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
              >
                + New plan
              </button>
            </div>

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
