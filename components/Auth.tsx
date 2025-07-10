import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const Auth: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useUser();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }
    setIsLoading(true);

    if (isLoginMode) {
      await login(email, password);
    } else {
      const success = await register(email, password);
      if(success) {
        // Switch to login mode after successful registration
        setIsLoginMode(true);
        setPassword('');
      }
    }
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">Connected-Blog</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
            </p>
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
            
            <div>
              <button
                type="submit"
                disabled={!email.trim() || !password.trim() || isLoading}
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
            Your account will be created with Supabase authentication.
        </p>
      </div>
    </div>
  );
};

export default Auth;