import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePostsContext } from '../context/PostsContext';
import { useUser } from '../context/UserContext';
import Icon from './Icon';
import { Post } from '../types';

const VoteControl: React.FC<{ post: Post }> = ({ post }) => {
  const { vote } = usePostsContext();
  const { currentUser } = useUser();

  const isUpvoted = currentUser ? post.upvotes.includes(currentUser.username) : false;
  const isDownvoted = currentUser ? post.downvotes.includes(currentUser.username) : false;

  return (
    <div className="flex items-center gap-1">
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote(post.id, 'upvote'); }} className={`flex items-center gap-1 p-1 rounded-full text-xs transition-colors ${isUpvoted ? 'text-green-600 dark:text-green-400' : 'text-slate-500 hover:text-green-600'}`}>
        <Icon name="arrow-up" className="h-4 w-4" />
        <span>{post.upvotes.length}</span>
      </button>
       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote(post.id, 'downvote'); }} className={`flex items-center gap-1 p-1 rounded-full text-xs transition-colors ${isDownvoted ? 'text-red-600 dark:text-red-400' : 'text-slate-500 hover:text-red-600'}`}>
        <Icon name="arrow-down" className="h-4 w-4" />
         <span>{post.downvotes.length}</span>
      </button>
    </div>
  );
};


const Explore: React.FC = () => {
  const { allPosts, isLoading, refreshPosts } = usePostsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Auto-refresh posts when component mounts
  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const getVoteScore = (post: Post) => {
    return post.upvotes.length - post.downvotes.length;
  };

  const filteredAndSortedPosts = allPosts
    .filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'highest':
          return getVoteScore(b) - getVoteScore(a);
        case 'lowest':
          return getVoteScore(a) - getVoteScore(b);
        case 'newest':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  const paginatedPosts = filteredAndSortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Public Posts
          </h1>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Icon name="plus" className="h-5 w-5" />
          Create a Post
        </Link>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search All Posts</label>
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
                placeholder="Search by title or author..."
              />
          </div>
        </div>
        <div>
          <label htmlFor="sort" className="sr-only">Sort by</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest')}
            className="block w-full sm:w-auto rounded-md border-0 bg-white dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 sm:text-sm transition"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Votes</option>
            <option value="lowest">Lowest Votes</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
        {isLoading ? (
          <>
            {/* Mobile Loading Cards */}
            <div className="block sm:hidden space-y-4 p-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-12"></div>
                    </div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Loading Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Author</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Votes</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Created / Updated</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16 inline-block"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ): allPosts.length === 0 ? (
          <div className="p-6 sm:p-12 text-center text-slate-500 dark:text-slate-400">
            <Icon name="pencil-square" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-medium">No content has been created yet.</h3>
            <p className="mt-2 text-sm sm:text-base">Be the first one to create a post!</p>
          </div>
        ) : filteredAndSortedPosts.length === 0 ? (
           <div className="p-6 sm:p-12 text-center text-slate-500 dark:text-slate-400">
            <Icon name="magnifying-glass" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-medium">No content found</h3>
            <p className="mt-2 text-sm sm:text-base">Your search for "{searchQuery}" did not match any posts.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card View */}
            <div className="block sm:hidden divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedPosts.map((post: Post) => (
                <div key={post.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/post/${post.id}`}
                        className="text-base font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 block mb-1"
                      >
                        {truncateText(post.title, 60)}
                      </Link>
                      <Link
                        to={`/profile/${post.author}`}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
                      >
                        by {post.author}
                      </Link>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <VoteControl post={post} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Created: {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {new Date(post.createdAt).getTime() !== new Date(post.updatedAt).getTime() && (
                        <> | Updated: {new Date(post.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</>
                      )}
                    </span>
                    <Link
                      to={`/post/${post.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                    >
                      <Icon name="eye" className="h-3 w-3" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Author</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Votes</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Created / Updated</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedPosts.map((post: Post) => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/post/${post.id}`} title={post.title} className="text-sm font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">{truncateText(post.title, 50)}</Link>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        <Link to={`/profile/${post.author}`} className="hover:underline">{post.author}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <VoteControl post={post} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        <div>
                          <div>Created: {new Date(post.createdAt).toLocaleDateString()}</div>
                          {new Date(post.createdAt).getTime() !== new Date(post.updatedAt).getTime() && (
                            <div>Updated: {new Date(post.updatedAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                <div className="hidden sm:flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-slate-500">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            currentPage === totalPages
                              ? 'bg-primary-600 text-white'
                              : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
