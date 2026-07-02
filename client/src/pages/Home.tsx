import { useQuery } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { auth } from '../lib/firebase';

interface MeResponse {
  uid: string;
  email: string | null;
  name: string | null;
  profile: { display_name: string | null; preferred_version: string } | null;
}

export default function Home() {
  const { user } = useAuth();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get<MeResponse>('/me')).data,
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="flex items-center justify-between border-b border-parchment-300 pb-4">
        <h1 className="font-display text-3xl">Scribe</h1>
        <button
          onClick={() => auth && signOut(auth)}
          className="rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm text-ink-soft transition hover:bg-parchment-100"
        >
          Sign out
        </button>
      </header>

      <section className="mt-8 rounded-xl border border-parchment-300 bg-parchment-50 p-6">
        <h2 className="font-display text-xl">Welcome{user?.email ? `, ${user.email}` : ''}</h2>
        <p className="mt-2 text-sm text-ink-faint">
          Phase 1 skeleton — the reader, map, graph, and study tools arrive in the next phases.
        </p>

        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
            /api/me (token-verified)
          </h3>
          {me.isLoading && <p className="mt-2 text-sm text-ink-faint">Loading…</p>}
          {me.isError && (
            <p className="mt-2 text-sm text-red-700">
              {me.error instanceof Error ? me.error.message : 'Request failed'}
            </p>
          )}
          {me.data && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-parchment-200 p-4 text-xs">
              {JSON.stringify(me.data, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
