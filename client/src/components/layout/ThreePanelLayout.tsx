import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function ThreePanelLayout({ children, context }: { children: ReactNode; context: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile slide-over */}
        {sidebarOpen && (
          <div className="absolute inset-0 z-20 flex md:hidden">
            <div className="w-72 border-r border-parchment-300 bg-parchment-50 shadow-lg dark:border-parchment-700 dark:bg-parchment-800">
              <Sidebar />
            </div>
            <div className="flex-1 bg-ink/30" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        <aside className="hidden w-64 shrink-0 border-r border-parchment-300 bg-parchment-50 md:block dark:border-parchment-700 dark:bg-parchment-800">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>

        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-parchment-300 bg-parchment-50 xl:block dark:border-parchment-700 dark:bg-parchment-800">
          {context}
        </aside>
      </div>
    </div>
  );
}
