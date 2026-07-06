import { useNavigate } from 'react-router-dom';
import { passageLabel, type PlanDay, type ProgressRow } from '../../lib/plansApi';
import { useReaderStore } from '../../stores/useReaderStore';

export function DailyReading({
  days,
  progress,
  onToggle,
}: {
  days: PlanDay[];
  progress: ProgressRow[];
  onToggle: (day_number: number, completed: boolean) => void;
}) {
  const setLocation = useReaderStore((s) => s.setLocation);
  const navigate = useNavigate();
  const done = new Set(progress.map((p) => p.day_number));
  const nextDay = days.find((d) => !done.has(d.day_number))?.day_number;

  return (
    <ol className="space-y-2">
      {days.map((day) => {
        const completed = done.has(day.day_number);
        const isNext = day.day_number === nextDay;
        return (
          <li
            key={day.day_number}
            className={`rounded-xl border p-4 transition ${
              isNext
                ? 'border-gold bg-gold-soft/15'
                : 'border-parchment-300 bg-white dark:border-parchment-700 dark:bg-parchment-800'
            } ${completed ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => onToggle(day.day_number, e.target.checked)}
                className="mt-1 h-4 w-4 accent-gold"
                aria-label={`Mark day ${day.day_number} ${completed ? 'incomplete' : 'complete'}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                    Day {day.day_number}
                  </span>
                  {isNext && (
                    <span className="rounded-full bg-gold px-2 py-px text-[0.65rem] font-semibold text-white">
                      up next
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {day.passages.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setLocation(p.book, p.chapter_start);
                        navigate('/read');
                      }}
                      className={`rounded-md border border-parchment-300 bg-parchment-50 px-2.5 py-1 font-display text-sm transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 ${completed ? 'line-through' : ''}`}
                    >
                      {passageLabel(p)}
                    </button>
                  ))}
                </div>
                {day.reflection_prompt && (
                  <p className="mt-2 text-sm italic leading-relaxed text-ink-soft dark:text-ink-invert">
                    {day.reflection_prompt}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
