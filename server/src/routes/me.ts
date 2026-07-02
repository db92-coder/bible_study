import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const meRouter = Router();

meRouter.get('/me', verifyFirebaseToken, async (req, res, next) => {
  try {
    const { uid, email, name } = req.user!;
    let profile = null;

    if (supabase) {
      const existing = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', uid)
        .maybeSingle();
      if (existing.error) throw existing.error;

      if (existing.data) {
        profile = existing.data;
      } else {
        const inserted = await supabase
          .from('profiles')
          .insert({ firebase_uid: uid, display_name: name ?? email ?? 'Reader' })
          .select()
          .single();
        if (inserted.error) throw inserted.error;
        profile = inserted.data;
      }
    }

    res.json({ uid, email: email ?? null, name: name ?? null, profile });
  } catch (err) {
    next(err);
  }
});
