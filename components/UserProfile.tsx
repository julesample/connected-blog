import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Post, User } from '../types';
import * as authService from '../services/authService';
import * as postsService from '../services/postsService';
import { useUser } from '../context/UserContext';
import Icon from './Icon';

const UserProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { currentUser } = useUser();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    if (!user) {
        return (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">User Not Found</h2>
                <p className="text-slate-500 mt-2">The user "{username}" does not exist.</p>
                <Link to="/explore" className="mt-4 inline-block text-primary-600 hover:underline">
                    Back to Explore
                </Link>
            </div>
        );
    }
    
    const isOwnProfile = currentUser?.username === user.username;

    return (
        <div className="space-y-8">
            <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0 h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-300 text-4xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.username}</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">{user.bio || 'This user has not set a bio yet.'}</p>
                    </div>
                    {isOwnProfile && (
                        <Link
                            to="/settings"
                            className="inline-flex items-center gap-2 justify-center rounded-md bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                            <Icon name="cog-6-tooth" className="h-5 w-5" />
                            Edit Profile
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg">
                 <h2 className="text-2xl font-bold p-6 border-b border-slate-200 dark:border-slate-700">
                    Posts by {user.username} ({posts.length})
                </h2>
                {posts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Last Updated</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {posts.map(post => (
                                    <tr key={post.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">{post.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(post.updatedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                             <Link to={`/post/${post.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800" title="View Post">
                                                <Icon name="eye" className="h-4 w-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="p-6 text-center text-slate-500 dark:text-slate-400">{user.username} has not created any posts yet.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;