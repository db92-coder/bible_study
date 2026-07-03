import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import { isFirebaseConfigured } from './lib/firebase';
import Login from './pages/Login';
import Read from './pages/Read';

function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-lg rounded-xl border border-parchment-300 bg-parchment-50 p-8 shadow-sm">
        <h1 className="font-display text-3xl">Scribe</h1>
        <p className="mt-4 text-ink-soft">
          Firebase isn&apos;t configured yet. Copy <code className="rounded bg-parchment-200 px-1">.env.example</code>{' '}
          to <code className="rounded bg-parchment-200 px-1">.env</code> at the repo root, fill in the{' '}
          <code className="rounded bg-parchment-200 px-1">VITE_FIREBASE_*</code> values from your Firebase web app,
          and restart the dev server.
        </p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-display text-2xl text-ink-faint">Scribe</p>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  if (!isFirebaseConfigured) return <SetupNotice />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Read />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
