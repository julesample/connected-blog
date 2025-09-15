import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Post, User } from '../types';
import * as authService from '../services/authService';
import * as postsService from '../services/postsService';
import { togglePinPost } from '../services/api';
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
    const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
    const [unpinnedPosts, setUnpinnedPosts] = useState<Post[]>([]);
    const [totalUnpinnedPosts, setTotalUnpinnedPosts] = useState(0);
    const [totalPosts, setTotalPosts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [pinningPostId, setPinningPostId] = useState<string | null>(null);

    const handlePinPost = async (postId: string) => {
        if (!currentUser) return;
        setPinningPostId(postId);
        try {
            const updatedPost = await togglePinPost(postId, currentUser.username);
            if (updatedPost) {
                const updatedPosts = posts.map(post => post.id === postId ? updatedPost : post);
                setPosts(updatedPosts);
                setPinnedPosts(updatedPosts.filter(p => p.pinned));
                setUnpinnedPosts(updatedPosts.filter(p => !p.pinned));
                showToast(updatedPost.pinned ? 'Post pinned successfully' : 'Post unpinned successfully', 'success');
            } else {
                showToast('Failed to toggle pin', 'error');
            }
        } catch (error) {
            showToast('Failed to toggle pin', 'error');
        } finally {
            setPinningPostId(null);
        }
    };

    // Calculate total upvotes and comments from posts
    const totalUpvotes = posts.reduce((acc, post) => acc + post.upvotes.length, 0);
    const totalComments = posts.reduce((acc, post) => acc + post.comments.length, 0);

    // Calculate posting streak (consecutive days with posts)
    const calculateStreak = (posts: Post[]) => {
        if (posts.length === 0) return 0;
        // Sort posts by createdAt descending
        const sortedDates = posts
            .map(post => new Date(post.createdAt).toDateString())
            .filter((date, index, self) => self.indexOf(date) === index) // unique dates
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        // If the last post is not today or yesterday, streak is 0
        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
            return 0;
        }

        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = new Date(sortedDates[i - 1]);
            const diff = (prevDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const postingStreak = calculateStreak(posts);

    useEffect(() => {
        const fetchData = async () => {
            if (!username) return;
            setIsLoading(true);
            try {
                const [userData, allPostsData] = await Promise.all([
                    authService.getProfile(username),
                    postsService.getUserPosts(username)
                ]);

                if (userData && allPostsData) {
                    setUser(userData);
                    setIsPrivate(userData.is_private || false);
                    setPosts(allPostsData); // All posts for calculations
                    const pinned = allPostsData.filter(post => post.pinned);
                    const unpinned = allPostsData.filter(post => !post.pinned);
                    setPinnedPosts(pinned);
                    setUnpinnedPosts(unpinned);
                    setTotalUnpinnedPosts(unpinned.length);
                    setTotalPosts(allPostsData.length);
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [username]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleDeletePost = async (postId: string) => {
        try {
            await deletePost(postId);
            const updatedPosts = posts.filter(post => post.id !== postId);
            setPosts(updatedPosts);
            setPinnedPosts(updatedPosts.filter(p => p.pinned));
            setUnpinnedPosts(updatedPosts.filter(p => !p.pinned));
            setTotalUnpinnedPosts(updatedPosts.filter(p => !p.pinned).length);
            setTotalPosts(updatedPosts.length);
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
            } else {
                showToast('Incorrect password or failed to delete account.', 'error');
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
                    <Icon name="arrow-turn-up-left" className="h-4 w-4" />
                    Back to Explore
                </Link>
            </div>
        );
    }
    
    const isOwnProfile = currentUser?.username === user.username;

    const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

    // Use the new state variables for pinned and unpinned posts
    // Filter unpinned posts based on search query
    const filteredUnpinnedPosts = unpinnedPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.replace(/<[^>]*>/g, '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination only applies to unpinned posts excluding pinned posts
    const unpinnedPostsExcludingPinned = unpinnedPosts.filter(post => !post.pinned);
    const filteredUnpinnedPostsExcludingPinned = unpinnedPostsExcludingPinned
        .filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.replace(/<[^>]*>/g, '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by createdAt descending
    const totalPages = Math.ceil(filteredUnpinnedPostsExcludingPinned.length / postsPerPage);
    const paginatedPosts = filteredUnpinnedPostsExcludingPinned
        .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    // Combine pinned posts (always shown) with paginated unpinned posts excluding pinned posts
    const allDisplayedPosts = [...pinnedPosts, ...paginatedPosts];

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
                        <div className="mt-2 text-slate-600 dark:text-slate-400">
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: user.bio || 'This user has not set a bio yet.'
                                }}
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-start gap-3 sm:gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 justify-center sm:justify-start">
                                <Icon name="pencil-square" className="h-4 w-4" />
                                {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
                            </span>
                            <span className="flex items-center gap-1 justify-center sm:justify-start">
                                <Icon name="arrow-up" className="h-4 w-4" />
                                {totalUpvotes} {totalUpvotes === 1 ? 'upvote' : 'upvotes'}
                            </span>
                            <span className="flex items-center gap-1 justify-center sm:justify-start">
                                <Icon name="chat-bubble-left-ellipsis" className="h-4 w-4" />
                                {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                            </span>
                            <span className="flex items-center gap-1 justify-center sm:justify-start">
                                <Icon name={postingStreak > 0 ? "bolt" : "bolt-slash"} className="h-4 w-4" />
                                {postingStreak > 0 
                                ? `${postingStreak} day${postingStreak > 1 ? "s" : ""} streak` 
                                : "Broken streak"}
                            </span>
                        </div>
                    </div>
                    {isOwnProfile && (
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Link
                                to="/settings"
                                className="inline-flex items-center gap-2 justify-center rounded-md bg-slate-200 dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600 min-h-[44px] sm:min-h-0"
                            >
                                <Icon name="cog-6-tooth" className="h-5 w-5" />
                                Edit Profile
                            </Link>
                            <button
                                onClick={() => setShowDeleteAccountModal(true)}
                                className="inline-flex items-center gap-2 justify-center rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 min-h-[44px] sm:min-h-0"
                            >
                                <Icon name="trash" className="h-5 w-5" />
                                Delete Account
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Posts Section */}
            {isPrivate && !isOwnProfile ? (
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-12 text-center">
                        <Icon name="lock-closed" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white mb-2">
                            This profile is private
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                            {user.username} has chosen to keep their posts private.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Icon name="pencil-square" className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            Posts by {user.username} ({totalPosts})
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

                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex-1">
                        <label htmlFor="search" className="sr-only">Search Posts</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Icon name="magnifying-glass" className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="search"
                                name="search"
                                id="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-md border-0 bg-white dark:bg-slate-800 py-2.5 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                                placeholder="Search by title or content..."
                            />
                        </div>
                    </div>
                </div>
                
                {allDisplayedPosts.length > 0 ? (
                    <>
                        {/* Pinned Posts Section */}
                        {pinnedPosts.length > 0 && (
                            <div className="border-b border-slate-200 dark:border-slate-700">
                                <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Icon name="pin" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        Pinned Posts ({pinnedPosts.length})
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        Important posts that {user.username} has chosen to highlight
                                    </p>
                                </div>
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
                                                    Created at
                                                </th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {pinnedPosts.map(post => (
                                                <tr key={post.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors bg-blue-25/30 dark:bg-blue-900/5 border-l-4 border-blue-200 dark:border-blue-700">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <Icon name="pin" className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                                <Link
                                                                    to={`/post/${post.id}`}
                                                                    className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                                >
                                                                   {truncateText(post.title, 50)}
                                                                </Link>
                                                            </div>
                                                            <div
                                                                className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 prose prose-sm dark:prose-invert max-w-none ml-6"
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
                                                        {new Date(post.createdAt).toLocaleDateString('en-US', {
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
                                                                    <button
                                                                        onClick={() => handlePinPost(post.id)}
                                                                        disabled={pinningPostId === post.id}
                                                                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                                                        title="Unpin Post"
                                                                    >
                                                                        <Icon name="paper-clip" className="h-4 w-4" />
                                                                        Unpin
                                                                    </button>
                                                                    <Link
                                                                        to={`/edit/${post.id}`}
                                                                        className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                                                        title="Edit Post"
                                                                    >
                                                                        <Icon name="pencil-square" className="h-4 w-4" />
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
                            </div>
                        )}

                        {/* Regular Posts Section */}
                        {filteredUnpinnedPosts.length > 0 && (
                            <div>
                                {pinnedPosts.length > 0 && (
                                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Icon name="pencil-square" className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            Recent Posts ({filteredUnpinnedPosts.length})
                                        </h3>
                                       
                                    </div>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        {(pinnedPosts.length === 0) && (
                                            <thead className="bg-slate-50 dark:bg-slate-700">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                                                        Title
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                                                        Engagement
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                                                        Created at
                                                    </th>
                                                    <th scope="col" className="relative px-6 py-3">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                        )}
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {paginatedPosts.map(post => (
                                                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <Link
                                                                to={`/post/${post.id}`}
                                                                className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                            >
                                                               {truncateText(post.title, 50)}
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
                                                        {new Date(post.createdAt).toLocaleDateString('en-US', {
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
                                                                    <button
                                                                        onClick={() => handlePinPost(post.id)}
                                                                        disabled={pinningPostId === post.id}
                                                                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                                        title="Pin Post"
                                                                    >
                                                                        <Icon name="paper-clip" className="h-4 w-4" />
                                                                        Pin
                                                                    </button>
                                                                    <Link
                                                                        to={`/edit/${post.id}`}
                                                                        className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                                                        title="Edit Post"
                                                                    >
                                                                        <Icon name="pencil-square" className="h-4 w-4" />
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
                            </div>
                        )}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <>
                                <div className="block sm:hidden px-4 py-3 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop Pagination */}
                                <div className="hidden sm:flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, allDisplayedPosts.length)} of {allDisplayedPosts.length} posts
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="p-6 sm:p-12 text-center">
                        <Icon name="pencil-square" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white mb-2">
                            {searchQuery && posts.length > 0 ? "No posts found matching your search." : isOwnProfile ? "You haven't created any posts yet" : `${user.username} has not created any posts yet`}
                        </h3>
                        {(!searchQuery || posts.length === 0) && isOwnProfile && (
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm sm:text-base">
                                Share your thoughts and ideas with the community!
                            </p>
                        )}
                        {(!searchQuery || posts.length === 0) && isOwnProfile && (
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
            )}

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