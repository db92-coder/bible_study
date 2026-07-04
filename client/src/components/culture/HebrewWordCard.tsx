import type { LexiconWord } from '../../lib/lexiconApi';

export function HebrewWordCard({ word, expanded = false }: { word: LexiconWord; expanded?: boolean }) {
  const isHebrew = word.language === 'Hebrew';

  return (
    <div className="rounded-xl border border-parchment-300 bg-white p-5 transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span
              className={`font-display text-3xl leading-none ${isHebrew ? '[direction:rtl]' : ''}`}
              lang={isHebrew ? 'he' : 'el'}
            >
              {word.lemma}
            </span>
            <span className="text-lg italic text-ink-soft dark:text-ink-invert">{word.translit}</span>
          </div>
          {word.pron && <p className="mt-1 text-xs text-ink-faint">pronounced: {word.pron}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
            isHebrew ? 'bg-teal' : 'bg-gold'
          }`}
        >
          {word.id} · {word.language}
        </span>
      </div>

      {word.strongs_def && (
        <p className="mt-3 text-sm leading-relaxed">{word.strongs_def.trim()}</p>
      )}

      {word.note && (
        <p className="mt-3 rounded-lg bg-parchment-100 p-3 text-sm leading-relaxed text-ink-soft dark:bg-parchment-900 dark:text-ink-invert">
          {word.note}
        </p>
      )}

      {(expanded || word.note) && word.derivation && (
        <p className="mt-3 text-xs text-ink-faint">Derivation: {word.derivation.trim()}</p>
      )}

      {word.kjv_def && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            KJV renderings
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft dark:text-ink-invert">
            {word.kjv_def.replace(/^[\s,;×]+|[\s,;.]+$/g, '')}
          </p>
        </div>
      )}
    </div>
  );
}
