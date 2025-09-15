import * as api from './api';
import { Post, Comment } from '../types';

export const getAllPosts = (): Promise<Post[]> => {
    return api.fetchAllPosts();
};

export const getUserPosts = (username: string): Promise<Post[]> => {
  return api.fetchUserPosts(username);
};

export const getUserPinnedPosts = (username: string): Promise<Post[]> => {
  return api.fetchUserPinnedPosts(username);
};

export const getUserUnpinnedPostsPaginated = (username: string, page: number, limit: number): Promise<{ posts: Post[], total: number }> => {
  return api.fetchUserUnpinnedPostsPaginated(username, page, limit);
};

export const getPostById = (id: string): Promise<Post | null> => {
    return api.fetchPostById(id);
};

export const createPost = (title: string, content: string, username: string): Promise<Post | null> => {
    return api.createPost(title, content, username);
};

export const updatePost = (id: string, title: string, content: string, username: string): Promise<Post | null> => {
    return api.updatePost(id, title, content, username);
};

export const deletePost = (id: string, username: string): Promise<{ success: boolean }> => {
    return api.deletePost(id, username);
};

export const addCommentToPost = (postId: string, content: string, username: string): Promise<Comment | null> => {
    return api.addComment(postId, content, username);
};

export const updateCommentOnPost = (commentId: string, content: string, username: string): Promise<Comment | null> => {
    return api.updateComment(commentId, content, username);
};

export const deleteCommentOnPost = (commentId: string, username: string): Promise<{success: boolean}> => {
    return api.removeComment(commentId, username);
};

export const voteOnPost = (postId: string, username: string, voteType: 'upvote' | 'downvote'): Promise<Post | null> => {
    return api.manageVote(postId, username, voteType);
};

export const togglePinPost = (postId: string, username: string): Promise<Post | null> => {
    return api.togglePinPost(postId, username);
};

export const getUserTotalPostsCount = (username: string): Promise<number> => {
    return api.fetchUserTotalPostsCount(username);
};
