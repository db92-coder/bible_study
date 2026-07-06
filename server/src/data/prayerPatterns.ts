export interface PrayerStep {
  key: string;
  title: string;
  teaching: string;
  scripture_ref?: string;
  placeholder: string;
  show_requests?: boolean; // surface the user's active prayer list during this step
}

export interface PrayerPattern {
  slug: string;
  title: string;
  summary: string;
  intro_md: string;
  uses_passage_picker: boolean;
  default_book?: string;
  default_chapter?: number;
  steps: PrayerStep[];
}

export const PRAYER_PATTERNS: PrayerPattern[] = [
  {
    slug: 'lords-prayer',
    title: "The Lord's Prayer Pattern",
    summary: 'Six movements from the prayer Jesus taught his disciples — Matthew 6:9–13.',
    intro_md:
      'When the disciples asked Jesus to teach them to pray, he gave them a pattern, not a script to recite once and forget (Matthew 6:9–13; Luke 11:1–4). Each phrase is a movement of prayer — worship, surrender, need, confession, protection, praise. Walk through them slowly, in your own words.',
    uses_passage_picker: false,
    steps: [
      {
        key: 'adoration',
        title: 'Adoration — "Our Father in heaven, hallowed be your name"',
        scripture_ref: 'Matthew 6:9',
        teaching:
          'Prayer begins not with a request but with who God is. "Father" means you are welcomed as a child, not an outsider; "hallowed" means set apart, holy, worthy of reverence. Before you ask for anything, say who he is.',
        placeholder: 'Father, I praise you because you are…',
      },
      {
        key: 'surrender',
        title: 'Surrender — "Your kingdom come, your will be done"',
        scripture_ref: 'Matthew 6:10',
        teaching:
          'This is the pivot of the whole prayer: asking for God\'s reign and will, not your own agenda, to prevail — in the world, and in the specific situation in front of you today.',
        placeholder: 'Lord, in this situation, let your will be done, not mine, especially in…',
      },
      {
        key: 'provision',
        title: 'Provision — "Give us today our daily bread"',
        scripture_ref: 'Matthew 6:11',
        teaching:
          'Now bring your actual needs — today\'s, not next year\'s. This is where your own requests belong, and where anyone else\'s you carry belong too. Naming needs plainly is not a lack of faith; it is what a child does with a Father.',
        placeholder: 'Father, today I need…',
        show_requests: true,
      },
      {
        key: 'confession',
        title: 'Confession — "Forgive us our debts, as we forgive our debtors"',
        scripture_ref: 'Matthew 6:12',
        teaching:
          'Name what needs forgiving — honestly, specifically. Then do the harder half of the sentence: who do you need to forgive? Jesus ties the two together deliberately (see also Matthew 6:14–15).',
        placeholder: 'Father, forgive me for… And help me to forgive…',
      },
      {
        key: 'protection',
        title: 'Protection — "Lead us not into temptation, deliver us from evil"',
        scripture_ref: 'Matthew 6:13',
        teaching:
          'Ask for real protection over the specific pressures and pulls you actually face — not a vague "keep me safe," but the temptation you know is coming this week.',
        placeholder: 'Lord, guard me against…',
      },
      {
        key: 'praise',
        title: 'Praise — "For yours is the kingdom, the power, and the glory"',
        scripture_ref: 'Matthew 6:13',
        teaching:
          'End where you began: praise. The prayer that started by naming who God is closes the same way — a reminder that everything you just asked belongs to a Father who already reigns.',
        placeholder: 'Because the kingdom, the power, and the glory are yours, I trust you with…',
      },
    ],
  },
  {
    slug: 'acts',
    title: 'ACTS',
    summary: 'Adoration, Confession, Thanksgiving, Supplication — a simple, sturdy four-part shape.',
    intro_md:
      'ACTS is a well-worn scaffold many Christians use to keep prayer from becoming only a wish list: worship first, then honesty, then gratitude, and only then requests. None of the four is optional — each shapes the others.',
    uses_passage_picker: false,
    steps: [
      {
        key: 'adoration',
        title: 'Adoration — praise God for who he is',
        teaching:
          'Not for what he\'s done for you yet — for his character. His holiness, faithfulness, power, patience, love. Naming an attribute and dwelling on it is itself a form of prayer.',
        placeholder: 'God, I praise you for your…',
      },
      {
        key: 'confession',
        title: 'Confession — agree with God honestly',
        teaching:
          'Confession simply means agreeing with God about what\'s true. Be specific rather than general ("I was impatient with my daughter this morning" rather than "I sin a lot"). 1 John 1:9 promises this is met with forgiveness, not rejection.',
        placeholder: 'Father, I confess that…',
      },
      {
        key: 'thanksgiving',
        title: 'Thanksgiving — name specific gifts',
        teaching:
          'Gratitude sharpens with specificity. Not "thank you for everything" but the actual gift, answered prayer, or unexpected kindness from this week.',
        placeholder: 'Thank you, Lord, for…',
      },
      {
        key: 'supplication',
        title: 'Supplication — bring your requests',
        teaching:
          'Now ask — for yourself and for others. Philippians 4:6 pairs this directly with thanksgiving: "in everything, by prayer and petition, with thanksgiving, present your requests to God."',
        placeholder: 'Lord, I ask you for…',
        show_requests: true,
      },
    ],
  },
  {
    slug: 'praying-a-psalm',
    title: 'Praying a Psalm',
    summary: 'Let an ancient prayer become your own — read, notice its movement, echo it, respond.',
    intro_md:
      'The Psalms are prayers, not just readings — Israel\'s own prayer book, given to us. When you don\'t know what to pray, borrowing a psalm\'s words and movement is one of the oldest practices there is. Pick a psalm below (or any that you\'re drawn to) and let it lead you.',
    uses_passage_picker: true,
    default_book: 'Psalms',
    default_chapter: 23,
    steps: [
      {
        key: 'notice',
        title: 'Notice the movement',
        teaching:
          'Read the psalm twice. Psalms move — often from complaint to trust, or from praise to petition. Where does this one start, and where does it end up? What is its mood?',
        placeholder: 'This psalm moves from… to… Its mood feels like…',
      },
      {
        key: 'echo',
        title: 'Echo it back to God',
        teaching:
          'Paraphrase a few of its lines in your own words, as if you were the one saying them to God right now. You don\'t need to cover the whole psalm — one or two verses that strike you are enough.',
        placeholder: 'Lord, like the psalmist says, I…',
      },
      {
        key: 'respond',
        title: 'Respond',
        teaching:
          'Now pray your own response — whatever the psalm stirred up: trust, lament, praise, a request. Let its honesty give you permission for yours.',
        placeholder: 'Father, in response to this psalm, I want to say…',
        show_requests: true,
      },
    ],
  },
];

export const PATTERNS_BY_SLUG = new Map(PRAYER_PATTERNS.map((p) => [p.slug, p]));
