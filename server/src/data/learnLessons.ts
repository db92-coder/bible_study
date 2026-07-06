export interface LearnLesson {
  slug: string;
  order: number;
  title: string;
  summary: string;
  body_md: string;
  exercise: {
    prompt: string;
    book: string;
    chapter: number;
  } | null;
}

export const LEARN_LESSONS: LearnLesson[] = [
  {
    slug: 'a-library-not-a-book',
    order: 1,
    title: 'The Bible is a library, not a book',
    summary: 'Sixty-six books, dozens of authors, fifteen centuries — and one story running through it all.',
    exercise: {
      prompt: 'Read the first four verses of Luke 1. Notice that Luke tells you exactly what he\'s doing: he investigated, interviewed eyewitnesses, and wrote an orderly account so his reader could have certainty. Every biblical book has a purpose like this — sometimes stated, sometimes discovered.',
      book: 'Luke',
      chapter: 1,
    },
    body_md: `Open a Bible and you're not opening a book — you're walking into a **library**. Sixty-six books, written by dozens of authors across roughly fifteen hundred years: shepherds, kings, fishermen, a doctor, a tax collector, prophets, and at least one former terrorist of the church.

That changes how you read. You wouldn't read a law code the way you read a love poem, and the Bible contains both — plus histories, songs, biographies, letters, and visions. Each book asks to be read on its own terms (that's what the genre lessons ahead are about).

**The two big shelves.** The library has two sections. The *Old Testament* (39 books) tells the story of God and Israel — creation, promise, rescue, kingdom, exile, and a growing hope for something more. The *New Testament* (27 books) announces that the "something more" arrived: Jesus of Nazareth. The two shelves are one story; the New constantly quotes and completes the Old.

**How the addresses work.** "John 3:16" is a library address: the book of John, chapter 3, verse 16. Chapter and verse numbers were added centuries later to help people find things — they're useful, but they're not part of the original writing. Sometimes a chapter break lands mid-thought, so never assume a chapter is a self-contained unit.

**One more shelf note.** The books aren't in chronological order — they're grouped by type (law, history, poetry, prophets; then gospels, history, letters). Job may be the oldest book in the library, and it sits in the middle.

You don't need to know everything to start. You just need to know what kind of thing you're holding.`,
  },
  {
    slug: 'choosing-a-translation',
    order: 2,
    title: 'Choosing a translation',
    summary: 'The Bible was written in Hebrew and Greek. Which English door you walk through matters more than you\'d think.',
    exercise: {
      prompt: 'Read Psalm 23 in the version you normally use, then use the version switcher (top bar) to read it again in a different one — try NLT and KJV. Notice what changes and what stays the same. The meaning survives translation; the flavor differs.',
      book: 'Psalms',
      chapter: 23,
    },
    body_md: `The Bible was written in Hebrew (most of the Old Testament) and Greek (the New Testament), with a little Aramaic. Unless you read those, you'll meet the Bible in translation — and translations make choices.

**The spectrum.** Translations sit on a line between two goals:

- **Word-for-word** (formal): stays close to the original wording and structure, even when the English comes out stiff. Examples: KJV, ASV, LSV. Great for close study; harder for beginners.
- **Thought-for-thought** (dynamic): translates the *meaning* of each phrase into natural English. Example: NLT. Wonderfully readable; occasionally makes an interpretive call for you.
- Many land in between — the WEB (this app's default) is a modern, balanced revision in plain public-domain English.

**Which should you use?** For your first read-through: something readable — **NLT** or **WEB** in this app. You cannot understand a sentence you have to decode first. Later, when you study a passage closely, compare a word-for-word version; where translations differ, something interesting is usually happening in the original language (that's what the Culture page's lexicon is for).

**Is the old-sounding one holier?** No. The King James Version (1611) is a monument of the English language, but "thee" and "thou" were simply *normal English* in 1611. The New Testament itself was written in *koine* — common, street-level Greek. God's pattern has always been to speak the language people actually use.

**One warning.** No major translation hides the gospel from you. The differences are real but modest — read any of them with attention and you'll meet the same God.`,
  },
  {
    slug: 'three-questions',
    order: 3,
    title: 'The three context questions',
    summary: 'Who wrote it? To whom? Why? Every passage opens up when you ask these before "what does this mean to me."',
    exercise: {
      prompt: 'Read Philemon — it\'s one page. Then answer the three questions: Who is writing (and from where)? To whom? What does he want to happen? Watch how the whole letter snaps into focus. The context panel on the right can check your answers.',
      book: 'Philemon',
      chapter: 1,
    },
    body_md: `Every book in the Bible was written by someone, to someone, for a reason. The fastest way to level up your reading is to ask three questions *before* asking what a passage means for you:

**1. Who wrote it — and when, and from where?** Paul writing from prison sounds different when you know he's in prison ("I have learned to be content in every circumstance" — Philippians 4 — is written in chains). David's psalms of fear come from actual caves, hunted by an actual king.

**2. To whom?** Almost every biblical book was written to a *community with a situation*: Israel about to enter the land, a church splitting over status, believers scattered by persecution. When Paul writes "you," it's usually plural — closer to "y'all." Reading someone else's mail is exactly what we're doing, and it's fine — but you have to remember whose mail it is first.

**3. Why?** What prompted this? What did the author want to *happen* in the readers? Luke tells you outright (Luke 1:1–4). For others you infer it — and this app's context panel gives you each book's author, audience, and purpose for exactly this reason.

**Then — and only then — the bridge to you.** The classic sequence is: what did it mean *to them, then*? What timeless truth is underneath? What does that truth look like *for me, now*? Skipping the first step is how "I can do all things through Christ" becomes a slogan for sports finals instead of a prisoner's secret of contentment.

This isn't academic distance — it's respect. You listen to a friend better when you know what kind of week they've had. Same here.`,
  },
  {
    slug: 'reading-narrative',
    order: 4,
    title: 'Reading narrative: stories that show, not tell',
    summary: 'Almost half the Bible is story — and biblical stories rarely stop to say "don\'t try this at home."',
    exercise: {
      prompt: 'Read Genesis 37 — the beginning of Joseph\'s story. Notice what the narrator does NOT say: no verdict on Jacob\'s favoritism, Joseph\'s tattling, or the brothers\' cruelty. The story shows a family being destroyed by favoritism and lets you feel it. Where does the chapter make you wince? That wince is the story working.',
      book: 'Genesis',
      chapter: 37,
    },
    body_md: `Nearly half the Bible is narrative — and it's superb storytelling: lean, fast, and famously reluctant to editorialize. That reluctance is where new readers get tripped.

**Described is not endorsed.** Abraham lies about his wife. Jacob deceives his blind father. David — "a man after God's own heart" — commits adultery and arranges a murder. The Bible reports all of it without flinching, and usually *without comment*. Biblical narrative shows you what happened and trusts you to watch what follows. The verdict is usually in the *consequences*: Jacob the deceiver is deceived for twenty years; David's sword never leaves his own house. If you're waiting for the narrator to say "this was wrong," you'll miss that the story has been saying it all along.

**Watch for repetition.** Hebrew storytelling underlines by repeating. When a word or scene comes back — Jacob and *garments* of deception, Joseph and *garments* stripped from him — the echo is the point.

**The hero is God.** Biblical characters are not moral examples first; most of them are cautionary at least half the time. The consistent hero of every narrative is God, working his promise through flawed people. "What does this teach me to do?" is often the wrong first question. Better: *what is God doing here, often despite everyone?*

**Scenes, not verses.** Narrative meaning lives at the level of the scene and the arc. Read whole chapters — whole stories — before you zoom in on a verse. A single verse of a story out of context is like a single frame of a film.`,
  },
  {
    slug: 'reading-poetry-and-wisdom',
    order: 5,
    title: 'Reading poetry & wisdom',
    summary: 'A third of the Bible is poetry. It rhymes ideas instead of sounds — and proverbs are compasses, not contracts.',
    exercise: {
      prompt: 'Read Psalm 1. Find the parallel lines in verse 1 (walk / stand / sit — watch the progression), and the big image: a tree planted by streams versus chaff blown by wind. What is the psalm inviting you to *feel* about the two paths, not just know?',
      book: 'Psalms',
      chapter: 1,
    },
    body_md: `About a third of the Bible is poetry — Psalms, Job, Proverbs, the prophets' oracles. Poetry works on you differently than prose: it aims at the imagination and the affections, not just the intellect.

**Ideas rhyme, not sounds.** Hebrew poetry's engine is *parallelism* — saying something twice in different words, or saying it and then intensifying it:

> "The heavens declare the glory of God; / the skies proclaim the work of his hands."

The second line isn't new information; it's the same truth turned so the light catches it differently. When you spot parallel lines, read them together — the meaning is in the pair, and the *differences* between the halves are often where the insight lives.

**Images mean truly, not literally.** God is a rock, a shepherd, a fortress, a mother hen. The psalmist's tears are his food; mountains skip like rams. Poetry says true things through pictures. Asking "is this literal?" is usually the wrong tool — ask "what does this image make me see and feel that a plain statement wouldn't?"

**Proverbs are compasses, not contracts.** "Train up a child in the way he should go, and when he is old he will not depart from it" is *wisdom* — a description of how life generally works — not a *promise* that guarantees outcomes. Treating proverbs as contracts breaks hearts (and misreads the genre; the book of Job exists partly to protest that misreading).

**Let the laments teach you.** A third of the psalms are complaints — "How long, O LORD?" God included them in his songbook. You're allowed to pray like that; the poets did.`,
  },
  {
    slug: 'prophets-gospels-letters',
    order: 6,
    title: 'Prophets, gospels, letters & visions',
    summary: 'Four more genres, four more reading postures — covenant lawyers, theological biographies, one side of a phone call, and picture-language hope.',
    exercise: {
      prompt: 'Read Amos 5. Watch the prophet\'s two moves: confronting Israel\'s injustice (crooked courts, trampled poor) and calling them back ("Seek me and live"). Notice verse 24 — justice rolling like a river. Prophecy is mostly this: covenant confrontation and covenant hope, not crystal-ball prediction.',
      book: 'Amos',
      chapter: 5,
    },
    body_md: `Four more genres complete your toolkit:

**Prophets: covenant lawyers, not fortune-tellers.** Only a small fraction of prophecy predicts the far future. Mostly, prophets are *prosecutors of the covenant*: they confront Israel with the agreement made at Sinai — idolatry, injustice, empty worship — announce consequences, and hold out hope of restoration. Read a prophet asking: what is being confronted? what is being promised? The wildest hope passages usually point beyond their moment — which is why the New Testament quotes them constantly.

**Gospels: theological biographies.** Matthew, Mark, Luke, and John are lives of Jesus — but each is *preaching* as it narrates, selecting and arranging to show you who Jesus is (Luke tells you so: "that you may have certainty"). Four gospels aren't a redundancy; they're four portraits of one face. Read them watching what each writer emphasizes — Matthew's fulfilled Scriptures, Mark's urgency, Luke's outsiders, John's glory.

**Letters: one side of a phone call.** The epistles answer situations we mostly have to infer — you're hearing Paul's side of a conversation. That's why the context questions (lesson 3) matter most here. Follow the argument across whole paragraphs; "therefore" is the most important word in the epistles, and it always sends you backward.

**Apocalyptic: hope in picture language.** Revelation (and parts of Daniel, Ezekiel, Zechariah) is *apocalyptic* — a genre of vivid, symbolic vision written for people under pressure. Beasts, numbers, and colors carry meaning the first readers could decode. Hold the images loosely, hold the message tightly: evil is real, it loses, the Lamb wins. Faithful readers have mapped the details differently for two thousand years — interpretations differ, and that's okay.`,
  },
  {
    slug: 'context-is-king',
    order: 7,
    title: 'Context is king: how verses get misused',
    summary: 'A text without a context becomes a pretext. The famous-verse test cases — and how to check any verse in sixty seconds.',
    exercise: {
      prompt: 'Read Jeremiah 29 — the whole chapter, not just verse 11. Who is "you" in "plans to prosper you"? What are they being told to do in verses 4–7? How long will they wait (v. 10)? Feel how the promise gets *deeper*, not smaller, when it\'s read in place.',
      book: 'Jeremiah',
      chapter: 29,
    },
    body_md: `The old saying is true: *a text without a context is a pretext for a proof-text.* Two famous test cases:

**"I know the plans I have for you… plans to prosper you" (Jeremiah 29:11).** Beloved on graduation cards — but read the chapter. It's a letter to exiles whose city was destroyed, telling them to *settle in Babylon for seventy years* — build houses, plant gardens, seek the peace of the empire that conquered them. The promise is real, but it's spoken to a community facing a lifetime of waiting, and most of the original hearers would die before it came true. In context the verse isn't "your career will flourish" — it's "God has not abandoned his people, even in the far country, even on a seventy-year timeline." That's a *stronger* promise, not a weaker one.

**"I can do all things through him who strengthens me" (Philippians 4:13).** Not an athlete's slogan. Paul writes from prison, and "all things" in context is *contentment in every circumstance* — "I know how to be brought low, and I know how to abound." The verse promises strength to endure anything, not power to achieve anything.

**The sixty-second habit.** Before you lean on a verse: read the paragraph before and after; ask the three context questions (lesson 3); check who "you" is; ask what the verse meant *to them, then*. In this app that's fast — the context panel, chapter brief, and cross-book Connections page all exist for this.

Context never shrinks a verse. It roots it — and rooted promises hold weight.`,
  },
  {
    slug: 'prayer-and-reading',
    order: 8,
    title: 'Reading with prayer',
    summary: 'The Bible\'s own writers asked God for help reading it. A simple, ancient rhythm: pray, read, reread, notice, respond.',
    exercise: {
      prompt: 'Read Luke 24 and watch what happens on the Emmaus road: two discouraged disciples know the Scriptures, but their eyes are opened to see Jesus in them only when he walks with them. Before you read, try the psalmist\'s prayer: "Open my eyes, that I may behold wondrous things" (Psalm 119:18).',
      book: 'Luke',
      chapter: 24,
    },
    body_md: `Everything in this track so far — genres, context, translations — treats the Bible as a book, because it is one. But the Bible's own writers insist it's also more than one, and they model something surprising: *they pray before they read.*

"Open my eyes, that I may behold wondrous things out of your law" (Psalm 119:18) — that's a Bible reader asking God for help reading the Bible. The claim underneath is that understanding Scripture is not only an intellectual task but a relational one: the same God who spoke it is present while you read it, and can be asked.

**A simple rhythm** (Christians have practiced versions of this for many centuries):

1. **Pray** — one honest sentence is enough. *"Open my eyes. Speak, Lord."*
2. **Read** — a whole chapter or story, using everything you've learned: genre, context, the big picture.
3. **Reread** — slower. Meaning that hides from a first pass often surrenders to a second.
4. **Notice** — what snags you? A phrase that comforts, a verse that confuses, a command that stings? Write it down (the note tools here are one tap away). Confusion is worth noting too — today's question is often next month's discovery.
5. **Respond** — talk back to God about what you noticed. Thank, ask, confess, or simply sit with it.

**Keep the two wings together.** Study without prayer can go dry; prayer without study can drift. The Emmaus road story (this lesson's exercise) holds them together perfectly: careful attention to the Scriptures, *and* eyes opened by the Lord himself.

You now have the whole toolkit. Read widely, read slowly, read prayerfully — and use every tool in this app as scaffolding around the real thing: meeting God in his word.`,
  },
  {
    slug: 'writing-a-devotional',
    order: 9,
    title: 'Writing your own devotional',
    summary: 'Turn a verse that matters to you into a practice: observe, interpret, apply, pray — in your own words.',
    exercise: {
      prompt: 'Read Psalm 121 slowly, twice. Pick the line that catches you most. Then open the Devotional builder (the 🕊 button on your Notes page, or "Devotional" when you select verses in the reader) and walk it through the four steps. Your first one doesn\'t need to be good — it needs to be yours.',
      book: 'Psalms',
      chapter: 121,
    },
    body_md: `A devotional is not a book someone else wrote — at its heart, it's a *practice*: taking one passage and sitting with it until it has said something to you. Reading other people's devotionals is fine; writing your own changes you, because writing forces noticing.

The classic shape (sometimes called **SOAP**) has four movements:

**1. Observation — what does it say?** Read the passage twice, slowly. Who is speaking, to whom? Which words repeat? What surprises you? Don't rush to meaning; the discipline of plain *noticing* is where depth begins. Most shallow readings skip this step entirely.

**2. Interpretation — what did it mean to them?** Everything you learned in lessons 3–7 works here: the passage meant something to its first hearers before it means something to you. Use the context panel, the chapter brief, the cross-references. This step is what separates a devotional from a mirror — without it, we only ever hear our own thoughts read back in a holy voice.

**3. Application — what does it mean for me?** Now the bridge: if that's what it meant to them, what timeless truth carries across, and what does it look like in your actual week? Be concrete. "Trust God more" is a poster. "Bring Thursday's hard conversation to God before I have it" is an application.

**4. Prayer — respond.** Turn what you saw into words to God: thanks, asking, confession, or simply sitting with it. The psalms prove that honesty outranks eloquence.

**Three habits that make devotionals better:**
- *Small text, deep well.* One to four verses beats a whole chapter. Depth over distance.
- *Same verse, twice.* Returning to a passage weeks later — your saved devotionals live with your notes, anchored to the verse — shows you how it and you have both moved.
- *Feelings anchored to meaning.* A verse can be precious for what it *did* in your life; let it also be precious for what it *says*. The two together are stronger than either alone.

This app's Devotional builder walks you through all four movements, with a coach that only ever asks questions — because the point of a devotional is never that it's well written. It's that it's *yours*.`,
  },
  {
    slug: 'learning-to-pray',
    order: 10,
    title: 'Learning to pray',
    summary: 'Prayer is a skill you grow into, not a gift you either have or don\'t. Three patterns to borrow while you find your own voice.',
    exercise: {
      prompt: 'Read Matthew 6:9–13 slowly, out loud if you can. Then open the Prayer tab and try "The Lord\'s Prayer Pattern" — walk through all six movements in your own words. It will feel unfamiliar the first time. That\'s normal; so did reading, once.',
      book: 'Matthew',
      chapter: 6,
    },
    body_md: `If reading the Bible can feel intimidating to a beginner, prayer often feels more so — there's no page to look at, no structure to follow, just you and the silence. The good news: prayer is a skill, and skills are learned by practice and pattern, not conjured from nowhere.

**Jesus gave his own disciples a pattern.** When they asked him to teach them to pray — not to explain prayer, but to *teach* them, like a skill — he gave them words (Matthew 6:9–13; Luke 11:1–4). That alone tells you something: even people who walked with Jesus daily needed a template. You're in good company.

**Patterns are training wheels, not a cage.** Using a structure doesn't make prayer less personal — the words become the frame you pour your own honesty into. Over time you'll pray these patterns less rigidly and more like second nature, the way a musician needs scales at first and eventually just *plays*.

**Three patterns worth knowing** (all three are built into this app's Prayer tab, with teaching at every step):

1. **The Lord's Prayer pattern** — six movements straight from Matthew 6: adoration, surrender, provision, confession, protection, praise. The most direct answer to "how do I pray?" that exists, because it's the one Jesus himself gave.
2. **ACTS** — Adoration, Confession, Thanksgiving, Supplication. A simple four-part shape many Christians default to, useful because the order matters: praise and honesty come before the wish list.
3. **Praying a psalm** — when you don't have words, borrow some. The Psalms are Israel's own prayer book, and praying one back to God — noticing its movement, echoing its lines, adding your own response — is one of the oldest spiritual practices there is.

**Planning matters too.** Prayer isn't only structure in the moment — it's also remembering what to bring. The Prayer tab keeps a running list of what you're praying for, organized simply (a person, a situation, the world, a thanksgiving), so requests don't get forgotten between Sundays. And when something is answered, mark it — building your own written record of God's faithfulness is one of the most quietly powerful habits in the Christian life. Years from now, that list will preach to you.

**One last thing.** None of this is about performing eloquent prayers. Some of Scripture's shortest prayers are among its most honest — "Lord, save me" (Matthew 14:30), "God, be merciful to me, a sinner" (Luke 18:13). If a pattern ever feels like it's getting in the way of honesty, drop the pattern and just talk. That was always the point.`,
  },
];

export const LESSONS_BY_SLUG = new Map(LEARN_LESSONS.map((l) => [l.slug, l]));
