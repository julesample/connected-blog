import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon';
import { useUser } from '../context/UserContext';

const ThemeToggle: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
            aria-label="Toggle theme"
        >
            {isDarkMode ? <Icon name="sun" className="h-5 w-5" /> : <Icon name="moon" className="h-5 w-5" />}
        </button>
    );
};


const Header: React.FC = () => {
  const { currentUser, logout } = useUser();
  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeNavLinkClasses = "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300";
  const inactiveNavLinkClasses = "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            Connected-Blog
          </Link>

          <nav className="hidden sm:flex items-center space-x-2">
            <NavLink to="/" end className={({isActive}) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>
                Dashboard
            </NavLink>
          
             <NavLink to="/about" className={({isActive}) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>
                About
            </NavLink>
          </nav>
          
          <div className="flex items-center space-x-4">
             {currentUser && (
              <div className="flex items-center space-x-3">
                <NavLink to={`/profile/${currentUser.username}`} className={({isActive}) => `text-sm text-slate-600 dark:text-slate-300 hidden sm:inline font-bold hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {currentUser.username}
                </NavLink>
                <Link 
                  to="/settings"
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
                  title="Settings"
                >
                  <Icon name="cog-6-tooth" className="h-5 w-5" />
                </Link>
                 <button 
                  onClick={logout}
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
                  title="Logout"
                >
                  <Icon name="logout" className="h-5 w-5" />
                </button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;