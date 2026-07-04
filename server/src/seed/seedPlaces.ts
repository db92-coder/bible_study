import '../env.js';

import { supabase } from '../lib/supabase.js';
import { PLACES } from '../routes/places.js';

async function main() {
  if (!supabase) {
    console.error('Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  // Idempotent: replace the whole table (reference data, no user rows).
  const del = await supabase.from('places').delete().neq('name', '');
  if (del.error) {
    console.error('Clearing places failed:', del.error.message);
    process.exit(1);
  }
  const BATCH = 500;
  for (let i = 0; i < PLACES.length; i += BATCH) {
    const { error } = await supabase.from('places').insert(PLACES.slice(i, i + BATCH));
    if (error) {
      console.error(`Insert batch at ${i} failed:`, error.message);
      process.exit(1);
    }
  }
  console.log(`Seeded places with ${PLACES.length} rows.`);
}

main();
