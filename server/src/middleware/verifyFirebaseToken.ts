import type { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../lib/firebaseAdmin.js';

export interface AuthedUser {
  uid: string;
  email?: string;
  name?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization bearer token' });
    return;
  }
  if (!adminAuth) {
    res.status(503).json({ error: 'Firebase Admin is not configured on the server' });
    return;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(header.slice('Bearer '.length));
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
