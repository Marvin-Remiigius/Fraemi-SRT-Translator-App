import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/auth-context';

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const initial = currentUser?.username?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-3 sm:p-4">
      <nav
        className="surface-lit mx-auto flex w-full max-w-6xl items-center justify-between gap-4
                   rounded-2xl border border-white/10 bg-surface/70 px-4 py-2.5 backdrop-blur-xl
                   shadow-lg shadow-black/50 sm:rounded-full sm:px-6"
      >
        <Link
          to={currentUser ? '/dashboard' : '/'}
          className="flex shrink-0 items-center gap-2.5"
        >
          {/* The logo is a white mark on transparency — no ring or rounding,
              those would draw a circle around an invisible square. */}
          <img className="h-8 w-8 object-contain" src="/Logo.png" alt="" />
          <span className="text-[0.95rem] font-bold tracking-tight text-white sm:text-base">
            FRAEMI<span className="text-brand"> VISION</span>
          </span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/about"
            className="text-xs font-medium tracking-wide text-muted transition-colors hover:text-white"
          >
            ABOUT US
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-3 border-l border-line pl-4">
              <span
                className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-black"
                aria-hidden="true"
              >
                {initial}
              </span>
              <span className="max-w-[10rem] truncate text-sm text-neutral-200">
                {currentUser.username}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold
                           text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-line pl-4">
              <Link
                to="/signin"
                className="rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
              >
                SIGN IN
              </Link>
              <Link
                to="/signup"
                className="glow-brand rounded-full bg-brand px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-brand-soft"
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-neutral-200 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="animate-scale-in mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-line bg-surface/95 p-4 shadow-xl backdrop-blur-xl md:hidden">
          <Link
            to="/about"
            className="block rounded-lg px-3 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-white/5 hover:text-white"
          >
            About us
          </Link>

          {currentUser ? (
            <>
              <div className="mt-2 flex items-center gap-3 border-t border-line px-3 pt-4">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-black"
                  aria-hidden="true"
                >
                  {initial}
                </span>
                <span className="truncate text-sm text-neutral-200">{currentUser.username}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm
                           text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <div className="mt-2 grid gap-2 border-t border-line pt-4">
              <Link
                to="/signin"
                className="rounded-lg border border-line px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="glow-brand rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-black transition-all hover:bg-brand-soft"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AppHeader;
