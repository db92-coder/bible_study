import { findBook } from '../data/books.js';
import { supabase } from './supabase.js';

export interface Verse {
  verse: number;
  text: string;
}

export interface ChapterContent {
  version: string;
  book: string;
  chapter: number;
  verses: Verse[];
  copyright?: string;
}

export interface VersionInfo {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

const API_BIBLE_KEY = process.env.API_BIBLE_KEY;
const API_BIBLE_BASE = 'https://rest.api.bible/v1';

// Curated subset of API.Bible's English catalog — the full list has ~40 entries
// with several near-duplicate editions. Order here is the dropdown order.
const CURATED_ABBREVIATIONS = [
  'WEB',
  'NIV11',
  'NLT',
  'NKJV',
  'engKJV',
  'ASV',
  'LSV',
  'FBV',
  'engDRA',
  'enggnv',
];

// bible-api.com translations offered when no API.Bible key is configured.
const FALLBACK_VERSIONS: VersionInfo[] = [
  { id: 'WEB', name: 'World English Bible', abbreviation: 'WEB', language: 'English' },
  { id: 'KJV', name: 'King James Version', abbreviation: 'KJV', language: 'English' },
  { id: 'ASV', name: 'American Standard Version', abbreviation: 'ASV', language: 'English' },
  { id: 'BBE', name: 'Bible in Basic English', abbreviation: 'BBE', language: 'English' },
  { id: 'DARBY', name: 'Darby Translation', abbreviation: 'DARBY', language: 'English' },
  { id: 'YLT', name: "Young's Literal Translation", abbreviation: 'YLT', language: 'English' },
];

let apiBibleVersions: VersionInfo[] | null = null;

async function apiBibleFetch(path: string): Promise<unknown> {
  const res = await fetch(`${API_BIBLE_BASE}${path}`, {
    headers: { 'api-key': API_BIBLE_KEY! },
  });
  if (!res.ok) {
    throw new Error(`API.Bible responded ${res.status} for ${path}`);
  }
  return res.json();
}

export async function listVersions(): Promise<VersionInfo[]> {
  if (!API_BIBLE_KEY) return FALLBACK_VERSIONS;
  if (apiBibleVersions) return apiBibleVersions;

  const payload = (await apiBibleFetch('/bibles?language=eng')) as {
    data: Array<{ id: string; name: string; abbreviation: string }>;
  };

  // Editions of the same translation share an abbreviation with -01/-02… ids;
  // keep the highest (most recent) edition of each.
  const byAbbrev = new Map<string, { id: string; name: string; abbreviation: string }>();
  for (const b of payload.data) {
    const existing = byAbbrev.get(b.abbreviation);
    if (!existing || b.id > existing.id) byAbbrev.set(b.abbreviation, b);
  }

  const curated = CURATED_ABBREVIATIONS.map((abbr) => byAbbrev.get(abbr)).filter(
    (b): b is NonNullable<typeof b> => Boolean(b),
  );
  const source = curated.length > 0 ? curated : [...byAbbrev.values()];

  apiBibleVersions = source.map((b) => ({
    id: b.id,
    name: b.name,
    abbreviation: b.abbreviation.replace(/^eng/, '').toUpperCase(),
    language: 'English',
  }));
  return apiBibleVersions;
}

export async function resolveVersion(version: string): Promise<VersionInfo | null> {
  const versions = await listVersions();
  return (
    versions.find((v) => v.id === version) ??
    versions.find((v) => v.abbreviation.toUpperCase() === version.toUpperCase()) ??
    null
  );
}

function parseVerseMarkers(content: string): Verse[] {
  // API.Bible text format interleaves "[n] verse text"; a verse can be split
  // across paragraphs, so the same number may appear more than once.
  const verses = new Map<number, string>();
  const re = /\[(\d+)\]\s*([^[]*)/g;
  for (const match of content.matchAll(re)) {
    const num = Number(match[1]);
    const text = match[2].replace(/\s+/g, ' ').trim();
    if (!text) continue;
    verses.set(num, verses.has(num) ? `${verses.get(num)} ${text}` : text);
  }
  return [...verses.entries()]
    .sort(([a], [b]) => a - b)
    .map(([verse, text]) => ({ verse, text }));
}

async function fetchFromApiBible(
  versionInfo: VersionInfo,
  book: string,
  chapter: number,
): Promise<ChapterContent> {
  const usfm = findBook(book)!.usfm;
  const params =
    'content-type=text&include-verse-numbers=true&include-notes=false&include-titles=false&include-chapter-numbers=false';
  const payload = (await apiBibleFetch(
    `/bibles/${versionInfo.id}/chapters/${usfm}.${chapter}?${params}`,
  )) as { data: { content: string; copyright?: string } };

  const verses = parseVerseMarkers(payload.data.content);
  if (!verses.length) {
    throw new Error(`API.Bible returned no verses for ${book} ${chapter} (${versionInfo.id})`);
  }
  return {
    version: versionInfo.id,
    book,
    chapter,
    verses,
    copyright: payload.data.copyright?.trim() || undefined,
  };
}

interface BibleApiResponse {
  verses?: Array<{ verse: number; text: string }>;
  error?: string;
}

async function fetchFromBibleApi(
  version: string,
  book: string,
  chapter: number,
): Promise<ChapterContent> {
  const ref = encodeURIComponent(`${book} ${chapter}`);
  const url = `https://bible-api.com/${ref}?translation=${version.toLowerCase()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`bible-api.com responded ${res.status} for ${book} ${chapter} (${version})`);
  }
  const data = (await res.json()) as BibleApiResponse;
  if (!data.verses?.length) {
    throw new Error(data.error ?? `No verses returned for ${book} ${chapter} (${version})`);
  }
  return {
    version: version.toUpperCase(),
    book,
    chapter,
    verses: data.verses.map((v) => ({ verse: v.verse, text: v.text.replace(/\s+/g, ' ').trim() })),
  };
}

// In-memory fallback cache for when Supabase isn't configured (dev).
const memoryCache = new Map<string, ChapterContent>();

export async function getChapter(
  versionInfo: VersionInfo,
  book: string,
  chapter: number,
): Promise<ChapterContent> {
  const cacheKey = `${versionInfo.id}/${book}/${chapter}`;

  if (supabase) {
    const cached = await supabase
      .from('scripture_cache')
      .select('content')
      .eq('version', versionInfo.id)
      .eq('book', book)
      .eq('chapter', chapter)
      .maybeSingle();
    if (cached.data?.content) {
      return cached.data.content as ChapterContent;
    }
  } else if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  const content = API_BIBLE_KEY
    ? await fetchFromApiBible(versionInfo, book, chapter)
    : await fetchFromBibleApi(versionInfo.id, book, chapter);

  if (supabase) {
    // Best-effort cache write; a failure shouldn't break the read path.
    const { error } = await supabase
      .from('scripture_cache')
      .upsert({ version: versionInfo.id, book, chapter, content });
    if (error) console.warn('[scribe] scripture_cache write failed:', error.message);
  } else {
    memoryCache.set(cacheKey, content);
  }

  return content;
}
