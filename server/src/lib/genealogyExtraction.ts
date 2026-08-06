import { z } from 'zod';
import { findBook } from '../data/books.js';
import { anthropic, STUDY_MODEL } from './anthropic.js';
import { getChapter, resolveVersion } from './bibleApi.js';
import { supabase } from './supabase.js';

// Torah + Numbers focus: the classic genealogy-listing chapters, plus Ruth 4
// (needed to connect the line down to David). 1 Chronicles and the Gospel
// genealogies are deferred — denser, less reliable to auto-extract.
export const GENEALOGY_PASSAGES: Array<{ book: string; chapter: number }> = [
  { book: 'Genesis', chapter: 4 },
  { book: 'Genesis', chapter: 5 },
  { book: 'Genesis', chapter: 10 },
  { book: 'Genesis', chapter: 11 },
  { book: 'Genesis', chapter: 25 },
  { book: 'Genesis', chapter: 46 },
  { book: 'Exodus', chapter: 6 },
  { book: 'Numbers', chapter: 1 },
  { book: 'Numbers', chapter: 2 },
  { book: 'Numbers', chapter: 3 },
  { book: 'Numbers', chapter: 26 },
  { book: 'Ruth', chapter: 4 },
];

const SYSTEM_PROMPT = `You are the genealogy-extraction assistant of Scribe, a Bible study app. Given the text of one Bible chapter, extract every explicit parent-child relationship stated in it.

Respond with ONLY a JSON array — no prose, no code fences. Each element:
{"parent": "<name>", "parent_gender": "male"|"female", "child": "<name>", "child_gender": "male"|"female"|"unknown", "relationship": "father"|"mother", "verse": <verse number>}

Rules:
- Only extract relationships explicitly stated in the text given (e.g. "X became the father of Y", "the sons of X: Y, Z", "A the son of B", "she bore him C") — never from outside knowledge of the Bible.
- Use each person's most common full name form as it appears in the text.
- One element per parent-child pair — if a verse lists several children of the same parent, emit one element per child.
- "verse" must be a verse number that actually appears in the text given.`;

const itemSchema = z.object({
  parent: z.string().min(1).max(60),
  parent_gender: z.enum(['male', 'female']),
  child: z.string().min(1).max(60),
  child_gender: z.enum(['male', 'female', 'unknown']),
  relationship: z.enum(['father', 'mother']),
  verse: z.number().int().min(1),
});

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findOrCreatePerson(
  name: string,
  gender: 'male' | 'female' | 'unknown',
  ref: string,
): Promise<string | null> {
  if (!supabase) return null;
  const existing = await supabase.from('genealogy_people').select('id').eq('name', name).maybeSingle();
  if (existing.data?.id) return existing.data.id;

  const inserted = await supabase
    .from('genealogy_people')
    .insert({ name, gender, primary_ref: ref })
    .select('id')
    .single();
  if (inserted.error || !inserted.data) {
    console.warn(`[scribe] genealogy_people insert failed for "${name}":`, inserted.error?.message);
    return null;
  }
  return inserted.data.id;
}

export async function extractChapter(
  book: string,
  chapter: number,
): Promise<{ skipped: boolean; relationships: number }> {
  if (!supabase) throw new Error('Supabase is not configured');
  if (!anthropic) throw new Error('Anthropic is not configured');

  const already = await supabase
    .from('genealogy_extraction_log')
    .select('book')
    .eq('book', book)
    .eq('chapter', chapter)
    .maybeSingle();
  if (already.data) return { skipped: true, relationships: 0 };

  const bookInfo = findBook(book);
  if (!bookInfo) throw new Error(`Unknown book '${book}'`);

  const versionInfo = await resolveVersion('WEB');
  if (!versionInfo) throw new Error('Scripture text unavailable');
  const chapterContent = await getChapter(versionInfo, bookInfo.name, chapter);
  const chapterText = chapterContent.verses.map((v) => `${v.verse}. ${v.text}`).join(' ');
  const verseNumbers = new Set(chapterContent.verses.map((v) => v.verse));

  const message = await anthropic.messages.create({
    model: STUDY_MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `${bookInfo.name} ${chapter} (WEB translation):\n\n${chapterText}` }],
  });
  const raw = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .replace(/```json|```/g, '')
    .trim();

  const parsed = z.array(itemSchema).parse(JSON.parse(raw || '[]'));

  // Ground every claim against the literal chapter text before trusting it.
  const nameAppears = (name: string) => new RegExp(`\\b${escapeRegex(name)}\\b`).test(chapterText);
  const valid = parsed.filter((p) => nameAppears(p.parent) && nameAppears(p.child) && verseNumbers.has(p.verse));

  let count = 0;
  for (const p of valid) {
    const ref = `${bookInfo.name} ${chapter}:${p.verse}`;
    const parentId = await findOrCreatePerson(p.parent, p.parent_gender, ref);
    const childId = await findOrCreatePerson(p.child, p.child_gender, ref);
    if (!parentId || !childId || parentId === childId) continue;

    const { error } = await supabase
      .from('genealogy_relationships')
      .upsert(
        { parent_id: parentId, child_id: childId, relationship: p.relationship, source_ref: ref },
        { onConflict: 'parent_id,child_id', ignoreDuplicates: true },
      );
    if (error) console.warn('[scribe] genealogy_relationships insert failed:', error.message);
    else count++;
  }

  await supabase.from('genealogy_extraction_log').insert({ book: bookInfo.name, chapter, model: STUDY_MODEL });

  return { skipped: false, relationships: count };
}
