import { User } from '../types';
import * as api from './api';

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }
  return api.createUser(username, password);
};

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  return api.authenticateUser(username, password);
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