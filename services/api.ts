import { User, Post, Comment } from '../types';
import { supabase } from './supabase';

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

const getCachedRequest = <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }
  
  const promise = fetcher().finally(() => {
    requestCache.delete(key);
  });
  
  requestCache.set(key, promise);
  return promise;
};

// --- User API ---

export const createUser = async (username: string, email: string, authId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return { success: false, message: 'Username is already taken.' };
    }

    // Create user in database
    const { error } = await supabase
      .from('users')
      .insert({
        id: authId, // Use Supabase auth user ID
        username,
        email,
        bio: ''
      });

    if (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Failed to create user.' };
    }

    return { success: true, message: 'User registered successfully.' };
  } catch (error) {
    console.error('Error in createUser:', error);
    return { success: false, message: 'An error occurred during registration.' };
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      is_private: user.is_private
    };
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      is_private: user.is_private
    };
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    return null;
  }
};

export const updateUser = async (
  username: string,
  data: Partial<User> & { currentPassword?: string, newPassword?: string }
): Promise<{ success: boolean; message?: string; user?: User }> => {
  try {
    // Get current user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Update user data
    const updateData: any = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.is_private !== undefined) updateData.is_private = data.is_private;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('username', username);

    if (error) {
      console.error('Error updating user:', error);
      return { success: false, message: 'Failed to update user.' };
    }

    // Return updated user
    const updatedUser = await getUserByUsername(username);
    return { success: true, user: updatedUser || undefined };
  } catch (error) {
    console.error('Error in updateUser:', error);
    return { success: false, message: 'An error occurred while updating user.' };
  }
};

// --- Post API ---

export const fetchAllPosts = async (): Promise<Post[]> => {
  return getCachedRequest('fetchAllPosts', async () => {
    try {
      console.log("[v0] Fetching all public posts from Supabase...");
      // Fetch all public posts ordered by newest first
      let { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(username, is_private),
          comments(
            *,
            author:users!comments_author_id_fkey(username)
          ),
          votes(vote_type, user:users!votes_user_id_fkey(username))
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log("[v0] Supabase response - error:", error, "posts count:", posts?.length);
      
      if (error) {
        console.error('[v0] Supabase error - code:', error.code, 'message:', error.message, 'details:', error.details);
        // Even if there's an error, try to return empty array instead of blocking
        return [];
      }

      if (!posts) {
        console.log("[v0] No posts returned from query");
        return [];
      }

      console.log("[v0] Raw posts from DB:", posts.length);
      // Filter out posts from private users
      const filtered = posts
        .filter(post => post.author && !post.author.is_private)
        .map(transformPostFromDB);
      console.log("[v0] Filtered posts:", filtered.length);
      return filtered;
    } catch (error) {
      console.error('[v0] Error in fetchAllPosts:', error);
      return [];
    }
  });
};

export const fetchPublicPostsPaginated = async (page: number = 1, limit: number = 10, sortBy: 'newest' | 'trending' | 'most-liked' | 'most-commented' = 'newest'): Promise<{ posts: Post[], total: number }> => {
  try {
    const offset = (page - 1) * limit;
    
    console.log(`[v0] Fetching paginated public posts - page: ${page}, limit: ${limit}, sort: ${sortBy}`);
    
    // Build base query - fetch all posts with author relationships
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(username, is_private),
        comments(
          *,
          author:users!comments_author_id_fkey(username)
        ),
        votes(vote_type, user:users!votes_user_id_fkey(username))
      `, { count: 'exact' });
    
    // Apply sort
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'trending') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'most-liked' || sortBy === 'most-commented') {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    const { data: allPosts, error, count } = await query.range(offset, offset + (limit * 2 - 1));
    
    if (error) {
      console.error('[v0] Error fetching paginated posts:', error);
      return { posts: [], total: 0 };
    }
    
    if (!allPosts || allPosts.length === 0) {
      return { posts: [], total: 0 };
    }
    
    // Filter by non-private users only
    const filtered = allPosts
      .filter(post => post.author && !post.author.is_private)
      .slice(0, limit)
      .map(transformPostFromDB);
    
    return { 
      posts: filtered, 
      total: count || 0 
    };
  } catch (error) {
    console.error('[v0] Error in fetchPublicPostsPaginated:', error);
    return { posts: [], total: 0 };
  }
};

export const fetchUserPosts = async (username: string): Promise<Post[]> => {
  return getCachedRequest(`fetchUserPosts_${username}`, async () => {
    try {
      // Get user ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (!user) {
        return [];
      }

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(username),
          comments(
            *,
            author:users!comments_author_id_fkey(username)
          ),
          votes(vote_type, user:users!votes_user_id_fkey(username))
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user posts:', error);
        return [];
      }

      return posts.map(transformPostFromDB);
    } catch (error) {
      console.error('Error in fetchUserPosts:', error);
      return [];
    }
  });
};

export const fetchUserPinnedPosts = async (username: string): Promise<Post[]> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return [];
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(username),
        comments(
          *,
          author:users!comments_author_id_fkey(username)
        ),
        votes(vote_type, user:users!votes_user_id_fkey(username))
      `)
      .eq('author_id', user.id)
      .eq('pinned', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user pinned posts:', error);
      return [];
    }

    return posts.map(transformPostFromDB);
  } catch (error) {
    console.error('Error in fetchUserPinnedPosts:', error);
    return [];
  }
};

export const fetchUserUnpinnedPostsPaginated = async (username: string, page: number, limit: number): Promise<{ posts: Post[], total: number }> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return { posts: [], total: 0 };
    }

    const offset = (page - 1) * limit;

    const { data: posts, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(username),
        comments(
          *,
          author:users!comments_author_id_fkey(username)
        ),
        votes(vote_type, user:users!votes_user_id_fkey(username))
      `, { count: 'exact' })
      .eq('author_id', user.id)
      .eq('pinned', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user unpinned posts:', error);
      return { posts: [], total: 0 };
    }

    return { posts: posts.map(transformPostFromDB), total: count || 0 };
  } catch (error) {
    console.error('Error in fetchUserUnpinnedPostsPaginated:', error);
    return { posts: [], total: 0 };
  }
};

export const fetchUserTotalPostsCount = async (username: string): Promise<number> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id);

    if (error) {
      console.error('Error fetching user total posts count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in fetchUserTotalPostsCount:', error);
    return 0;
  }
};

export const fetchPostById = async (postId: string, currentUsername?: string): Promise<Post | null> => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(username, is_private),
        comments(
          *,
          author:users!comments_author_id_fkey(username)
        ),
        votes(vote_type, user:users!votes_user_id_fkey(username))
      `)
      .eq('id', postId)
      .maybeSingle();

    if (error || !post) {
      console.error('Error fetching post:', error);
      return null;
    }

    // Check if author is private and current user is not the author
    if (post.author.is_private && post.author.username !== currentUsername) {
      return null;
    }

    return transformPostFromDB(post);
  } catch (error) {
    console.error('Error in fetchPostById:', error);
    return null;
  }
};

export const createPost = async (title: string, content: string, username: string): Promise<Post | null> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      throw new Error('User not found');
    }

    // Create post
    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        author_id: user.id
      })
      .select(`
        *,
        author:users!posts_author_id_fkey(username),
        comments(
          *,
          author:users!comments_author_id_fkey(username)
        ),
        votes(vote_type, user:users!votes_user_id_fkey(username))
      `)
      .maybeSingle();

    if (error) {
      console.error('Error creating post:', error);
      return null;
    }

    return transformPostFromDB(newPost);
  } catch (error) {
    console.error('Error in createPost:', error);
    return null;
  }
};

export const updatePost = async (postId: string, title: string, content: string, username: string): Promise<Post | null> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      throw new Error('User not found');
    }

    // Update post
    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({
        title,
        content
      })
      .eq('id', postId)
      .eq('author_id', user.id)
      .select(`
        *,
        author:users!posts_author_id_fkey(username),
        comments(
          *,
          author:users!comments_author_id_fkey(username)
        ),
        votes(vote_type, user:users!votes_user_id_fkey(username))
      `)
      .maybeSingle();

    if (error) {
      console.error('Error updating post:', error);
      return null;
    }

    return transformPostFromDB(updatedPost);
  } catch (error) {
    console.error('Error in updatePost:', error);
    return null;
  }
};

export const deletePost = async (postId: string, username: string): Promise<{ success: boolean }> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', user.id);

    if (error) {
      console.error('Error deleting post:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deletePost:', error);
    return { success: false };
  }
};

// --- Comment API ---

export const addComment = async (postId: string, content: string, username: string): Promise<Comment | null> => {
  try {
  // Get user ID
  const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('username', username)
  .maybeSingle();
  
  if (!user) {
  throw new Error('User not found');
  }

  // Get post author
  const { data: post } = await supabase
  .from('posts')
  .select('author_id')
  .eq('id', postId)
  .maybeSingle();

  if (!post) {
  throw new Error('Post not found');
  }
  
  // Add comment
  const { data: newComment, error } = await supabase
  .from('comments')
  .insert({
  post_id: postId,
  author_id: user.id,
  content
  })
  .select(`
  *,
  author:users!comments_author_id_fkey(username)
  `)
  .maybeSingle();
  
  if (error) {
  console.error('Error adding comment:', error);
  return null;
  }

  // Create notification for the post author
  if (user.id !== post.author_id && username !== '') {
    await createNotification(post.author_id, username, 'comment', postId, newComment.id);
  }
  
  return {
  id: newComment.id,
  author: newComment.author.username,
  content: newComment.content,
  createdAt: newComment.created_at,
  updatedAt: newComment.updated_at
  };
  } catch (error) {
  console.error('Error in addComment:', error);
    return null;
  }
};

export const updateComment = async (commentId: string, content: string, username: string): Promise<Comment | null> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      throw new Error('User not found');
    }

    // Update comment
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({
        content
      })
      .eq('id', commentId)
      .eq('author_id', user.id)
      .select(`
        *,
        author:users!comments_author_id_fkey(username)
      `)
      .maybeSingle();

    if (error) {
      console.error('Error updating comment:', error);
      return null;
    }

    return {
      id: updatedComment.id,
      author: updatedComment.author.username,
      content: updatedComment.content,
      createdAt: updatedComment.created_at,
      updatedAt: updatedComment.updated_at
    };
  } catch (error) {
    console.error('Error in updateComment:', error);
    return null;
  }
};

export const removeComment = async (commentId: string, username: string): Promise<{ success: boolean }> => {
  try {
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', user.id);

    if (error) {
      console.error('Error deleting comment:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in removeComment:', error);
    return { success: false };
  }
};

export const manageVote = async (postId: string, username: string, voteType: 'upvote' | 'downvote'): Promise<Post | null> => {
  try {
  // Get user ID
  const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('username', username)
  .maybeSingle();
  
  if (!user) {
  throw new Error('User not found');
  }
  
  // Get post author
  const { data: post } = await supabase
  .from('posts')
  .select('author_id')
  .eq('id', postId)
  .maybeSingle();

  if (!post) {
  throw new Error('Post not found');
  }
  
  // Check if user already voted
  const { data: existingVote } = await supabase
  .from('votes')
  .select('*')
  .eq('post_id', postId)
  .eq('user_id', user.id)
  .maybeSingle();
  
  if (existingVote) {
  if (existingVote.vote_type === voteType) {
  // Remove vote if same type
  await supabase
  .from('votes')
  .delete()
  .eq('id', existingVote.id);
  } else {
  // Update vote type
  await supabase
  .from('votes')
  .update({ vote_type: voteType })
  .eq('id', existingVote.id);

  // Only create notification when changing vote type
  if (user.id !== post.author_id && username !== '') {
    await createNotification(post.author_id, username, voteType, postId);
  }
  }
  } else {
  // Create new vote
  await supabase
  .from('votes')
  .insert({
  post_id: postId,
  user_id: user.id,
  vote_type: voteType
  });

  // Create notification for the post author
  if (user.id !== post.author_id && username !== '') {
    await createNotification(post.author_id, username, voteType, postId);
  }
  }
  
  // Return updated post
  return await fetchPostById(postId, username);
  } catch (error) {
  console.error('Error in manageVote:', error);
  return null;
  }
};

export const togglePinPost = async (postId: string, username: string): Promise<Post | null> => {
  try {
  // Get current post to check if it's pinned
  const { data: currentPost } = await supabase
  .from('posts')
  .select('pinned, author_id')
  .eq('id', postId)
  .maybeSingle();
  
  if (!currentPost) {
  throw new Error('Post not found');
  }
  
  // Verify the user is the author
  const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('username', username)
  .maybeSingle();
  
  if (!user || currentPost.author_id !== user.id) {
  throw new Error('Unauthorized');
  }
  
  const newPinnedState = !currentPost.pinned;
  
  // If pinning, unpin all other posts from this user
  if (newPinnedState) {
    const { error: unpinError } = await supabase
      .from('posts')
      .update({ pinned: false })
      .eq('author_id', user.id)
      .neq('id', postId);
    
    if (unpinError) {
      throw new Error('Failed to unpin other posts');
    }
  }
  
  const { data: updatedPost, error } = await supabase
  .from('posts')
  .update({ pinned: newPinnedState })
  .eq('id', postId)
  .select(`
    *,
    author:users!posts_author_id_fkey(username),
    comments(
      *,
      author:users!comments_author_id_fkey(username)
    ),
    votes(vote_type, user:users!votes_user_id_fkey(username))
  `)
  .maybeSingle();
  
  if (error || !updatedPost) {
  throw new Error('Failed to update post');
  }
  
  return transformPostFromDB(updatedPost);
  } catch (error) {
  console.error('Error in togglePinPost:', error);
  return null;
  }
};

// Notification functions
export const createNotification = async (
  recipientId: string,
  actorUsername: string,
  type: 'upvote' | 'downvote' | 'comment',
  postId: string,
  commentId?: string
): Promise<void> => {
  try {
    const { error } = await supabase.from('notifications').insert({
      recipient_id: recipientId,
      actor_username: actorUsername,
      type,
      post_id: postId,
      comment_id: commentId || null,
      read: false,
    });

    if (error) {
      console.error('Error creating notification:', error);
    }
  } catch (error) {
    console.error('Error in createNotification:', error);
  }
};

export const fetchNotifications = async (userId: string): Promise<any[]> => {
  try {
    console.log('[v0] API: Fetching notifications for userId:', userId);
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[v0] API: Error fetching notifications:', error);
      return [];
    }

    console.log('[v0] API: Fetched notifications count:', notifications?.length || 0, 'data:', notifications);
    return notifications || [];
  } catch (error) {
    console.error('[v0] API: Error in fetchNotifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
  }
};

export const deleteUserAccount = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Verify password by attempting to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, message: 'Incorrect password.' };
    }

    // Password verified, proceed with deletion
    // Delete user's votes
    await supabase
      .from('votes')
      .delete()
      .eq('user_id', user.id);

    // Delete user's comments
    await supabase
      .from('comments')
      .delete()
      .eq('author_id', user.id);

    // Delete user's posts
    await supabase
      .from('posts')
      .delete()
      .eq('author_id', user.id);

    // Delete user from users table
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteUserError) {
      console.error('Error deleting user from users table:', deleteUserError);
      return { success: false, message: 'Failed to delete user account.' };
    }

    // Delete user from Supabase Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError);
      // Note: User data is already deleted, but auth deletion failed
      // This is not ideal but the account is effectively deleted from the app
    }

    return { success: true, message: 'Account deleted successfully.' };
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    return { success: false, message: 'An error occurred while deleting the account.' };
  }
};

// --- Utility Functions ---

// Transform database post to application format
const transformPostFromDB = (dbPost: any): Post => {
  const upvotes = dbPost.votes?.filter((v: any) => v.vote_type === 'upvote').map((v: any) => v.user.username) || [];
  const downvotes = dbPost.votes?.filter((v: any) => v.vote_type === 'downvote').map((v: any) => v.user.username) || [];
  
  const comments = dbPost.comments?.map((c: any) => ({
    id: c.id,
    author: c.author.username,
    content: c.content,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  })) || [];

  return {
    id: dbPost.id,
    title: dbPost.title,
    content: dbPost.content,
    author: dbPost.author.username,
    createdAt: dbPost.created_at,
    updatedAt: dbPost.updated_at,
    upvotes,
    downvotes,
    comments,
    pinned: dbPost.pinned,
    visibility: dbPost.visibility || 'public'
  };
};
