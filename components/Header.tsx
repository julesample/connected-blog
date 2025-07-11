import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon';
import { useUser } from '../context/UserContext';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2
                 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Icon name="sun" className="h-5 w-5" />
      ) : (
        <Icon name="moon" className="h-5 w-5" />
      )}
    </button>
  );
};

const Header: React.FC = () => {
  const { currentUser, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const base =
    'block px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const active =
    'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300';
  const inactive =
    'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';

  // close menu when route changes (optional QoL)
  useEffect(() => {
    const handleClose = () => setMenuOpen(false);
    window.addEventListener('popstate', handleClose);
    return () => window.removeEventListener('popstate', handleClose);
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Home */}
          <Link
            to="/"
            className="text-2xl font-bold text-primary-600 dark:text-primary-400"
          >
            Connected‑Blog
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden sm:flex items-center space-x-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >
              About
            </NavLink>
          </nav>

          {/* Right‑hand items */}
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="hidden sm:flex items-center space-x-3">
                <NavLink
                  to={`/profile/${currentUser.username}`}
                  className={({ isActive }) =>
                    `text-sm font-bold ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`
                  }
                >
                  {currentUser.username}
                </NavLink>

                <Link
                  to="/settings"
                  title="Settings"
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                             hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2
                             focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
                >
                  <Icon name="cog-6-tooth" className="h-5 w-5" />
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                             hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2
                             focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
                >
                  <Icon name="logout" className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="sm:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Icon name={menuOpen ? 'x-mark' : 'bars-3'} className="h-6 w-6" />
            </button>

            {/* Theme toggle (always visible) */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile slide‑down panel */}
      <div
        className={`sm:hidden transition-[max-height] duration-300 overflow-hidden ${
          menuOpen ? 'max-h-40' : 'max-h-0'
        }`}
      >
        <nav className="px-4 pb-4 space-y-1">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `${base} w-full text-left ${isActive ? active : inactive}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `${base} w-full text-left ${isActive ? active : inactive}`
            }
          >
            About
          </NavLink>

          {currentUser && (
            <>
              <NavLink
                to={`/profile/${currentUser.username}`}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `${base} w-full text-left ${isActive ? active : inactive}`
                }
              >
                Profile
              </NavLink>

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className={`${base} ${inactive} w-full text-left`}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
