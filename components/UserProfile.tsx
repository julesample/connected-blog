import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Post, User } from '../types';
import * as authService from '../services/authService';
import * as postsService from '../services/postsService';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { usePostsContext } from '../context/PostsContext';
import Icon from './Icon';
import ProfileSkeleton from './ProfileSkeleton';

const UserProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { currentUser, deleteUserAccount } = useUser();
    const { showToast } = useToast();
    const { deletePost } = usePostsContext();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!username) return;
            setIsLoading(true);
            try {
                const [userData, userPosts] = await Promise.all([
                    authService.getProfile(username),
                    postsService.getUserPosts(username)
                ]);
                
                if (userData) {
                    setUser(userData);
                    setPosts(userPosts);
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [username]);

    const handleDeletePost = async (postId: string) => {
        try {
            await deletePost(postId);
            setPosts(posts.filter(post => post.id !== postId));
            setShowDeleteModal(false);
            setPostToDelete(null);
        } catch (error) {
            showToast('Failed to delete post', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword.trim()) {
            showToast('Please enter your password to confirm account deletion.', 'error');
            return;
        }
        
        setIsDeletingAccount(true);
        try {
            const success = await deleteUserAccount(deletePassword);
            if (success) {
                navigate('/');
            }
        } catch (error) {
            showToast('Failed to delete account', 'error');
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteAccountModal(false);
            setDeletePassword('');
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        return (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="mb-4">
                    <Icon name="users" className="h-16 w-16 mx-auto text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">User Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">The user "{username}" does not exist.</p>
                <Link 
                    to="/explore" 
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                    <Icon name="back" className="h-4 w-4" />
                    Back to Explore
                </Link>
            </div>
        );
    }
    
    const isOwnProfile = currentUser?.username === user.username;

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.username}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            <div 
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: user.bio || 'This user has not set a bio yet.' 
                                }}
                            />
                        </p>
                        <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Icon name="edit" className="h-4 w-4" />
                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                            </span>
                        </div>
                    </div>
                    {isOwnProfile && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/settings"
                                className="inline-flex items-center gap-2 justify-center rounded-md bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"
                            >
                                <Icon name="cog-6-tooth" className="h-5 w-5" />
                                Edit Profile
                            </Link>
                            <button
                                onClick={() => setShowDeleteAccountModal(true)}
                                className="inline-flex items-center gap-2 justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            >
                                <Icon name="trash" className="h-5 w-5" />
                                Delete Account
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Posts Section */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Icon name="edit" className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        Posts by {user.username} ({posts.length})
                    </h2>
                    {isOwnProfile && (
                        <Link
                            to="/new"
                            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            New Post
                        </Link>
                    )}
                </div>
                
                {posts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                                        Title
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                                        Engagement
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                                        Last Updated
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {posts.map(post => (
                                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <Link 
                                                    to={`/post/${post.id}`} 
                                                    className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                >
                                                    {post.title}
                                                </Link>
                                                <div 
                                                    className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                    <Icon name="arrow-up" className="h-4 w-4" />
                                                    {post.upvotes.length}
                                                </span>
                                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                    <Icon name="arrow-down" className="h-4 w-4" />
                                                    {post.downvotes.length}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                    <Icon name="chat-bubble-left-ellipsis" className="h-4 w-4" />
                                                    {post.comments.length}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(post.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Link 
                                                    to={`/post/${post.id}`} 
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" 
                                                    title="View Post"
                                                >
                                                    <Icon name="eye" className="h-4 w-4" />
                                                    View
                                                </Link>
                                                {isOwnProfile && (
                                                    <>
                                                        <Link 
                                                            to={`/edit/${post.id}`} 
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors" 
                                                            title="Edit Post"
                                                        >
                                                            <Icon name="edit" className="h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                        <button 
                                                            onClick={() => {
                                                                setPostToDelete(post.id);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/50 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors" 
                                                            title="Delete Post"
                                                        >
                                                            <Icon name="trash" className="h-4 w-4" />
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Icon name="edit" className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            {isOwnProfile ? "You haven't created any posts yet" : `${user.username} has not created any posts yet`}
                        </h3>
                        {isOwnProfile && (
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                Share your thoughts and ideas with the community!
                            </p>
                        )}
                        {isOwnProfile && (
                            <Link
                                to="/new"
                                className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
                            >
                                <Icon name="plus" className="h-5 w-5" />
                                Create Your First Post
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Post Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <Icon name="trash" className="h-6 w-6 text-red-600" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Post</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Are you sure you want to delete this post? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setPostToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => postToDelete && handleDeletePost(postToDelete)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors"
                            >
                                Delete Post
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteAccountModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <Icon name="trash" className="h-6 w-6 text-red-600" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Account</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Are you sure you want to delete your account? This will permanently remove all your posts, comments, and profile data. This action cannot be undone.
                        </p>
                        <div className="mb-6">
                            <label htmlFor="deletePassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Enter your password to confirm:
                            </label>
                            <input
                                id="deletePassword"
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="block w-full rounded-md border-0 bg-white dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                                placeholder="Your password"
                                required
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteAccountModal(false);
                                    setDeletePassword('');
                                }}
                                disabled={isDeletingAccount}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeletingAccount || !deletePassword.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;