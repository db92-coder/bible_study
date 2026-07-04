import { useState } from 'react';
import { BOOKS, findBook } from '../../data/books';
import type { RefPoint, UserConnectionInput } from '../../lib/connectionsApi';

const inputCls =
  'rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert';

function RefPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RefPoint;
  onChange: (r: RefPoint) => void;
}) {
  const maxCh = findBook(value.book)?.chapters ?? 150;
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-xs font-semibold uppercase tracking-widest text-ink-faint">
        {label}
      </span>
      <select
        value={value.book}
        onChange={(e) => onChange({ book: e.target.value, chapter: 1 })}
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
        value={value.chapter}
        onChange={(e) => onChange({ ...value, chapter: Number(e.target.value) || 1 })}
        className={`${inputCls} w-20`}
        aria-label={`${label} chapter`}
      />
    </div>
  );
}

export function NewConnectionForm({
  saving,
  onSave,
  onCancel,
}: {
  saving: boolean;
  onSave: (input: UserConnectionInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [description, setDescription] = useState('');
  const [ot, setOt] = useState<RefPoint>({ book: 'Genesis', chapter: 1 });
  const [nt, setNt] = useState<RefPoint>({ book: 'Matthew', chapter: 1 });

  return (
    <div className="rounded-xl border border-parchment-300 bg-white p-5 shadow-sm dark:border-parchment-700 dark:bg-parchment-800">
      <h3 className="font-display text-xl">New connection</h3>
      <div className="mt-3 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What connects these passages?"
          className={`${inputCls} w-full`}
        />
        <div className="flex flex-wrap gap-3">
          <RefPicker label="From" value={ot} onChange={setOt} />
          <RefPicker label="To" value={nt} onChange={setNt} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          {['Personal', 'Prophecy', 'Type & Shadow', 'Covenant', 'Theme'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the connection…"
          rows={3}
          className={`${inputCls} w-full`}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm text-ink-faint hover:underline">
            Cancel
          </button>
          <button
            onClick={() => onSave({ title: title.trim(), category, description: description.trim(), ot, nt })}
            disabled={saving || !title.trim()}
            className="rounded-lg bg-teal px-4 py-1.5 text-sm font-medium text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
          >
            {saving ? 'Saving…' : 'Save connection'}
          </button>
        </div>
      </div>
    </div>
  );
}
