import { Router } from 'express';
import { z } from 'zod';
import { adminAuth } from '../lib/firebaseAdmin.js';
import { supabase } from '../lib/supabase.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const meRouter = Router();

meRouter.get('/me', verifyFirebaseToken, async (req, res, next) => {
  try {
    const { uid, email, name } = req.user!;
    let profile = null;

    if (supabase) {
      // Profile bootstrap is best-effort: a missing table (migration not yet
      // applied) shouldn't break sign-in.
      try {
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
      } catch (err) {
        console.warn(
          '[scribe] profile lookup/insert failed (has the migration been applied?):',
          err instanceof Error ? err.message : err,
        );
      }
    }

    res.json({ uid, email: email ?? null, name: name ?? null, profile });
  } catch (err) {
    next(err);
  }
});

meRouter.put('/me', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!supabase) {
      res.status(503).json({ error: 'Database is not configured' });
      return;
    }
    const body = z
      .object({
        display_name: z.string().min(1).max(80),
        about_md: z.string().max(2000).default(''),
        preferred_version: z.string().max(40).default('WEB'),
      })
      .parse(req.body);

    let result = await supabase
      .from('profiles')
      .upsert({ firebase_uid: req.user!.uid, ...body }, { onConflict: 'firebase_uid' })
      .select()
      .single();

    // Migration 006 (about_md column) not applied yet → retry without it.
    if (result.error && /about_md/.test(result.error.message)) {
      console.warn('[scribe] profiles.about_md missing — run migration 006');
      result = await supabase
        .from('profiles')
        .upsert(
          {
            firebase_uid: req.user!.uid,
            display_name: body.display_name,
            preferred_version: body.preferred_version,
          },
          { onConflict: 'firebase_uid' },
        )
        .select()
        .single();
    }
    if (result.error) throw result.error;
    res.json({ profile: result.data });
  } catch (err) {
    next(err);
  }
});

// Permanently delete the account: the profile row cascades to notes, graph,
// plans, progress, and connections; then the Firebase user is removed.
meRouter.delete('/me', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!adminAuth) {
      res.status(503).json({ error: 'Account service is not configured' });
      return;
    }
    const uid = req.user!.uid;
    if (supabase) {
      const { error } = await supabase.from('profiles').delete().eq('firebase_uid', uid);
      if (error) throw error;
    }
    await adminAuth.deleteUser(uid);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
