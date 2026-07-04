export const ERA_STOPS = [
  'All',
  'Patriarchs',
  'Exodus & Conquest',
  'Kingdom',
  'Exile & Return',
  'New Testament',
];

export function EraTimelineSlider({
  era,
  onChange,
}: {
  era: string;
  onChange: (era: string) => void;
}) {
  const index = Math.max(0, ERA_STOPS.indexOf(era));

  return (
    <div className="pointer-events-auto rounded-xl border border-parchment-300 bg-parchment-50/95 px-5 py-3 shadow-lg backdrop-blur dark:border-parchment-700 dark:bg-parchment-800/95">
      <div className="flex items-center justify-between gap-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Era</span>
        <span className="font-display text-sm">{ERA_STOPS[index]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={ERA_STOPS.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(ERA_STOPS[Number(e.target.value)])}
        className="mt-2 w-48 max-w-full accent-gold sm:w-64"
        aria-label="Filter places by era"
      />
      <div className="mt-1 flex justify-between text-[0.6rem] text-ink-faint">
        <span>All</span>
        <span>Patriarchs</span>
        <span>Exodus</span>
        <span>Kingdom</span>
        <span>Exile</span>
        <span>NT</span>
      </div>
    </div>
  );
}
