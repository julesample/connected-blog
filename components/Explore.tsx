import React, { useState } from 'react';
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
  const { allPosts, isLoading } = usePostsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Explore All Content
        </h1>
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
                <Icon name="search" className="h-5 w-5 text-slate-400" />
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Author</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Votes</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Last Updated</th>
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
        ): allPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <h3 className="text-xl font-medium">No content has been created yet.</h3>
            <p className="mt-2">Be the first one to create a post!</p>
          </div>
        ) : filteredAndSortedPosts.length === 0 ? (
           <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <h3 className="text-xl font-medium">No content found</h3>
            <p className="mt-2">Your search for "{searchQuery}" did not match any posts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Author</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Votes</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Last Updated</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAndSortedPosts.map((post: Post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/post/${post.id}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">{post.title}</Link>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <Link to={`/profile/${post.author}`} className="hover:underline">{post.author}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <VoteControl post={post} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(post.updatedAt).toLocaleDateString()}
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
        )}
      </div>
    </div>
  );
};

export default Explore;