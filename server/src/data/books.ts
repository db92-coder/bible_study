export interface BookInfo {
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
  usfm: string; // USFM book code used by API.Bible chapter ids (e.g. JHN.3)
  osis: string; // OSIS book code used in verse references (e.g. John.3.16)
}

export const BOOKS: BookInfo[] = [
  { name: 'Genesis', chapters: 50, testament: 'OT' , usfm: 'GEN', osis: 'Gen' },
  { name: 'Exodus', chapters: 40, testament: 'OT' , usfm: 'EXO', osis: 'Exod' },
  { name: 'Leviticus', chapters: 27, testament: 'OT' , usfm: 'LEV', osis: 'Lev' },
  { name: 'Numbers', chapters: 36, testament: 'OT' , usfm: 'NUM', osis: 'Num' },
  { name: 'Deuteronomy', chapters: 34, testament: 'OT' , usfm: 'DEU', osis: 'Deut' },
  { name: 'Joshua', chapters: 24, testament: 'OT' , usfm: 'JOS', osis: 'Josh' },
  { name: 'Judges', chapters: 21, testament: 'OT' , usfm: 'JDG', osis: 'Judg' },
  { name: 'Ruth', chapters: 4, testament: 'OT' , usfm: 'RUT', osis: 'Ruth' },
  { name: '1 Samuel', chapters: 31, testament: 'OT' , usfm: '1SA', osis: '1Sam' },
  { name: '2 Samuel', chapters: 24, testament: 'OT' , usfm: '2SA', osis: '2Sam' },
  { name: '1 Kings', chapters: 22, testament: 'OT' , usfm: '1KI', osis: '1Kgs' },
  { name: '2 Kings', chapters: 25, testament: 'OT' , usfm: '2KI', osis: '2Kgs' },
  { name: '1 Chronicles', chapters: 29, testament: 'OT' , usfm: '1CH', osis: '1Chr' },
  { name: '2 Chronicles', chapters: 36, testament: 'OT' , usfm: '2CH', osis: '2Chr' },
  { name: 'Ezra', chapters: 10, testament: 'OT' , usfm: 'EZR', osis: 'Ezra' },
  { name: 'Nehemiah', chapters: 13, testament: 'OT' , usfm: 'NEH', osis: 'Neh' },
  { name: 'Esther', chapters: 10, testament: 'OT' , usfm: 'EST', osis: 'Esth' },
  { name: 'Job', chapters: 42, testament: 'OT' , usfm: 'JOB', osis: 'Job' },
  { name: 'Psalms', chapters: 150, testament: 'OT' , usfm: 'PSA', osis: 'Ps' },
  { name: 'Proverbs', chapters: 31, testament: 'OT' , usfm: 'PRO', osis: 'Prov' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'OT' , usfm: 'ECC', osis: 'Eccl' },
  { name: 'Song of Solomon', chapters: 8, testament: 'OT' , usfm: 'SNG', osis: 'Song' },
  { name: 'Isaiah', chapters: 66, testament: 'OT' , usfm: 'ISA', osis: 'Isa' },
  { name: 'Jeremiah', chapters: 52, testament: 'OT' , usfm: 'JER', osis: 'Jer' },
  { name: 'Lamentations', chapters: 5, testament: 'OT' , usfm: 'LAM', osis: 'Lam' },
  { name: 'Ezekiel', chapters: 48, testament: 'OT' , usfm: 'EZK', osis: 'Ezek' },
  { name: 'Daniel', chapters: 12, testament: 'OT' , usfm: 'DAN', osis: 'Dan' },
  { name: 'Hosea', chapters: 14, testament: 'OT' , usfm: 'HOS', osis: 'Hos' },
  { name: 'Joel', chapters: 3, testament: 'OT' , usfm: 'JOL', osis: 'Joel' },
  { name: 'Amos', chapters: 9, testament: 'OT' , usfm: 'AMO', osis: 'Amos' },
  { name: 'Obadiah', chapters: 1, testament: 'OT' , usfm: 'OBA', osis: 'Obad' },
  { name: 'Jonah', chapters: 4, testament: 'OT' , usfm: 'JON', osis: 'Jonah' },
  { name: 'Micah', chapters: 7, testament: 'OT' , usfm: 'MIC', osis: 'Mic' },
  { name: 'Nahum', chapters: 3, testament: 'OT' , usfm: 'NAM', osis: 'Nah' },
  { name: 'Habakkuk', chapters: 3, testament: 'OT' , usfm: 'HAB', osis: 'Hab' },
  { name: 'Zephaniah', chapters: 3, testament: 'OT' , usfm: 'ZEP', osis: 'Zeph' },
  { name: 'Haggai', chapters: 2, testament: 'OT' , usfm: 'HAG', osis: 'Hag' },
  { name: 'Zechariah', chapters: 14, testament: 'OT' , usfm: 'ZEC', osis: 'Zech' },
  { name: 'Malachi', chapters: 4, testament: 'OT' , usfm: 'MAL', osis: 'Mal' },
  { name: 'Matthew', chapters: 28, testament: 'NT' , usfm: 'MAT', osis: 'Matt' },
  { name: 'Mark', chapters: 16, testament: 'NT' , usfm: 'MRK', osis: 'Mark' },
  { name: 'Luke', chapters: 24, testament: 'NT' , usfm: 'LUK', osis: 'Luke' },
  { name: 'John', chapters: 21, testament: 'NT' , usfm: 'JHN', osis: 'John' },
  { name: 'Acts', chapters: 28, testament: 'NT' , usfm: 'ACT', osis: 'Acts' },
  { name: 'Romans', chapters: 16, testament: 'NT' , usfm: 'ROM', osis: 'Rom' },
  { name: '1 Corinthians', chapters: 16, testament: 'NT' , usfm: '1CO', osis: '1Cor' },
  { name: '2 Corinthians', chapters: 13, testament: 'NT' , usfm: '2CO', osis: '2Cor' },
  { name: 'Galatians', chapters: 6, testament: 'NT' , usfm: 'GAL', osis: 'Gal' },
  { name: 'Ephesians', chapters: 6, testament: 'NT' , usfm: 'EPH', osis: 'Eph' },
  { name: 'Philippians', chapters: 4, testament: 'NT' , usfm: 'PHP', osis: 'Phil' },
  { name: 'Colossians', chapters: 4, testament: 'NT' , usfm: 'COL', osis: 'Col' },
  { name: '1 Thessalonians', chapters: 5, testament: 'NT' , usfm: '1TH', osis: '1Thess' },
  { name: '2 Thessalonians', chapters: 3, testament: 'NT' , usfm: '2TH', osis: '2Thess' },
  { name: '1 Timothy', chapters: 6, testament: 'NT' , usfm: '1TI', osis: '1Tim' },
  { name: '2 Timothy', chapters: 4, testament: 'NT' , usfm: '2TI', osis: '2Tim' },
  { name: 'Titus', chapters: 3, testament: 'NT' , usfm: 'TIT', osis: 'Titus' },
  { name: 'Philemon', chapters: 1, testament: 'NT' , usfm: 'PHM', osis: 'Phlm' },
  { name: 'Hebrews', chapters: 13, testament: 'NT' , usfm: 'HEB', osis: 'Heb' },
  { name: 'James', chapters: 5, testament: 'NT' , usfm: 'JAS', osis: 'Jas' },
  { name: '1 Peter', chapters: 5, testament: 'NT' , usfm: '1PE', osis: '1Pet' },
  { name: '2 Peter', chapters: 3, testament: 'NT' , usfm: '2PE', osis: '2Pet' },
  { name: '1 John', chapters: 5, testament: 'NT' , usfm: '1JN', osis: '1John' },
  { name: '2 John', chapters: 1, testament: 'NT' , usfm: '2JN', osis: '2John' },
  { name: '3 John', chapters: 1, testament: 'NT' , usfm: '3JN', osis: '3John' },
  { name: 'Jude', chapters: 1, testament: 'NT' , usfm: 'JUD', osis: 'Jude' },
  { name: 'Revelation', chapters: 22, testament: 'NT' , usfm: 'REV', osis: 'Rev' },
];

const byLowerName = new Map(BOOKS.map((b) => [b.name.toLowerCase(), b]));

export function findBook(name: string): BookInfo | undefined {
  return byLowerName.get(name.toLowerCase());
}
