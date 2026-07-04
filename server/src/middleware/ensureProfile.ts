import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

// Rows in notes/plans/etc. reference profiles(firebase_uid), so the profile
// must exist before any user-owned write. Memoized per process; the upsert is
// idempotent so cold serverless instances re-checking is harmless.
const knownUids = new Set<string>();

export async function ensureProfile(req: Request, _res: Response, next: NextFunction) {
  try {
    const uid = req.user?.uid;
    if (!uid || !supabase || knownUids.has(uid)) {
      next();
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { firebase_uid: uid, display_name: req.user?.name ?? req.user?.email ?? 'Reader' },
        { onConflict: 'firebase_uid', ignoreDuplicates: true },
      );
    if (error) {
      console.warn('[scribe] ensureProfile failed:', error.message);
    } else {
      knownUids.add(uid);
    }
    next();
  } catch (err) {
    next(err);
  }
}
