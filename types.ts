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
  pinned?: boolean; // Optional pinned property for posts
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  is_private?: boolean;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export type NotificationType = 'upvote' | 'downvote' | 'comment';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_username: string;
  type: NotificationType;
  post_id: string;
  comment_id?: string;
  read: boolean;
  created_at: string;
}
