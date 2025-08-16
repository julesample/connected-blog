import React from 'react';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Skeleton */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          
          {/* User Info Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full max-w-md"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
            <div className="flex gap-4 mt-3">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
          </div>
          
          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Posts Section Skeleton */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
        </div>
        
        <div className="p-6">
          {/* Table Header Skeleton */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="col-span-3 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="col-span-3 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="col-span-2 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          
          {/* Post Rows Skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 py-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
              <div className="col-span-4 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
              <div className="col-span-3 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
              </div>
              <div className="col-span-3">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
              <div className="col-span-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
