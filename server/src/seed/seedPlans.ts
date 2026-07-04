import '../env.js';

import { supabase } from '../lib/supabase.js';
import { SYSTEM_UID } from '../routes/plans.js';

interface SeedDay {
  day_number: number;
  passages: Array<{ book: string; chapter_start: number; chapter_end?: number }>;
  reflection_prompt: string;
}

interface SeedPlan {
  title: string;
  description: string;
  days: SeedDay[];
}

const johnPrompts = [
  'What does "the Word became flesh" tell you about who Jesus is?',
  'What does the first sign at Cana reveal about Jesus\'s glory?',
  'What does it mean to be "born again"? Why did Nicodemus struggle with it?',
  'How does Jesus cross social boundaries with the Samaritan woman?',
  'Why does healing on the Sabbath provoke such conflict?',
  'What does "I am the bread of life" mean for daily dependence on Christ?',
  'Why are the crowds divided over Jesus? Where do you see that today?',
  'What does "the truth will set you free" mean in context?',
  'How does the healed blind man\'s understanding of Jesus grow through the chapter?',
  'What comfort do you draw from the Good Shepherd\'s voice and grip?',
  'How does Jesus respond to grief before he raises Lazarus?',
  'Mary anoints Jesus at great cost. What would extravagant devotion look like for you?',
  'Jesus washes feet: whose feet — literally or figuratively — could you wash this week?',
  'Which of the "many rooms" promises of chapter 14 do you most need right now?',
  'What does abiding in the vine look like practically for you?',
  'What work does Jesus say the Spirit will do — and where do you see it?',
  'What stands out in how Jesus prays for you (17:20) before the cross?',
  'Watch how Jesus remains in command through arrest and trial. What does that show?',
  '"It is finished." What exactly was finished at the cross?',
  'How does the empty tomb change Mary\'s despair — and yours?',
  'Jesus restores Peter after failure. What failure might he be restoring in you?',
];

const PLANS: SeedPlan[] = [
  {
    title: 'The Gospel of John in 21 Days',
    description:
      'One chapter a day through the Gospel written "that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in his name."',
    days: Array.from({ length: 21 }, (_, i) => ({
      day_number: i + 1,
      passages: [{ book: 'John', chapter_start: i + 1 }],
      reflection_prompt: johnPrompts[i],
    })),
  },
  {
    title: 'The Life of David in 14 Days',
    description:
      'From shepherd boy to king of Israel — anointing, Goliath, the wilderness years, the throne, the fall, and the promise of an everlasting kingdom.',
    days: [
      { day_number: 1, passages: [{ book: '1 Samuel', chapter_start: 16 }], reflection_prompt: 'God looks at the heart, not the appearance. Where do you judge by externals?' },
      { day_number: 2, passages: [{ book: '1 Samuel', chapter_start: 17 }], reflection_prompt: 'David\'s confidence came from past faithfulness — the lion and the bear. What "lions" has God already brought you through?' },
      { day_number: 3, passages: [{ book: '1 Samuel', chapter_start: 18, chapter_end: 19 }], reflection_prompt: 'Saul\'s jealousy grows as David\'s star rises. How do you handle others\' success?' },
      { day_number: 4, passages: [{ book: '1 Samuel', chapter_start: 20 }], reflection_prompt: 'Jonathan chose covenant friendship over his own claim to the throne. What did that cost him?' },
      { day_number: 5, passages: [{ book: '1 Samuel', chapter_start: 24 }, { book: 'Psalms', chapter_start: 57 }], reflection_prompt: 'David spares Saul in the cave. Why is refusing to seize power an act of faith?' },
      { day_number: 6, passages: [{ book: '1 Samuel', chapter_start: 25 }], reflection_prompt: 'Abigail\'s wisdom stops David from bloodguilt. Who has God used to restrain you?' },
      { day_number: 7, passages: [{ book: '1 Samuel', chapter_start: 30 }, { book: 'Psalms', chapter_start: 18 }], reflection_prompt: 'At Ziklag David "strengthened himself in the LORD." What does that look like in your lowest moments?' },
      { day_number: 8, passages: [{ book: '2 Samuel', chapter_start: 5, chapter_end: 6 }], reflection_prompt: 'David dances before the ark with abandon. What inhibits your worship?' },
      { day_number: 9, passages: [{ book: '2 Samuel', chapter_start: 7 }], reflection_prompt: 'David wants to build God a house; God promises to build David a house — forever. How does Jesus fulfill this?' },
      { day_number: 10, passages: [{ book: '2 Samuel', chapter_start: 9 }], reflection_prompt: 'Kindness to Mephibosheth "for Jonathan\'s sake." Who could you honor for the sake of another?' },
      { day_number: 11, passages: [{ book: '2 Samuel', chapter_start: 11, chapter_end: 12 }], reflection_prompt: 'Bathsheba, Uriah, Nathan. How does unchecked desire become a cascade of sin — and how does God confront it?' },
      { day_number: 12, passages: [{ book: 'Psalms', chapter_start: 51 }], reflection_prompt: 'Pray Psalm 51 slowly as your own prayer. What does true repentance include?' },
      { day_number: 13, passages: [{ book: '2 Samuel', chapter_start: 15 }, { book: 'Psalms', chapter_start: 3 }], reflection_prompt: 'Absalom\'s rebellion: David leaves the city trusting God with the outcome. Can you release what you cannot control?' },
      { day_number: 14, passages: [{ book: '1 Kings', chapter_start: 2 }, { book: 'Psalms', chapter_start: 23 }], reflection_prompt: 'David\'s charge to Solomon, and the Shepherd psalm. What one sentence would you want to pass on?' },
    ],
  },
  {
    title: 'The Story of Redemption in 14 Days',
    description:
      'The whole sweep of the Bible in two weeks — creation, fall, covenant, exodus, kingdom, exile, Christ, church, and new creation.',
    days: [
      { day_number: 1, passages: [{ book: 'Genesis', chapter_start: 1, chapter_end: 2 }], reflection_prompt: 'What does it mean to be made in the image of God?' },
      { day_number: 2, passages: [{ book: 'Genesis', chapter_start: 3 }], reflection_prompt: 'Where do you see the promise of 3:15 — the serpent-crusher — planted in the ruins?' },
      { day_number: 3, passages: [{ book: 'Genesis', chapter_start: 12 }, { book: 'Genesis', chapter_start: 15 }], reflection_prompt: 'God\'s covenant with Abraham: all nations blessed through one family. How is that promise doing today?' },
      { day_number: 4, passages: [{ book: 'Exodus', chapter_start: 12 }, { book: 'Exodus', chapter_start: 14 }], reflection_prompt: 'Passover and the sea: redemption by blood and by power. How do both point to Christ?' },
      { day_number: 5, passages: [{ book: 'Exodus', chapter_start: 19, chapter_end: 20 }], reflection_prompt: 'Rescued first, then given the law. Why does that order matter?' },
      { day_number: 6, passages: [{ book: '2 Samuel', chapter_start: 7 }, { book: 'Psalms', chapter_start: 2 }], reflection_prompt: 'An everlasting throne promised to David\'s son. What went wrong — and what hope remained?' },
      { day_number: 7, passages: [{ book: 'Isaiah', chapter_start: 53 }], reflection_prompt: 'Read Isaiah 53 slowly. Which phrase most vividly describes what Jesus did for you?' },
      { day_number: 8, passages: [{ book: 'Jeremiah', chapter_start: 31 }], reflection_prompt: 'A new covenant, written on hearts. How is it different from the old?' },
      { day_number: 9, passages: [{ book: 'Luke', chapter_start: 1, chapter_end: 2 }], reflection_prompt: 'Count the echoes of the Old Testament promises in the birth narratives.' },
      { day_number: 10, passages: [{ book: 'Mark', chapter_start: 14, chapter_end: 15 }], reflection_prompt: 'The cross: where the whole story converges. What strikes you most in Mark\'s account?' },
      { day_number: 11, passages: [{ book: 'Luke', chapter_start: 24 }], reflection_prompt: '"Beginning with Moses and all the Prophets, he interpreted... the things concerning himself." How does resurrection reframe the whole Bible?' },
      { day_number: 12, passages: [{ book: 'Acts', chapter_start: 2 }], reflection_prompt: 'The Spirit poured out, the church born. What marks of that first community should mark yours?' },
      { day_number: 13, passages: [{ book: 'Romans', chapter_start: 8 }], reflection_prompt: 'No condemnation, no separation. Which verse of Romans 8 do you need to carry this week?' },
      { day_number: 14, passages: [{ book: 'Revelation', chapter_start: 21, chapter_end: 22 }], reflection_prompt: 'The story ends in a garden-city with God dwelling among his people. How does this ending change how you live the middle?' },
    ],
  },
];

async function main() {
  if (!supabase) {
    console.error('Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  // System profile owns the public starter plans.
  const prof = await supabase
    .from('profiles')
    .upsert({ firebase_uid: SYSTEM_UID, display_name: 'Scribe' });
  if (prof.error) {
    console.error('Creating system profile failed:', prof.error.message);
    process.exit(1);
  }

  // Idempotent: remove previous system plans, then insert fresh.
  const del = await supabase.from('study_plans').delete().eq('firebase_uid', SYSTEM_UID);
  if (del.error) {
    console.error('Clearing starter plans failed:', del.error.message);
    process.exit(1);
  }

  for (const p of PLANS) {
    const { data: plan, error } = await supabase
      .from('study_plans')
      .insert({ firebase_uid: SYSTEM_UID, title: p.title, description: p.description, is_public: true })
      .select()
      .single();
    if (error) {
      console.error(`Inserting "${p.title}" failed:`, error.message);
      process.exit(1);
    }
    const { error: dErr } = await supabase
      .from('plan_days')
      .insert(p.days.map((d) => ({ ...d, plan_id: plan.id })));
    if (dErr) {
      console.error(`Inserting days for "${p.title}" failed:`, dErr.message);
      process.exit(1);
    }
  }
  console.log(`Seeded ${PLANS.length} starter plans.`);
}

main();
