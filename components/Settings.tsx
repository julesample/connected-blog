import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { usePostsContext } from '../context/PostsContext';
import Icon from './Icon';


const Settings: React.FC = () => {
    const { currentUser, updateUserProfile } = useUser();
    const { showToast } = useToast();
    const { refreshPosts } = usePostsContext();

    const [bio, setBio] = useState(currentUser?.bio || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPrivate, setIsPrivate] = useState(currentUser?.is_private || false);

    const [isBioLoading, setIsBioLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);

    const handleBioSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBioLoading(true);
        await updateUserProfile({ bio });
        setIsBioLoading(false);
    };
    
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }
        if (!currentPassword || !newPassword) {
            showToast('All password fields are required.', 'error');
            return;
        }

        setIsPasswordLoading(true);
        const success = await updateUserProfile({ currentPassword, newPassword });
        if(success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        setIsPasswordLoading(false);
    };

    const handlePrivacySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPrivacyLoading(true);
        const success = await updateUserProfile({ is_private: isPrivate });
        if (success) {
            showToast(`Account is now ${isPrivate ? 'private' : 'public'}`, 'success');
            // Refresh posts to update the explore feed immediately
            refreshPosts();
        }
        setIsPrivacyLoading(false);
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="space-y-12">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Account Settings
            </h1>

            {/* Edit Bio Section */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">User Information</h2>
                <form onSubmit={handleBioSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                            Username
                        </label>
                        <div className="mt-2">
                            <input
                                id="username"
                                type="text"
                                value={currentUser.username}
                                disabled
                                className="block w-full rounded-md border-0 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                            Bio
                        </label>
                         <div className="mt-2">
               

                              <input
            
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
           
              className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
              placeholder="Who are you?"
            />
                           
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isBioLoading}
                            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50"
                        >
                            <Icon name="pencil-square" className="h-5 w-5" />
                            {isBioLoading ? 'Saving...' : 'Save Bio'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Change Password</h2>
                 <form onSubmit={handlePasswordSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                            Current Password
                        </label>
                        <div className="mt-2">
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                           New Password
                        </label>
                        <div className="mt-2">
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                           Confirm New Password
                        </label>
                        <div className="mt-2">
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                            />
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isPasswordLoading}
                            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50"
                        >
                            <Icon name="pencil-square" className="h-5 w-5" />
                            {isPasswordLoading ? 'Saving...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Privacy Settings Section */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Privacy Settings</h2>
                <form onSubmit={handlePrivacySubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                            Account Visibility
                        </label>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Control who can see your posts. Private accounts hide posts from the public explore feed.
                        </p>
                            <div className="mt-4">
                                <div className="flex items-center">
                                    <input
                                        id="isPrivate"
                                        type="checkbox"
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                                    />
                                    <label htmlFor="isPrivate" className="ml-3 block text-sm font-medium text-slate-900 dark:text-slate-100">
                                        Make account private
                                    </label>
                                    <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isPrivate ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}`}>
                                        {isPrivate ? 'Private' : 'Public'}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {isPrivate
                                        ? "Your posts will be hidden from the public explore feed and can only be viewed by you."
                                        : "Your posts will be visible to everyone in the public explore feed."
                                    }
                                </p>
                            </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isPrivacyLoading}
                            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50"
                        >
                            <Icon name="shield-check" className="h-5 w-5" />
                            {isPrivacyLoading ? 'Saving...' : 'Save Privacy Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;