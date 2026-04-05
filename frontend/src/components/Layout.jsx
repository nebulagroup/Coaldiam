import { NavLink, Outlet } from 'react-router-dom';
import TickerBar from './TickerBar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Overview' },
  { path: '/signals', label: 'Signals' },
  { path: '/strategies', label: 'Intelligence' },
  { path: '/monetization', label: 'Model' },
  { path: '/about', label: 'About' },
];

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { token, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[var(--color-accent)] selection:text-white pb-20 relative overflow-hidden transition-colors duration-500">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-accent)]/5 blur-[120px] animate-[blob_7s_infinite] mix-blend-screen dark:mix-blend-lighten"></div>
         <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-[var(--color-purple)]/5 blur-[100px] animate-[blob_9s_infinite_reverse] mix-blend-screen dark:mix-blend-lighten" style={{ animationDelay: '2s' }}></div>
         <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-[var(--color-cyan)]/5 blur-[150px] animate-[blob_11s_infinite] mix-blend-screen dark:mix-blend-lighten" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Ticker Bar */}
        <TickerBar />

        {/* Premium Apple-style Glass Navbar */}
        <header className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/70 backdrop-blur-xl border-b border-[var(--color-border)] supports-[backdrop-filter]:bg-[var(--color-bg-primary)]/40 transition-all duration-500 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0 group cursor-pointer hover:opacity-80 transition-opacity">
              <img 
                src="/logo.png" 
                alt="coaldiam logo" 
                className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-transform duration-300" 
              />
              <span className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                coaldiam
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[var(--color-bg-secondary)]/50 p-1 rounded-full border border-[var(--color-border)] backdrop-blur-md shadow-inner">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border-hover)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/50 border border-transparent'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:scale-110 transition-all active:scale-95"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                )}
              </button>

              {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[var(--color-bullish-dim)] bg-[var(--color-bullish-dim)]/30 text-[11px] font-medium text-[var(--color-bullish)] tracking-wide uppercase shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-bullish)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-bullish)]"></span>
                </span>
                Live Systems
              </div>
              
              {/* Logout Button */}
              {token && (
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                >
                  Logout
                </button>
              )}
            </div>

          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1400px] mx-auto px-6 pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
