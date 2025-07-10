import { User } from '../types';
import * as api from './api';
import { supabase } from './supabase';

export const registerUser = async (email: string, username: string, password: string): Promise<{ success: boolean; message: string }> => {
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }
  
  try {
    // Check if username already exists
    const existingUser = await api.getUserByUsername(username);
    if (existingUser) {
      return { success: false, message: 'Username is already taken.' };
    }
    
    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    if (data.user) {
      // Create user in our custom table
      const result = await api.createUser(username, email, data.user.id);
      if (result.success) {
        return { success: true, message: 'Registration successful! Please check your email to verify your account before signing in.' };
      }
      return result;
    }
    
    return { success: false, message: 'Failed to create account.' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration.' };
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error || !data.user) {
      return null;
    }
    
    // Get user profile from our custom table
    const user = await api.getUserByEmail(email);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const getProfileByEmail = async (email: string): Promise<User | null> => {
  return api.getUserByEmail(email);
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