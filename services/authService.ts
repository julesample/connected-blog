import { User } from '../types';
import * as api from './api';
import { supabase } from './supabase';

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }
  return api.createUser(username, password);
};

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  const user = await api.authenticateUser(username, password);
  
  if (user) {
    // Sign in with Supabase using a dummy email to get authenticated session
    // This allows RLS policies to work with 'authenticated' role
    try {
      const dummyEmail = `${username}@local.app`;
      const dummyPassword = 'dummy-password-123';
      
      // Try to sign in, if it fails, sign up first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword,
      });
      
      if (signInError) {
        // User doesn't exist in Supabase auth, create them
        const { error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
        });
        
        if (!signUpError) {
          // Now sign in
          await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password: dummyPassword,
          });
        }
      }
    } catch (error) {
      console.error('Error setting up Supabase session:', error);
    }
  }
  
  return user;
};

export const getProfile = async (username: string): Promise<User | null> => {
    return api.getUserByUsername(username);
}

export const updateProfile = async (
  username: string, 
  data: Partial<User> & { currentPassword?: string, newPassword?: string }
): Promise<{ success: boolean; message?: string; user?: User }> => {
    return api.updateUser(username, data);
}