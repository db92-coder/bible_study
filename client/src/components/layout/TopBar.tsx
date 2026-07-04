import { signOut } from 'firebase/auth';
import { NavLink } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { auth } from '../../lib/firebase';
import { VersionSwitcher } from '../reader/VersionSwitcher';

const NAV_ITEMS = [
  { to: '/', label: 'Read' },
  { to: '/map', label: 'Map' },
  { to: '/notes', label: 'Notes' },
  { to: '/plans', label: 'Plans' },
  { to: '/connections', label: 'Connections' },
];

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const dark = useThemeStore((s) => s.dark);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-parchment-300 bg-parchment-50 px-4 dark:border-parchment-700 dark:bg-parchment-800">
      <button
        onClick={onToggleSidebar}
        className="rounded-lg p-1.5 text-ink-soft hover:bg-parchment-200 md:hidden dark:text-ink-invert dark:hover:bg-parchment-700"
        aria-label="Toggle navigation"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
        </svg>
      </button>

      <h1 className="font-display text-2xl tracking-tight">Scribe</h1>

      <nav className="ml-4 flex items-center gap-1">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-parchment-200 text-ink dark:bg-parchment-700 dark:text-ink-invert'
                  : 'text-ink-faint hover:bg-parchment-100 hover:text-ink-soft dark:hover:bg-parchment-700'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <VersionSwitcher />
        <button
          onClick={toggle}
          className="rounded-lg p-1.5 text-ink-soft hover:bg-parchment-200 dark:text-ink-invert dark:hover:bg-parchment-700"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {dark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <button
          onClick={() => auth && signOut(auth)}
          className="rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm text-ink-soft transition hover:bg-parchment-100 dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert dark:hover:bg-parchment-700"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
