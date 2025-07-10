import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Post, Comment } from '../types';
import * as postsService from '../services/postsService';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';

interface PostsContextType {
  posts: Post[];
  allPosts: Post[];
  isLoading: boolean;
  getPost: (id: string) => Promise<Post | undefined>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'comments' | 'upvotes' | 'downvotes'>) => Promise<void>;
  updatePost: (id:string, post: Partial<Omit<Post, 'id' | 'createdAt' | 'author'>>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  updateComment: (postId: string, commentId: string, content: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  vote: (postId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  refreshPosts: () => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    if (currentUser) {
      const [userPosts, allPostsData] = await Promise.all([
        postsService.getUserPosts(currentUser.username),
        postsService.getAllPosts()
      ]);
      setPosts(userPosts);
      setAllPosts(allPostsData);
    } else {
       const allPostsData = await postsService.getAllPosts();
       setAllPosts(allPostsData);
       setPosts([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  const refreshPosts = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getPost = async (id: string): Promise<Post | undefined> => {
    return postsService.getPostById(id);
  }
  
  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'comments' | 'upvotes' | 'downvotes'>) => {
    if (!currentUser) return;
    await postsService.createPost({ ...postData, author: currentUser.username });
    await fetchPosts();
  };

  const updatePost = async (id: string, postUpdate: Partial<Omit<Post, 'id' | 'createdAt' | 'author'>>) => {
    await postsService.updatePost(id, postUpdate);
    await fetchPosts();
  };

  const deletePost = async (id: string) => {
    await postsService.deletePost(id);
    await fetchPosts();
    showToast('Post deleted successfully', 'success');
  };

  const addComment = async (postId: string, content: string) => {
    if(!currentUser) return;
    await postsService.addCommentToPost(postId, { author: currentUser.username, content });
    // PostPreview will refetch its own data
  };

  const updateComment = async (postId: string, commentId: string, content: string) => {
    if(!currentUser) return;
    await postsService.updateCommentOnPost(postId, commentId, content);
     // PostPreview will refetch its own data
  }

  const deleteComment = async (postId: string, commentId: string) => {
    if(!currentUser) return;
    await postsService.deleteCommentOnPost(postId, commentId);
     // PostPreview will refetch its own data
  }
  
  const vote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!currentUser) return;

    const postToUpdate = allPosts.find(p => p.id === postId) || posts.find(p => p.id === postId);
    if(postToUpdate?.author === currentUser.username) {
        showToast("You cannot vote on your own post.", "warning");
        return;
    }
    
    await postsService.voteOnPost(postId, currentUser.username, voteType);
    
    // Optimistically update UI
    const update = (post: Post) => {
        const wasUpvoted = post.upvotes.includes(currentUser.username);
        const wasDownvoted = post.downvotes.includes(currentUser.username);
        
        const newUpvotes = new Set(post.upvotes);
        const newDownvotes = new Set(post.downvotes);

        if (voteType === 'upvote') {
            if (wasUpvoted) {
                newUpvotes.delete(currentUser.username);
            } else {
                newUpvotes.add(currentUser.username);
                newDownvotes.delete(currentUser.username);
            }
        } else { // downvote
            if (wasDownvoted) {
                newDownvotes.delete(currentUser.username);
            } else {
                newDownvotes.add(currentUser.username);
                newUpvotes.delete(currentUser.username);
            }
        }

        return {
            ...post,
            upvotes: Array.from(newUpvotes),
            downvotes: Array.from(newDownvotes)
        };
    };

    setPosts(current => current.map(p => p.id === postId ? update(p) : p));
    setAllPosts(current => current.map(p => p.id === postId ? update(p) : p));
  };


  return (
    <PostsContext.Provider value={{ posts, allPosts, isLoading, getPost, addPost, updatePost, deletePost, addComment, updateComment, deleteComment, vote, refreshPosts }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePostsContext = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
};