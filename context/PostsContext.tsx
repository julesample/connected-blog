import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { Post } from '../types';
import * as postsService from '../services/postsService';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';

interface PostsContextType {
  posts: Post[];
  allPosts: Post[];
  isLoading: boolean;
  getPost: (id: string) => Promise<Post | null>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'comments' | 'upvotes' | 'downvotes'>) => Promise<void>;
  updatePost: (id:string, post: Partial<Omit<Post, 'id' | 'createdAt' | 'author'>>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  updateComment: (postId: string, content: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheTimeout = 60000; // 60 second cache for optimal performance

  const fetchPosts = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Prevent concurrent requests
    if (isFetchingRef.current) {
      console.log("[DEBUG] fetchPosts: Already fetching, skipping");
      return;
    }

    // Don't fetch if we fetched less than 60 seconds ago and not forced
    if (!forceRefresh && now - lastFetchTimeRef.current < cacheTimeout && (posts.length > 0 || allPosts.length > 0)) {
      console.log("[DEBUG] fetchPosts: Using cached data");
      return;
    }
    
    isFetchingRef.current = true;
    setIsLoading(true);
    console.log("[DEBUG] fetchPosts: Starting fetch");
    
    try {
      if (currentUser && currentUser.username) {
        console.log("[DEBUG] fetchPosts: Fetching for user:", currentUser.username);
        // Fetch user posts and all posts in parallel for faster loading
        const [userPosts, allPostsData] = await Promise.all([
          postsService.getUserPosts(currentUser.username),
          postsService.getAllPosts()
        ]);
        console.log("[DEBUG] fetchPosts: User posts count:", userPosts?.length);
        console.log("[DEBUG] fetchPosts: All posts count:", allPostsData?.length);
        setPosts(userPosts);
        setAllPosts(allPostsData);
      } else {
         console.log("[DEBUG] fetchPosts: Fetching as guest");
         const allPostsData = await postsService.getAllPosts();
         console.log("[DEBUG] fetchPosts: All posts count (guest):", allPostsData?.length);
         setAllPosts(allPostsData);
         setPosts([]);
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('[DEBUG] fetchPosts: Error fetching posts:', error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      console.log("[DEBUG] fetchPosts: Finished");
    }
  }, [currentUser, posts.length, allPosts.length]);

  // Fetch when current user changes
  useEffect(() => {
    if (currentUser) {
      // Force refresh when user logs in
      lastFetchTimeRef.current = 0;
      fetchPosts(true);
    } else {
      // Reset data when user logs out
      setPosts([]);
      setAllPosts([]);
      lastFetchTimeRef.current = 0;
    }
  }, [currentUser?.username, fetchPosts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, []);
  
  const refreshPosts = useCallback(() => {
    fetchPosts(true); // Force refresh
  }, [fetchPosts]);

  const getPost = async (id: string): Promise<Post | null> => {
    return postsService.getPostById(id, currentUser?.username);
  }
  
  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'comments' | 'upvotes' | 'downvotes'>) => {
    if (!currentUser) return;
    await postsService.createPost(postData.title, postData.content, currentUser.username);
    await fetchPosts();
  };

  const updatePost = async (id: string, postUpdate: Partial<Omit<Post, 'id' | 'createdAt' | 'author'>>) => {
    if (!postUpdate.title || !postUpdate.content || !currentUser) return;
    await postsService.updatePost(id, postUpdate.title, postUpdate.content, currentUser.username);
    await fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!currentUser) return;
    await postsService.deletePost(id, currentUser.username);
    await fetchPosts();
    showToast('Post deleted successfully', 'success');
  };

  const addComment = async (postId: string, content: string) => {
    if(!currentUser) return;
    await postsService.addCommentToPost(postId, content, currentUser.username);
    // PostPreview will refetch its own data
  };

  const updateComment = async ( commentId: string, content: string) => {
    if(!currentUser) return;
    await postsService.updateCommentOnPost(commentId, content, currentUser.username);
     // PostPreview will refetch its own data
  }

  const deleteComment = async (commentId: string) => {
    if(!currentUser) return;
    await postsService.deleteCommentOnPost(commentId, currentUser.username);
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
