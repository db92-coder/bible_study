export interface BookInfo {
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
  osis: string; // OSIS book code used in verse references (e.g. John.3.16)
}

export const BOOKS: BookInfo[] = [
  { name: 'Genesis', chapters: 50, testament: 'OT', osis: 'Gen' },
  { name: 'Exodus', chapters: 40, testament: 'OT', osis: 'Exod' },
  { name: 'Leviticus', chapters: 27, testament: 'OT', osis: 'Lev' },
  { name: 'Numbers', chapters: 36, testament: 'OT', osis: 'Num' },
  { name: 'Deuteronomy', chapters: 34, testament: 'OT', osis: 'Deut' },
  { name: 'Joshua', chapters: 24, testament: 'OT', osis: 'Josh' },
  { name: 'Judges', chapters: 21, testament: 'OT', osis: 'Judg' },
  { name: 'Ruth', chapters: 4, testament: 'OT', osis: 'Ruth' },
  { name: '1 Samuel', chapters: 31, testament: 'OT', osis: '1Sam' },
  { name: '2 Samuel', chapters: 24, testament: 'OT', osis: '2Sam' },
  { name: '1 Kings', chapters: 22, testament: 'OT', osis: '1Kgs' },
  { name: '2 Kings', chapters: 25, testament: 'OT', osis: '2Kgs' },
  { name: '1 Chronicles', chapters: 29, testament: 'OT', osis: '1Chr' },
  { name: '2 Chronicles', chapters: 36, testament: 'OT', osis: '2Chr' },
  { name: 'Ezra', chapters: 10, testament: 'OT', osis: 'Ezra' },
  { name: 'Nehemiah', chapters: 13, testament: 'OT', osis: 'Neh' },
  { name: 'Esther', chapters: 10, testament: 'OT', osis: 'Esth' },
  { name: 'Job', chapters: 42, testament: 'OT', osis: 'Job' },
  { name: 'Psalms', chapters: 150, testament: 'OT', osis: 'Ps' },
  { name: 'Proverbs', chapters: 31, testament: 'OT', osis: 'Prov' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'OT', osis: 'Eccl' },
  { name: 'Song of Solomon', chapters: 8, testament: 'OT', osis: 'Song' },
  { name: 'Isaiah', chapters: 66, testament: 'OT', osis: 'Isa' },
  { name: 'Jeremiah', chapters: 52, testament: 'OT', osis: 'Jer' },
  { name: 'Lamentations', chapters: 5, testament: 'OT', osis: 'Lam' },
  { name: 'Ezekiel', chapters: 48, testament: 'OT', osis: 'Ezek' },
  { name: 'Daniel', chapters: 12, testament: 'OT', osis: 'Dan' },
  { name: 'Hosea', chapters: 14, testament: 'OT', osis: 'Hos' },
  { name: 'Joel', chapters: 3, testament: 'OT', osis: 'Joel' },
  { name: 'Amos', chapters: 9, testament: 'OT', osis: 'Amos' },
  { name: 'Obadiah', chapters: 1, testament: 'OT', osis: 'Obad' },
  { name: 'Jonah', chapters: 4, testament: 'OT', osis: 'Jonah' },
  { name: 'Micah', chapters: 7, testament: 'OT', osis: 'Mic' },
  { name: 'Nahum', chapters: 3, testament: 'OT', osis: 'Nah' },
  { name: 'Habakkuk', chapters: 3, testament: 'OT', osis: 'Hab' },
  { name: 'Zephaniah', chapters: 3, testament: 'OT', osis: 'Zeph' },
  { name: 'Haggai', chapters: 2, testament: 'OT', osis: 'Hag' },
  { name: 'Zechariah', chapters: 14, testament: 'OT', osis: 'Zech' },
  { name: 'Malachi', chapters: 4, testament: 'OT', osis: 'Mal' },
  { name: 'Matthew', chapters: 28, testament: 'NT', osis: 'Matt' },
  { name: 'Mark', chapters: 16, testament: 'NT', osis: 'Mark' },
  { name: 'Luke', chapters: 24, testament: 'NT', osis: 'Luke' },
  { name: 'John', chapters: 21, testament: 'NT', osis: 'John' },
  { name: 'Acts', chapters: 28, testament: 'NT', osis: 'Acts' },
  { name: 'Romans', chapters: 16, testament: 'NT', osis: 'Rom' },
  { name: '1 Corinthians', chapters: 16, testament: 'NT', osis: '1Cor' },
  { name: '2 Corinthians', chapters: 13, testament: 'NT', osis: '2Cor' },
  { name: 'Galatians', chapters: 6, testament: 'NT', osis: 'Gal' },
  { name: 'Ephesians', chapters: 6, testament: 'NT', osis: 'Eph' },
  { name: 'Philippians', chapters: 4, testament: 'NT', osis: 'Phil' },
  { name: 'Colossians', chapters: 4, testament: 'NT', osis: 'Col' },
  { name: '1 Thessalonians', chapters: 5, testament: 'NT', osis: '1Thess' },
  { name: '2 Thessalonians', chapters: 3, testament: 'NT', osis: '2Thess' },
  { name: '1 Timothy', chapters: 6, testament: 'NT', osis: '1Tim' },
  { name: '2 Timothy', chapters: 4, testament: 'NT', osis: '2Tim' },
  { name: 'Titus', chapters: 3, testament: 'NT', osis: 'Titus' },
  { name: 'Philemon', chapters: 1, testament: 'NT', osis: 'Phlm' },
  { name: 'Hebrews', chapters: 13, testament: 'NT', osis: 'Heb' },
  { name: 'James', chapters: 5, testament: 'NT', osis: 'Jas' },
  { name: '1 Peter', chapters: 5, testament: 'NT', osis: '1Pet' },
  { name: '2 Peter', chapters: 3, testament: 'NT', osis: '2Pet' },
  { name: '1 John', chapters: 5, testament: 'NT', osis: '1John' },
  { name: '2 John', chapters: 1, testament: 'NT', osis: '2John' },
  { name: '3 John', chapters: 1, testament: 'NT', osis: '3John' },
  { name: 'Jude', chapters: 1, testament: 'NT', osis: 'Jude' },
  { name: 'Revelation', chapters: 22, testament: 'NT', osis: 'Rev' },
];

export function findBook(name: string): BookInfo | undefined {
  return BOOKS.find((b) => b.name.toLowerCase() === name.toLowerCase());
}

const byOsis = new Map(BOOKS.map((b) => [b.osis, b]));

/** "John.3.16" → { book: "John", chapter: 3, verse: 16, label: "John 3:16" } */
export function parseOsisRef(
  ref: string,
): { book: string; chapter: number; verse: number | null; label: string } | null {
  const [osisBook, chapterStr, verseStr] = ref.split('.');
  const book = byOsis.get(osisBook);
  if (!book) return null;
  const chapter = Number(chapterStr) || 1;
  const verse = verseStr ? Number(verseStr) : null;
  return {
    book: book.name,
    chapter,
    verse,
    label: `${book.name} ${chapter}${verse ? `:${verse}` : ''}`,
  };
}

export function adjacentChapter(
  book: string,
  chapter: number,
  direction: 1 | -1,
): { book: string; chapter: number } | null {
  const idx = BOOKS.findIndex((b) => b.name.toLowerCase() === book.toLowerCase());
  if (idx === -1) return null;

  const next = chapter + direction;
  if (next >= 1 && next <= BOOKS[idx].chapters) {
    return { book: BOOKS[idx].name, chapter: next };
  }
  const neighbor = BOOKS[idx + direction];
  if (!neighbor) return null;
  return { book: neighbor.name, chapter: direction === 1 ? 1 : neighbor.chapters };
}
