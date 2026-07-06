import { Link } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';

interface FeatureGroup {
  heading: string;
  features: Array<{ name: string; body: string }>;
}

const GROUPS: FeatureGroup[] = [
  {
    heading: 'Reading & understanding',
    features: [
      {
        name: 'Read',
        body: 'The Bible reader — pick any book, chapter, and translation. Click a verse (or shift-click to extend) to select a range; a selection unlocks quick actions to add a note, plant it in the graph, start a devotional, or see cross-references. The context panel on the right shows the book\'s background and an AI-written brief for the chapter you\'re on, with a Standard/Simple toggle for the brief\'s reading level.',
      },
      {
        name: 'Learn',
        body: 'A ten-lesson track on how to actually read the Bible — genres, context, how famous verses get misused, praying with Scripture. Each lesson ends with an exercise that drops you straight into the reader.',
      },
      {
        name: 'Story',
        body: 'The whole Bible as one timeline, era by era, with every event linking into the reader and the map.',
      },
      {
        name: 'Map',
        body: 'Places mentioned in whatever you\'re reading, plotted on a map, with missionary journeys and an era filter.',
      },
      {
        name: 'Culture',
        body: 'A Hebrew/Greek word lexicon and short articles on the customs and world behind the text — feasts, honor and shame, temple layout, and more.',
      },
    ],
  },
  {
    heading: 'Studying & connecting ideas',
    features: [
      {
        name: 'Search',
        body: 'Search "by meaning" (describe a topic, feeling, or question — e.g. "being scared") or by exact words. Every result can jump to the reader, and you can select results and plant them straight into your knowledge graph as a labeled theme.',
      },
      {
        name: 'Connections',
        body: 'An arc diagram (and list view on phones) linking Old and New Testament passages — prophecies and fulfillments, types and shadows, covenants, themes. Add your own connections too.',
      },
      {
        name: 'Graph',
        body: 'An Obsidian-style knowledge graph. Drag a node onto another to link them; drop a node anywhere else to pin it in place. New verse nodes are automatically checked against your existing themes and linked where they genuinely relate. Toggle node size, colour by type or by cluster, and show/hide link labels from the toolbar.',
      },
    ],
  },
  {
    heading: 'Personal practice',
    features: [
      {
        name: 'Notes',
        body: 'General-purpose notes, optionally anchored to a verse range. Anchored notes show as a small dot on the verse in the reader.',
      },
      {
        name: 'Devotional',
        body: 'A guided SOAP practice (Scripture, Observation, Interpretation, Application, Prayer) for a passage that matters to you, with an optional AI coach that only ever asks questions — it never writes the devotional for you.',
      },
      {
        name: 'Prayer',
        body: 'Guided prayer patterns (the Lord\'s Prayer, ACTS, praying a psalm) with teaching at every step, plus a persistent prayer list — add requests, mark them answered with a note, and build your own record of answered prayer.',
      },
      {
        name: 'Plans',
        body: 'Daily reading plans with progress tracking and streaks. Build one by hand, or describe a goal ("I want to read all 4 gospels in 1 month") and let AI design it — you can always edit the draft before saving it.',
      },
    ],
  },
  {
    heading: 'Account',
    features: [
      {
        name: 'Settings',
        body: 'Your profile, email verification, password, and account deletion. Also where you\'ll find the one-click export of your graph and plans to Obsidian-ready markdown files.',
      },
    ],
  },
];

const SHORTCUTS: Array<{ keys: string; where: string; does: string }> = [
  { keys: 'j', where: 'Read', does: 'Next chapter' },
  { keys: 'k', where: 'Read', does: 'Previous chapter' },
  { keys: 'n', where: 'Read', does: 'New note (anchored to your selection, if any)' },
  { keys: 'g', where: 'Read', does: 'Jump to the Graph' },
  { keys: '/', where: 'Graph', does: 'Focus the node search box' },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'Is my data private?',
    a: 'Yes. Your notes, prayer list, devotionals, plans, and knowledge graph are stored per-account and are not visible to other users.',
  },
  {
    q: 'What Bible translations are available?',
    a: 'The World English Bible (WEB) is the default, free and public domain. Use the version switcher in the top bar (while reading) to pick others, including modern copyrighted translations made available through the Bible API.',
  },
  {
    q: 'How does the AI study companion decide what to say?',
    a: 'It answers only from the biblical text, public-domain commentaries, and mainstream scholarship, and always cites book/chapter/verse. Where Christian traditions genuinely differ on a passage, it presents the main views neutrally rather than picking a side.',
  },
  {
    q: 'Is Scribe affiliated with a particular denomination?',
    a: 'No. On contested questions where faithful Christians disagree, the app is built to say "interpretations differ" rather than take a side.',
  },
  {
    q: "What's the difference between Notes, Devotionals, and Prayer entries?",
    a: 'Notes are free-form, for anything. Devotionals are a guided four-step reflection on one passage. Prayer sessions are guided patterns for the practice of prayer itself. All three save alongside each other and can be found on the Notes page.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes — Settings has a one-click export of your graph nodes and study plans as Obsidian-ready markdown notes, complete with working wikilinks. It\'s a snapshot you can re-download any time, not a live sync.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes, from Settings → Danger zone. This permanently removes your profile and everything tied to it — notes, devotionals, plans, progress, and your knowledge graph.',
  },
];

export default function Help() {
  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-10 p-6 pb-16">
          <div>
            <h1 className="font-display text-3xl">Help &amp; how it works</h1>
            <p className="mt-1 text-sm text-ink-faint">
              A quick guide to every feature, useful shortcuts, and answers to common questions.
              For help actually <em>reading</em> the Bible, see the{' '}
              <Link to="/learn" className="text-teal hover:underline dark:text-gold-soft">
                Learn
              </Link>{' '}
              tab instead.
            </p>
          </div>

          {GROUPS.map((group) => (
            <section key={group.heading}>
              <h2 className="font-display text-2xl">{group.heading}</h2>
              <div className="mt-3 space-y-3">
                {group.features.map((f) => (
                  <div
                    key={f.name}
                    className="rounded-xl border border-parchment-300 bg-white p-4 dark:border-parchment-700 dark:bg-parchment-800"
                  >
                    <h3 className="font-display text-lg">{f.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-faint">{f.body}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="font-display text-2xl">Keyboard shortcuts</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-parchment-300 dark:border-parchment-700">
              <table className="w-full text-sm">
                <thead className="bg-parchment-100 text-left text-xs uppercase tracking-widest text-ink-faint dark:bg-parchment-900">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Key</th>
                    <th className="px-4 py-2 font-semibold">Where</th>
                    <th className="px-4 py-2 font-semibold">Does</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment-200 dark:divide-parchment-700">
                  {SHORTCUTS.map((s) => (
                    <tr key={s.keys} className="bg-white dark:bg-parchment-800">
                      <td className="px-4 py-2">
                        <kbd className="rounded border border-parchment-300 px-1.5 py-0.5 font-mono text-xs dark:border-parchment-700">
                          {s.keys}
                        </kbd>
                      </td>
                      <td className="px-4 py-2 text-ink-faint">{s.where}</td>
                      <td className="px-4 py-2">{s.does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Frequently asked questions</h2>
            <div className="mt-3 space-y-2">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-parchment-300 bg-white p-4 dark:border-parchment-700 dark:bg-parchment-800"
                >
                  <summary className="cursor-pointer list-none font-display text-base marker:content-none">
                    <span className="flex items-center justify-between gap-2">
                      {f.q}
                      <span className="shrink-0 text-ink-faint transition group-open:rotate-180">⌄</span>
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-faint">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
