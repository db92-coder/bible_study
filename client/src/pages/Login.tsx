import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth, googleProvider } from '../lib/firebase';

export default function Login() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/home" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await sendEmailVerification(cred.user);
        } catch {
          /* account still created; user can resend from Settings */
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    if (!auth) return;
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Enter your email above first, then tap "Forgot password?" again.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(`Password reset email sent to ${email.trim()} — check your inbox.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
    }
  }

  async function handleGoogle() {
    if (!auth) return;
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-parchment-300 bg-parchment-50 p-8 shadow-sm">
        <h1 className="font-display text-4xl">Scribe</h1>
        <p className="mt-1 text-sm text-ink-faint">Study the Word, deeply.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-parchment-300 bg-white px-3 py-2 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {notice && <p className="text-sm text-teal dark:text-gold-soft">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-teal px-4 py-2 font-medium text-white transition hover:bg-teal-deep disabled:opacity-50"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={handleGoogle}
          className="mt-3 w-full rounded-lg border border-parchment-300 bg-white px-4 py-2 font-medium text-ink-soft transition hover:bg-parchment-100"
        >
          Continue with Google
        </button>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-6 w-full text-sm text-teal hover:underline"
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>

        {mode === 'signin' && (
          <button
            onClick={handleForgotPassword}
            className="mt-2 w-full text-xs text-ink-faint hover:underline"
          >
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
