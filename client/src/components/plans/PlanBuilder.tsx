import { useState } from 'react';
import { BOOKS, findBook } from '../../data/books';
import type { PlanDetail, PlanInput, Passage } from '../../lib/plansApi';

const inputCls =
  'rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert';

interface DayDraft {
  passages: Passage[];
  reflection_prompt: string;
}

function PassageEditor({
  passage,
  onChange,
  onRemove,
}: {
  passage: Passage;
  onChange: (p: Passage) => void;
  onRemove: () => void;
}) {
  const maxCh = findBook(passage.book)?.chapters ?? 150;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        value={passage.book}
        onChange={(e) => onChange({ book: e.target.value, chapter_start: 1, chapter_end: undefined })}
        className={inputCls}
      >
        {BOOKS.map((b) => (
          <option key={b.name}>{b.name}</option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        max={maxCh}
        value={passage.chapter_start}
        onChange={(e) => onChange({ ...passage, chapter_start: Number(e.target.value) || 1 })}
        className={`${inputCls} w-16`}
        aria-label="Start chapter"
      />
      <span className="text-xs text-ink-faint">–</span>
      <input
        type="number"
        min={passage.chapter_start}
        max={maxCh}
        value={passage.chapter_end ?? ''}
        placeholder="end"
        onChange={(e) =>
          onChange({ ...passage, chapter_end: e.target.value ? Number(e.target.value) : undefined })
        }
        className={`${inputCls} w-16`}
        aria-label="End chapter"
      />
      <button onClick={onRemove} aria-label="Remove passage" className="px-1 text-ink-faint hover:text-red-700">
        ×
      </button>
    </div>
  );
}

export function PlanBuilder({
  existing,
  saving,
  onSave,
  onCancel,
}: {
  existing: PlanDetail | null;
  saving: boolean;
  onSave: (input: PlanInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [days, setDays] = useState<DayDraft[]>(
    existing?.plan_days.map((d) => ({
      passages: d.passages,
      reflection_prompt: d.reflection_prompt ?? '',
    })) ?? [{ passages: [{ book: 'John', chapter_start: 1 }], reflection_prompt: '' }],
  );

  function patchDay(i: number, patch: Partial<DayDraft>) {
    setDays((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h2 className="font-display text-2xl">
        {existing ? (existing.id ? 'Edit plan' : 'Review your generated plan') : 'Build a study plan'}
      </h2>
      {existing && !existing.id && (
        <p className="text-sm text-ink-faint">
          Adjust anything you like — days, passages, prompts — then save it as your plan.
        </p>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Plan title…"
        className={`${inputCls} w-full font-display text-lg`}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What is this plan about?"
        rows={2}
        className={`${inputCls} w-full`}
      />

      <ol className="space-y-3">
        {days.map((day, i) => (
          <li key={i} className="rounded-xl border border-parchment-300 bg-parchment-50 p-4 dark:border-parchment-700 dark:bg-parchment-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-faint">
                Day {i + 1}
              </h3>
              <button
                onClick={() => setDays((ds) => ds.filter((_, idx) => idx !== i))}
                disabled={days.length === 1}
                className="text-xs text-ink-faint hover:text-red-700 disabled:opacity-40"
              >
                Remove day
              </button>
            </div>
            <div className="mt-2 space-y-1.5">
              {day.passages.map((p, pi) => (
                <PassageEditor
                  key={pi}
                  passage={p}
                  onChange={(np) =>
                    patchDay(i, { passages: day.passages.map((x, xi) => (xi === pi ? np : x)) })
                  }
                  onRemove={() =>
                    patchDay(i, { passages: day.passages.filter((_, xi) => xi !== pi) })
                  }
                />
              ))}
              {day.passages.length < 10 && (
                <button
                  onClick={() =>
                    patchDay(i, {
                      passages: [...day.passages, { book: 'John', chapter_start: 1 }],
                    })
                  }
                  className="text-xs text-teal hover:underline dark:text-gold-soft"
                >
                  + add passage
                </button>
              )}
            </div>
            <input
              value={day.reflection_prompt}
              onChange={(e) => patchDay(i, { reflection_prompt: e.target.value })}
              placeholder="Reflection prompt (optional)"
              className={`${inputCls} mt-3 w-full`}
            />
          </li>
        ))}
      </ol>

      <button
        onClick={() =>
          setDays((ds) => [...ds, { passages: [{ book: 'John', chapter_start: 1 }], reflection_prompt: '' }])
        }
        className="rounded-lg border border-dashed border-parchment-300 px-4 py-2 text-sm text-ink-faint transition hover:border-gold hover:text-ink-soft dark:border-parchment-700"
      >
        + Add day {days.length + 1}
      </button>

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-ink-faint hover:underline">
          Cancel
        </button>
        <button
          onClick={() =>
            onSave({
              title: title.trim(),
              description: description.trim(),
              days: days
                .map((d, i) => ({
                  day_number: i + 1,
                  passages: d.passages.filter((p) => p.book),
                  reflection_prompt: d.reflection_prompt.trim() || null,
                }))
                .filter((d) => d.passages.length > 0),
            })
          }
          disabled={saving || !title.trim() || days.every((d) => d.passages.length === 0)}
          className="rounded-lg bg-teal px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
        >
          {saving ? 'Saving…' : existing?.id ? 'Save changes' : 'Create plan'}
        </button>
      </div>
    </div>
  );
}
