import '../env.js';

import { BOOK_CONTEXT } from '../data/bookContext.js';
import { supabase } from '../lib/supabase.js';

async function main() {
  if (!supabase) {
    console.error('Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  const { error } = await supabase.from('book_context').upsert(BOOK_CONTEXT);
  if (error) {
    console.error('Seeding book_context failed:', error.message);
    process.exit(1);
  }
  console.log(`Seeded book_context with ${BOOK_CONTEXT.length} books.`);
}

main();
