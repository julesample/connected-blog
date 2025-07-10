import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import Icon from './Icon';

const Settings: React.FC = () => {
    const { currentUser, updateUserProfile } = useUser();
    const { showToast } = useToast();

    const [bio, setBio] = useState(currentUser?.bio || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isBioLoading, setIsBioLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isBioLoading}
                            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50"
                        >
                            <Icon name="save" className="h-5 w-5" />
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
                            <Icon name="save" className="h-5 w-5" />
                            {isPasswordLoading ? 'Saving...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;