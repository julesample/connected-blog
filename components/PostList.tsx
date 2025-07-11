import React from 'react';
import { usePosts } from '../hooks/usePosts';
import { useUser } from '../context/UserContext';
import { Post } from '../types';

interface PostListProps {
  onSelectPost?: (post: Post) => void;
}

export const PostList: React.FC<PostListProps> = ({ onSelectPost }) => {
  const { posts, loading, error, voteOnPost } = usePosts();
  const { user } = useUser();

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return;
    await voteOnPost(postId, voteType);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading posts: {error}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No posts yet. Be the first to create one!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelectPost?.(post)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.content}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>By {post.username}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {user && (
              <div className="flex flex-col items-center ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, 'upvote');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ▲
                </button>
                <span className="text-sm font-medium">
                  {(post.upvotes || 0) - (post.downvotes || 0)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, 'downvote');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};