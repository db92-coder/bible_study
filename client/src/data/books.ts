export type Genre =
  | 'narrative'
  | 'law'
  | 'poetry'
  | 'prophecy'
  | 'gospel'
  | 'letter'
  | 'apocalyptic';

export interface BookInfo {
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
  osis: string; // OSIS book code used in verse references (e.g. John.3.16)
  genre: Genre;
}

export interface GenreInfo {
  label: string;
  color: string;
  howToRead: string;
  lessonSlug: string;
}

export const GENRE_INFO: Record<Genre, GenreInfo> = {
  narrative: {
    label: 'Narrative',
    color: '#2f6f6a',
    howToRead:
      'This is a story — read whole scenes, not single verses. What a character does is described, not necessarily endorsed; watch the consequences, and watch what God is doing through flawed people. He is the real hero of every biblical story.',
    lessonSlug: 'reading-narrative',
  },
  law: {
    label: 'Law & Covenant',
    color: '#8b5e34',
    howToRead:
      'These books mix story with covenant law — the terms of Israel\'s relationship with God after the rescue from Egypt. Notice the order: God saves first, then gives the law. Ask what each law protected or taught in its ancient setting before asking how it speaks today.',
    lessonSlug: 'three-questions',
  },
  poetry: {
    label: 'Poetry & Wisdom',
    color: '#7a4a8b',
    howToRead:
      'This is poetry — it rhymes ideas, not sounds. Read parallel lines as pairs, let images work on your imagination, and remember that proverbs describe how life generally works; they are compasses, not contracts.',
    lessonSlug: 'reading-poetry-and-wisdom',
  },
  prophecy: {
    label: 'Prophecy',
    color: '#8b3a3a',
    howToRead:
      'Prophets are covenant prosecutors more than fortune-tellers: they confront God\'s people with broken promises and call them home. Ask what is being confronted and what is being promised — the great hope passages look beyond their moment, which is why the New Testament quotes them so often.',
    lessonSlug: 'prophets-gospels-letters',
  },
  gospel: {
    label: 'Gospel',
    color: '#b48a3c',
    howToRead:
      'A gospel is a theological biography — a true life of Jesus, told to show you who he is. Each writer selects and arranges deliberately, so watch this book\'s particular emphases, and read stories and teaching in the flow of the whole.',
    lessonSlug: 'prophets-gospels-letters',
  },
  letter: {
    label: 'Letter',
    color: '#4a6fa5',
    howToRead:
      'You are reading one side of a conversation — a real letter to a real community with a situation. Ask who it\'s to and what prompted it (the context panel can tell you), and follow the argument across whole paragraphs. "Therefore" always points backward.',
    lessonSlug: 'three-questions',
  },
  apocalyptic: {
    label: 'Apocalyptic',
    color: '#6b3a52',
    howToRead:
      'This is apocalyptic — hope in picture language, written for people under pressure. Beasts, numbers, and colors are symbols the first readers could decode. Hold the images loosely and the message tightly: evil is real, it loses, the Lamb wins. Interpretations of the details differ, and that\'s okay.',
    lessonSlug: 'prophets-gospels-letters',
  },
};

export const BOOKS: BookInfo[] = [
  { name: 'Genesis', chapters: 50, testament: 'OT', osis: 'Gen' , genre: 'narrative' },
  { name: 'Exodus', chapters: 40, testament: 'OT', osis: 'Exod' , genre: 'law' },
  { name: 'Leviticus', chapters: 27, testament: 'OT', osis: 'Lev' , genre: 'law' },
  { name: 'Numbers', chapters: 36, testament: 'OT', osis: 'Num' , genre: 'law' },
  { name: 'Deuteronomy', chapters: 34, testament: 'OT', osis: 'Deut' , genre: 'law' },
  { name: 'Joshua', chapters: 24, testament: 'OT', osis: 'Josh' , genre: 'narrative' },
  { name: 'Judges', chapters: 21, testament: 'OT', osis: 'Judg' , genre: 'narrative' },
  { name: 'Ruth', chapters: 4, testament: 'OT', osis: 'Ruth' , genre: 'narrative' },
  { name: '1 Samuel', chapters: 31, testament: 'OT', osis: '1Sam' , genre: 'narrative' },
  { name: '2 Samuel', chapters: 24, testament: 'OT', osis: '2Sam' , genre: 'narrative' },
  { name: '1 Kings', chapters: 22, testament: 'OT', osis: '1Kgs' , genre: 'narrative' },
  { name: '2 Kings', chapters: 25, testament: 'OT', osis: '2Kgs' , genre: 'narrative' },
  { name: '1 Chronicles', chapters: 29, testament: 'OT', osis: '1Chr' , genre: 'narrative' },
  { name: '2 Chronicles', chapters: 36, testament: 'OT', osis: '2Chr' , genre: 'narrative' },
  { name: 'Ezra', chapters: 10, testament: 'OT', osis: 'Ezra' , genre: 'narrative' },
  { name: 'Nehemiah', chapters: 13, testament: 'OT', osis: 'Neh' , genre: 'narrative' },
  { name: 'Esther', chapters: 10, testament: 'OT', osis: 'Esth' , genre: 'narrative' },
  { name: 'Job', chapters: 42, testament: 'OT', osis: 'Job' , genre: 'poetry' },
  { name: 'Psalms', chapters: 150, testament: 'OT', osis: 'Ps' , genre: 'poetry' },
  { name: 'Proverbs', chapters: 31, testament: 'OT', osis: 'Prov' , genre: 'poetry' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'OT', osis: 'Eccl' , genre: 'poetry' },
  { name: 'Song of Solomon', chapters: 8, testament: 'OT', osis: 'Song' , genre: 'poetry' },
  { name: 'Isaiah', chapters: 66, testament: 'OT', osis: 'Isa' , genre: 'prophecy' },
  { name: 'Jeremiah', chapters: 52, testament: 'OT', osis: 'Jer' , genre: 'prophecy' },
  { name: 'Lamentations', chapters: 5, testament: 'OT', osis: 'Lam' , genre: 'poetry' },
  { name: 'Ezekiel', chapters: 48, testament: 'OT', osis: 'Ezek' , genre: 'prophecy' },
  { name: 'Daniel', chapters: 12, testament: 'OT', osis: 'Dan' , genre: 'prophecy' },
  { name: 'Hosea', chapters: 14, testament: 'OT', osis: 'Hos' , genre: 'prophecy' },
  { name: 'Joel', chapters: 3, testament: 'OT', osis: 'Joel' , genre: 'prophecy' },
  { name: 'Amos', chapters: 9, testament: 'OT', osis: 'Amos' , genre: 'prophecy' },
  { name: 'Obadiah', chapters: 1, testament: 'OT', osis: 'Obad' , genre: 'prophecy' },
  { name: 'Jonah', chapters: 4, testament: 'OT', osis: 'Jonah' , genre: 'narrative' },
  { name: 'Micah', chapters: 7, testament: 'OT', osis: 'Mic' , genre: 'prophecy' },
  { name: 'Nahum', chapters: 3, testament: 'OT', osis: 'Nah' , genre: 'prophecy' },
  { name: 'Habakkuk', chapters: 3, testament: 'OT', osis: 'Hab' , genre: 'prophecy' },
  { name: 'Zephaniah', chapters: 3, testament: 'OT', osis: 'Zeph' , genre: 'prophecy' },
  { name: 'Haggai', chapters: 2, testament: 'OT', osis: 'Hag' , genre: 'prophecy' },
  { name: 'Zechariah', chapters: 14, testament: 'OT', osis: 'Zech' , genre: 'prophecy' },
  { name: 'Malachi', chapters: 4, testament: 'OT', osis: 'Mal' , genre: 'prophecy' },
  { name: 'Matthew', chapters: 28, testament: 'NT', osis: 'Matt' , genre: 'gospel' },
  { name: 'Mark', chapters: 16, testament: 'NT', osis: 'Mark' , genre: 'gospel' },
  { name: 'Luke', chapters: 24, testament: 'NT', osis: 'Luke' , genre: 'gospel' },
  { name: 'John', chapters: 21, testament: 'NT', osis: 'John' , genre: 'gospel' },
  { name: 'Acts', chapters: 28, testament: 'NT', osis: 'Acts' , genre: 'narrative' },
  { name: 'Romans', chapters: 16, testament: 'NT', osis: 'Rom' , genre: 'letter' },
  { name: '1 Corinthians', chapters: 16, testament: 'NT', osis: '1Cor' , genre: 'letter' },
  { name: '2 Corinthians', chapters: 13, testament: 'NT', osis: '2Cor' , genre: 'letter' },
  { name: 'Galatians', chapters: 6, testament: 'NT', osis: 'Gal' , genre: 'letter' },
  { name: 'Ephesians', chapters: 6, testament: 'NT', osis: 'Eph' , genre: 'letter' },
  { name: 'Philippians', chapters: 4, testament: 'NT', osis: 'Phil' , genre: 'letter' },
  { name: 'Colossians', chapters: 4, testament: 'NT', osis: 'Col' , genre: 'letter' },
  { name: '1 Thessalonians', chapters: 5, testament: 'NT', osis: '1Thess' , genre: 'letter' },
  { name: '2 Thessalonians', chapters: 3, testament: 'NT', osis: '2Thess' , genre: 'letter' },
  { name: '1 Timothy', chapters: 6, testament: 'NT', osis: '1Tim' , genre: 'letter' },
  { name: '2 Timothy', chapters: 4, testament: 'NT', osis: '2Tim' , genre: 'letter' },
  { name: 'Titus', chapters: 3, testament: 'NT', osis: 'Titus' , genre: 'letter' },
  { name: 'Philemon', chapters: 1, testament: 'NT', osis: 'Phlm' , genre: 'letter' },
  { name: 'Hebrews', chapters: 13, testament: 'NT', osis: 'Heb' , genre: 'letter' },
  { name: 'James', chapters: 5, testament: 'NT', osis: 'Jas' , genre: 'letter' },
  { name: '1 Peter', chapters: 5, testament: 'NT', osis: '1Pet' , genre: 'letter' },
  { name: '2 Peter', chapters: 3, testament: 'NT', osis: '2Pet' , genre: 'letter' },
  { name: '1 John', chapters: 5, testament: 'NT', osis: '1John' , genre: 'letter' },
  { name: '2 John', chapters: 1, testament: 'NT', osis: '2John' , genre: 'letter' },
  { name: '3 John', chapters: 1, testament: 'NT', osis: '3John' , genre: 'letter' },
  { name: 'Jude', chapters: 1, testament: 'NT', osis: 'Jude' , genre: 'letter' },
  { name: 'Revelation', chapters: 22, testament: 'NT', osis: 'Rev' , genre: 'apocalyptic' },
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
