
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostsContext } from '../context/PostsContext';
import { useToast } from '../context/ToastContext';
import Icon from './Icon';

const PostList: React.FC = () => {
  const { posts, deletePost } = usePostsContext();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'title' | 'content' | 'both'>('both');

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the post "${title}"?`)) {
      deletePost(id);
      showToast('Post deleted successfully', 'success');
    }
  };

  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    
    switch (searchBy) {
      case 'title':
        return post.title.toLowerCase().includes(query);
      case 'content':
        return post.content.toLowerCase().includes(query);
      case 'both':
        return post.title.toLowerCase().includes(query) || 
               post.content.toLowerCase().includes(query);
      default:
        return true;
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Content Dashboard
        </h1>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Icon name="plus" className="h-5 w-5" />
          New Post
        </Link>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search Posts</label>
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
                className="block w-full rounded-md border-0 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                placeholder="Search your posts..."
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label htmlFor="searchBy" className="sr-only">Search by</label>
            <select
              id="searchBy"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as 'title' | 'content' | 'both')}
              className="block w-full rounded-md border-0 bg-white dark:bg-slate-800 py-2.5 px-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
            >
              <option value="both">Search Title & Content</option>
              <option value="title">Search Title Only</option>
              <option value="content">Search Content Only</option>
            </select>
          </div>
        </div>
        
        {searchQuery && (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} 
            {searchBy === 'both' ? ' in title and content' : ` in ${searchBy}`} 
            for "{searchQuery}"
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <h3 className="text-xl font-medium">No posts yet</h3>
            <p className="mt-2">Click "New Post" to get started.</p>
          </div>
        ) : filteredPosts.length === 0 ? (
           <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <h3 className="text-xl font-medium">No posts found</h3>
            <p className="mt-2">
              Your search for "{searchQuery}" 
              {searchBy === 'both' ? ' in title and content' : ` in ${searchBy}`} 
              did not match any posts.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Preview</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">Last Updated</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {searchQuery && searchBy !== 'content' ? (
                          <span dangerouslySetInnerHTML={{
                            __html: post.title.replace(
                              new RegExp(`(${searchQuery})`, 'gi'),
                              '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                            )
                          }} />
                        ) : (
                          post.title
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {searchQuery && searchBy !== 'title' ? (
                          <span dangerouslySetInnerHTML={{
                            __html: post.content.substring(0, 100).replace(
                              new RegExp(`(${searchQuery})`, 'gi'),
                              '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                            )
                          }} />
                        ) : (
                          post.content.substring(0, 100)
                        )}
                        {post.content.length > 100 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(post.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/post/${post.id}`} className="p-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="View">
                          <Icon name="eye" className="h-5 w-5" />
                        </Link>
                        <Link to={`/edit/${post.id}`} className="p-2 text-slate-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" title="Edit">
                           <Icon name="edit" className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleDelete(post.id, post.title)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                          <Icon name="trash" className="h-5 w-5" />
                        </button>
                      </div>
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
              placeholder="Search posts by title..."
            />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <h3 className="text-xl font-medium">No posts yet</h3>
            <p className="mt-2">Click "New Post" to get started.</p>
          </div>
        ) : filteredPosts.length === 0 ? (
           <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <h3 className="text-xl font-medium">No posts found</h3>
            <p className="mt-2">Your search for "{searchQuery}" did not match any posts.</p>
          </div>
        ) : (
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
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(post.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/post/${post.id}`} className="p-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="View">
                          <Icon name="eye" className="h-5 w-5" />
                        </Link>
                        <Link to={`/edit/${post.id}`} className="p-2 text-slate-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" title="Edit">
                           <Icon name="edit" className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleDelete(post.id, post.title)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                          <Icon name="trash" className="h-5 w-5" />
                        </button>
                      </div>
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

export default PostList;
