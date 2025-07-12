import { User, Post, Comment } from '../types';
import { supabase } from './supabase';

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
      username: user.username,
      email: user.email,
      bio: user.bio
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
      username: user.username,
      email: user.email,
      bio: user.bio
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
      return { success: false, message: 'User not found.' };
    }

    let updateData: any = {};

    // Bio change logic
    if (typeof data.bio !== 'undefined') {
      updateData.bio = data.bio;
    }

    // Update user in database
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('username', username)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating user:', error);
      return { success: false, message: 'Failed to update user.' };
    }

    return {
      success: true,
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio
      }
    };
  } catch (error) {
    console.error('Error in updateUser:', error);
    return { success: false, message: 'An error occurred during update.' };
  }
};

export const deleteUserAccount = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get current user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (signInError) {
      return { success: false, message: 'Invalid password.' };
    }

    // Delete user data (posts, comments, votes will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('username', username);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return { success: false, message: 'Failed to delete account.' };
    }

    // Delete from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Continue anyway as the main user data is deleted
    }

    return { success: true, message: 'Account deleted successfully.' };
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    return { success: false, message: 'An error occurred during account deletion.' };
  }
};

// --- Post API ---

export const fetchAllPosts = async (): Promise<Post[]> => {
  try {
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
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return posts.map(transformPostFromDB);
  } catch (error) {
    console.error('Error in fetchAllPosts:', error);
    return [];
  }
};

export const fetchUserPosts = async (username: string): Promise<Post[]> => {
  try {
    // First get the user ID from username
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
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }

    return posts.map(transformPostFromDB);
  } catch (error) {
    console.error('Error in fetchUserPosts:', error);
    return [];
  }
};

export const fetchPostById = async (id: string): Promise<Post | null> => {
  try {
    const { data: post, error } = await supabase
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
      .eq('id', id)
      .maybeSingle();

    if (error || !post) {
      console.error('Error fetching post:', error);
      return null;
    }

    return transformPostFromDB(post);
  } catch (error) {
    console.error('Error in fetchPostById:', error);
    return null;
  }
};

export const insertPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'upvotes' | 'downvotes'>) => {
  try {
    // Get author ID
    const { data: author } = await supabase
      .from('users')
      .select('id')
      .eq('username', postData.author)
      .maybeSingle();

    if (!author) {
      throw new Error('Author not found');
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        content: postData.content,
        author_id: author.id
      })
      .select(`
        *,
        author:users!posts_author_id_fkey(username)
      `)
      .maybeSingle();

    if (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author.username,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      comments: [],
      upvotes: [],
      downvotes: []
    };
  } catch (error) {
    console.error('Error in insertPost:', error);
    throw error;
  }
};

export const modifyPost = async (id: string, postUpdate: Partial<Post>): Promise<Post | null> => {
  try {
    const updateData: any = {};
    if (postUpdate.title) updateData.title = postUpdate.title;
    if (postUpdate.content) updateData.content = postUpdate.content;

    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
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

    if (error || !post) {
      console.error('Error updating post:', error);
      return null;
    }

    return transformPostFromDB(post);
  } catch (error) {
    console.error('Error in modifyPost:', error);
    return null;
  }
};

export const removePost = async (id: string): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in removePost:', error);
    return { success: false };
  }
};

// --- Interactions API ---

export const insertComment = async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment | null> => {
  try {
    // Get author ID
    const { data: author } = await supabase
      .from('users')
      .select('id')
      .eq('username', commentData.author)
      .maybeSingle();

    if (!author) {
      throw new Error('Author not found');
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: author.id,
        content: commentData.content
      })
      .select(`
        *,
        author:users!comments_author_id_fkey(username)
      `)
      .maybeSingle();

    if (error) {
      console.error('Error creating comment:', error);
      return null;
    }

    return {
      id: comment.id,
      author: comment.author.username,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    };
  } catch (error) {
    console.error('Error in insertComment:', error);
    return null;
  }
};

export const modifyComment = async (postId: string, commentId: string, content: string): Promise<Comment | null> => {
  try {
    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .eq('post_id', postId)
      .select(`
        *,
        author:users!comments_author_id_fkey(username)
      `)
      .maybeSingle();

    if (error || !comment) {
      console.error('Error updating comment:', error);
      return null;
    }

    return {
      id: comment.id,
      author: comment.author.username,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    };
  } catch (error) {
    console.error('Error in modifyComment:', error);
    return null;
  }
};

export const removeComment = async (postId: string, commentId: string): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('post_id', postId);

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
    }

    // Return updated post
    return await fetchPostById(postId);
  } catch (error) {
    console.error('Error in manageVote:', error);
    return null;
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
    comments
  };
};