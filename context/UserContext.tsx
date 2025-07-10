
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import * as authService from '../services/authService';
import { useToast } from './ToastContext';
import { User } from '../types';
import { supabase } from '../services/supabase';

const USER_SESSION_KEY = 'gemini-cms-session-user';

interface UserContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
  checkUserSession: () => void;
  updateUserProfile: (data: Partial<User> & { currentPassword?: string, newPassword?: string }) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const checkUserSession = useCallback(async () => {
    try {
      const username = sessionStorage.getItem(USER_SESSION_KEY);
      if(username) {
        const userProfile = await authService.getProfile(username);
        if(userProfile) {
          setCurrentUser(userProfile);
        } else {
          logout();
        }
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const user = await authService.loginUser(username, password);
    if (user) {
      try {
        sessionStorage.setItem(USER_SESSION_KEY, user.username);
        setCurrentUser(user);
        showToast(`Welcome back, ${user.username}!`, 'success');
        return true;
      } catch (error) {
        console.error("Failed to save user session", error);
        showToast('Login failed due to a storage error.', 'error');
        return false;
      }
    } else {
      showToast('Invalid username or password.', 'error');
      return false;
    }
  }, [showToast]);
  
  const register = useCallback(async (username: string, password: string): Promise<boolean> => {
    const result = await authService.registerUser(username, password);
    if (result.success) {
      showToast('Registration successful! Please log in.', 'success');
      return true;
    } else {
      showToast(result.message, 'error');
      return false;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(USER_SESSION_KEY);
      // Sign out from Supabase as well
      supabase.auth.signOut();
      setCurrentUser(null);
      showToast('You have been logged out.', 'info');
    } catch (error) {
      console.error("Failed to remove user session", error);
    }
  }, [showToast]);

  const updateUserProfile = async (data: Partial<User> & { currentPassword?: string, newPassword?: string }): Promise<boolean> => {
    if (!currentUser) return false;
    
    const result = await authService.updateProfile(currentUser.username, data);

    if(result.success && result.user) {
        setCurrentUser(result.user);
        showToast('Profile updated successfully!', 'success');
        return true;
    } else {
        showToast(result.message || 'Failed to update profile.', 'error');
        return false;
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, register, checkUserSession, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};