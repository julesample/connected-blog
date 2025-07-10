import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import About from './About';

const Auth: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useUser();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      if (!email.trim() || !password.trim()) {
        return;
      }
    } else {
      if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }
    }
    
      return;
    }
    setIsLoading(true);

    if (isLoginMode) {
      await login(email, password);
    } else {
      const success = await register(email, username, password);
      if(success) {
        // Switch to login mode after successful registration
        setIsLoginMode(true);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }
    }
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  if (showAbout) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => setShowAbout(false)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              ← Back to Login
            </button>
          </div>
          <About />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">Connected-Blog</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
            </p>
            <button
              onClick={() => setShowAbout(true)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              Learn more about Connected-Blog
            </button>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2.5 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                  placeholder="e.g., jane@example.com"
                />
              </div>
            </div>
            
            {!isLoginMode && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2.5 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                    placeholder="e.g., JaneDoe"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                  className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2.5 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {!isLoginMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2.5 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={
                  isLoading || 
                  !email.trim() || 
                  !password.trim() || 
                  (!isLoginMode && (!username.trim() || !confirmPassword.trim()))
                }
                className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>
        </div>
         <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={toggleMode} className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              {isLoginMode ? 'Register here' : 'Sign in'}
            </button>
        </p>
         <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {isLoginMode ? 'Secure authentication powered by Supabase.' : 'Email verification required for new accounts.'}
        </p>
      </div>
    </div>
  );
};

export default Auth;