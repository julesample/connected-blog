import * as api from './api';
import { Post, Comment } from '../types';

export const getAllPosts = (): Promise<Post[]> => {
    return api.fetchAllPosts();
};

export const getUserPosts = (username: string): Promise<Post[]> => {
    return api.fetchUserPosts(username);
};

export const getPostById = (id: string): Promise<Post | null> => {
    return api.fetchPostById(id);
};

export const createPost = (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'upvotes' | 'downvotes'>): Promise<Post> => {
    return api.insertPost(postData);
};

export const updatePost = (id: string, postUpdate: Partial<Post>): Promise<Post | null> => {
    return api.modifyPost(id, postUpdate);
};

export const deletePost = (id: string): Promise<{ success: boolean }> => {
    return api.removePost(id);
};

export const addCommentToPost = (postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment | null> => {
    return api.insertComment(postId, commentData);
};

export const updateCommentOnPost = (postId: string, commentId: string, content: string): Promise<Comment | null> => {
    return api.modifyComment(postId, commentId, content);
};

export const deleteCommentOnPost = (postId: string, commentId: string): Promise<{success: boolean}> => {
    return api.removeComment(postId, commentId);
};

export const voteOnPost = (postId: string, username: string, voteType: 'upvote' | 'downvote'): Promise<Post | null> => {
    return api.manageVote(postId, username, voteType);
};