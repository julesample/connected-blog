import { User, Post, Comment } from '../types';

// --- IMPORTANT ---
// This is a MOCK API service that uses localStorage to simulate a real database.
// To connect this application to a real backend (e.g., one using NeonDB),
// you would replace the functions in this file with `fetch` calls to your API
// endpoints. The rest of the application is built to be "backend-ready" and
// would not need to change.

const USERS_STORAGE_KEY = 'connected-blog-users';
const POSTS_STORAGE_KEY = 'connected-blog-posts';
const MOCK_API_LATENCY = 300; // ms

// --- Utility Functions ---

const simulateApiCall = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(data), MOCK_API_LATENCY);
    });
};

const _getUsers = (): User[] => {
    try {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch {
        return [];
    }
};

const _saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const _getPosts = (): Post[] => {
    try {
        const postsJson = localStorage.getItem(POSTS_STORAGE_KEY);
        return postsJson ? JSON.parse(postsJson) : [];
    } catch {
        return [];
    }
};

const _savePosts = (posts: Post[]) => {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

/** Insecure hash simulation */
const _mockHash = async (password: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `hashed_${password}`;
  }
};


// --- User API ---

export const createUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    let users = _getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return simulateApiCall({ success: false, message: 'Username is already taken.' });
    }
    const passwordHash = await _mockHash(password);
    const newUser: User = { username, passwordHash, bio: '' };
    _saveUsers([...users, newUser]);
    return simulateApiCall({ success: true, message: 'User registered successfully.' });
};

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
    const users = _getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return simulateApiCall(null);

    const inputPasswordHash = await _mockHash(password);
    return simulateApiCall(user.passwordHash === inputPasswordHash ? user : null);
};

export const getUserByUsername = async(username: string): Promise<User | null> => {
    const users = _getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    return simulateApiCall(user);
}

export const updateUser = async (
    username: string,
    data: Partial<User> & { currentPassword?: string, newPassword?: string }
): Promise<{ success: boolean; message?: string; user?: User }> => {
    let users = _getUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
        return simulateApiCall({ success: false, message: 'User not found.' });
    }

    let user = users[userIndex];

    // Password change logic
    if (data.newPassword) {
        if (!data.currentPassword) {
            return simulateApiCall({ success: false, message: 'Current password is required to set a new one.' });
        }
        if (data.newPassword.length < 6) {
            return simulateApiCall({ success: false, message: 'New password must be at least 6 characters.' });
        }
        const currentPasswordHash = await _mockHash(data.currentPassword);
        if (currentPasswordHash !== user.passwordHash) {
            return simulateApiCall({ success: false, message: 'Incorrect current password.' });
        }
        user.passwordHash = await _mockHash(data.newPassword);
    }

    // Bio change logic
    if (typeof data.bio !== 'undefined') {
        user.bio = data.bio;
    }
    
    users[userIndex] = user;
    _saveUsers(users);

    return simulateApiCall({ success: true, user });
};


// --- Post API ---

export const fetchAllPosts = async (): Promise<Post[]> => {
    const posts = _getPosts().sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return simulateApiCall(posts);
};

export const fetchUserPosts = async (username: string): Promise<Post[]> => {
    const posts = _getPosts()
        .filter(p => p.author.toLowerCase() === username.toLowerCase())
        .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return simulateApiCall(posts);
};

export const fetchPostById = async (id: string): Promise<Post | null> => {
    const post = _getPosts().find(p => p.id === id) || null;
    return simulateApiCall(post);
}

export const insertPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'upvotes' | 'downvotes'>) => {
    const now = new Date().toISOString();
    const newPost: Post = {
        ...postData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        comments: [],
        upvotes: [],
        downvotes: []
    };
    const posts = _getPosts();
    _savePosts([newPost, ...posts]);
    return simulateApiCall(newPost);
};

export const modifyPost = async (id: string, postUpdate: Partial<Post>): Promise<Post | null> => {
    let posts = _getPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) return simulateApiCall(null);

    posts[postIndex] = { ...posts[postIndex], ...postUpdate, updatedAt: new Date().toISOString() };
    _savePosts(posts);
    return simulateApiCall(posts[postIndex]);
};

export const removePost = async (id: string): Promise<{ success: boolean }> => {
    let posts = _getPosts();
    const newPosts = posts.filter(p => p.id !== id);
    _savePosts(newPosts);
    return simulateApiCall({ success: posts.length !== newPosts.length });
};

// --- Interactions API ---

export const insertComment = async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment | null> => {
    let posts = _getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return simulateApiCall(null);
    
    const now = new Date().toISOString();
    const newComment: Comment = {
        ...commentData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
    };
    
    posts[postIndex].comments.push(newComment);
    _savePosts(posts);
    return simulateApiCall(newComment);
};

export const modifyComment = async (postId: string, commentId: string, content: string): Promise<Comment | null> => {
    let posts = _getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return simulateApiCall(null);

    const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return simulateApiCall(null);

    posts[postIndex].comments[commentIndex].content = content;
    posts[postIndex].comments[commentIndex].updatedAt = new Date().toISOString();
    _savePosts(posts);
    return simulateApiCall(posts[postIndex].comments[commentIndex]);
};

export const removeComment = async (postId: string, commentId: string): Promise<{success: boolean}> => {
    let posts = _getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return simulateApiCall({success: false});

    const originalCommentCount = posts[postIndex].comments.length;
    posts[postIndex].comments = posts[postIndex].comments.filter(c => c.id !== commentId);
    const newCommentCount = posts[postIndex].comments.length;

    _savePosts(posts);
    return simulateApiCall({success: originalCommentCount > newCommentCount});
};

export const manageVote = async (postId: string, username: string, voteType: 'upvote' | 'downvote'): Promise<Post | null> => {
    let posts = _getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return simulateApiCall(null);
    
    const post = posts[postIndex];
    if (post.author === username) return simulateApiCall(post); // Cannot vote on own post

    const upvoteIndex = post.upvotes.indexOf(username);
    const downvoteIndex = post.downvotes.indexOf(username);
    
    if (voteType === 'upvote') {
        if (upvoteIndex > -1) { // User is retracting upvote
            post.upvotes.splice(upvoteIndex, 1);
        } else {
            post.upvotes.push(username);
            if (downvoteIndex > -1) { // Remove downvote if it exists
                post.downvotes.splice(downvoteIndex, 1);
            }
        }
    } else { // downvote
        if (downvoteIndex > -1) { // User is retracting downvote
            post.downvotes.splice(downvoteIndex, 1);
        } else {
            post.downvotes.push(username);
            if (upvoteIndex > -1) { // Remove upvote if it exists
                post.upvotes.splice(upvoteIndex, 1);
            }
        }
    }
    
    posts[postIndex] = post;
    _savePosts(posts);
    return simulateApiCall(post);
};