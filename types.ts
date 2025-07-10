
export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  upvotes: string[]; // Array of usernames who upvoted
  downvotes: string[]; // Array of usernames who downvoted
  comments: Comment[];
}

export interface User {
  username: string;
  passwordHash: string;
  bio?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}