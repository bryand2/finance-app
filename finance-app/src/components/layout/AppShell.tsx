import type { TimeWindow } from '../../services/types';

interface AppShellProps {
  activeWindow: TimeWindow;
  onWindowChange: (w: TimeWindow) => void;
  children: React.ReactNode;
}

const WINDOWS: { id: TimeWindow; label: string }[] = [
  { id: 'day', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: 'quarter', label: 'Last Quarter' },
];

export function AppShell({
  activeWindow,
  onWindowChange,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          <span className="app-title-ibm">IBM</span> Market Dashboard
        </h1>
        <nav className="time-tabs" aria-label="Time window">
          {WINDOWS.map(({ id, label }) => (
            <button
              key={id}
              className={`tab-btn${activeWindow === id ? ' tab-btn--active' : ''}`}
              onClick={() => onWindowChange(id)}
              aria-pressed={activeWindow === id}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        Data sourced from Yahoo Finance · for educational use only
      </footer>
    </div>
  );
}
