import '../env.js';

import { extractChapter, GENEALOGY_PASSAGES } from '../lib/genealogyExtraction.js';
import { supabase } from '../lib/supabase.js';

async function main() {
  if (!supabase) {
    console.error('Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  for (const { book, chapter } of GENEALOGY_PASSAGES) {
    try {
      const result = await extractChapter(book, chapter);
      if (result.skipped) {
        console.log(`${book} ${chapter}: already extracted, skipped.`);
      } else {
        console.log(`${book} ${chapter}: extracted ${result.relationships} relationship(s).`);
      }
    } catch (err) {
      console.error(`${book} ${chapter}: extraction failed —`, err instanceof Error ? err.message : err);
    }
  }

  console.log('Genealogy seed complete.');
}

main();
