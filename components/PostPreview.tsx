import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePostsContext } from '../context/PostsContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { Post, Comment as CommentType } from '../types';
import Icon from './Icon';

const VoteControl: React.FC<{ post: Post }> = ({ post }) => {
  const { vote } = usePostsContext();
  const { currentUser } = useUser();

  const isUpvoted = currentUser ? post.upvotes.includes(currentUser.username) : false;
  const isDownvoted = currentUser ? post.downvotes.includes(currentUser.username) : false;

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!currentUser) return;
    vote(post.id, voteType);
  };
  
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => handleVote('upvote')} className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${isUpvoted ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
        <Icon name="arrow-up" className="h-5 w-5" />
        <span className="font-semibold text-sm">{post.upvotes.length}</span>
      </button>
       <button onClick={() => handleVote('downvote')} className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${isDownvoted ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
        <Icon name="arrow-down" className="h-5 w-5" />
         <span className="font-semibold text-sm">{post.downvotes.length}</span>
      </button>
    </div>
  );
};

const Comment: React.FC<{ comment: CommentType; postId: string; onAction: () => void }> = ({ comment, postId, onAction }) => {
    const { currentUser } = useUser();
    const { updateComment, deleteComment } = usePostsContext();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isAuthor = currentUser?.username === comment.author;

    const handleUpdate = async () => {
        if (!editedContent.trim()) {
            showToast('Comment cannot be empty.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await updateComment(postId, comment.id, editedContent);
            showToast('Comment updated.', 'success');
            setIsEditing(false);
            onAction();
        } catch (error) {
            showToast('Failed to update comment.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteComment(postId, comment.id);
                showToast('Comment deleted.', 'success');
                onAction();
            } catch (error) {
                showToast('Failed to delete comment.', 'error');
            }
        }
    };
    
    return (
    <div className="flex items-start space-x-4 py-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
            <Link to={`/profile/${comment.author}`} title={`View ${comment.author}'s profile`} className="font-bold text-primary-600 dark:text-primary-300">
                {comment.author.charAt(0).toUpperCase()}
            </Link>
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    <Link to={`/profile/${comment.author}`} className="hover:underline">{comment.author}</Link>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(comment.createdAt).toLocaleString()}
                    {comment.updatedAt > comment.createdAt && ' (edited)'}
                </p>
            </div>
            {isEditing ? (
                <div className="mt-2 space-y-2">
                     <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border-0 bg-white dark:bg-slate-700 py-1.5 px-2 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-primary-500 sm:text-sm sm:leading-6 transition"
                        autoFocus
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleUpdate} disabled={isSubmitting} className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-1 rounded-md bg-slate-200 dark:bg-slate-600 px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-300 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="mt-1 text-slate-600 dark:text-slate-300" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {comment.content}
                    </p>
                    {isAuthor && (
                        <div className="mt-1 flex items-center gap-3 text-xs">
                            <button onClick={() => setIsEditing(true)} className="font-medium text-slate-500 hover:text-primary-600 dark:hover:text-primary-400">Edit</button>
                            <button onClick={handleDelete} className="font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400">Delete</button>
                        </div>
                    )}
                </>
            )}
            
        </div>
    </div>
    );
};


const PostPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addComment, deletePost } = usePostsContext();
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);


  const fetchPost = useCallback(async () => {
    if (id && !isDeleting) {
      // Don't set loading to true on refetch, to avoid UI flicker
      const foundPost = await getPost(id);
      if (foundPost) {
        setPost(foundPost);
      } else {
        // Only show "Post not found" if we're not in the process of deleting
        if (!isDeleting) {
          showToast('Post not found.', 'error');
          navigate('/');
        }
      }
      setIsLoading(false);
    }
  }, [id, getPost, navigate, showToast, isDeleting]);

  useEffect(() => {
    setIsLoading(true);
    fetchPost();
  }, [fetchPost]);
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    
    setIsSubmittingComment(true);
    try {
      await addComment(id, newComment);
      setNewComment('');
      showToast('Comment posted!', 'success');
      await fetchPost(); // Refetch post to show the new comment
    } catch(error) {
      showToast('Failed to post comment.', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = () => {
    if (!id || !post) return;
    setShowDeletePostModal(true);
  };

  const confirmDeletePost = async () => {
    if (!id || !post) return;
    
    setIsDeleting(true);
    try {
      await deletePost(id);
      navigate(document.referrer.includes('/explore') ? "/explore" : "/");
    } catch (error) {
      showToast('Failed to delete post.', 'error');
      setIsDeleting(false);
    } finally {
      setShowDeletePostModal(false);
    }
  };

  const cancelDeletePost = () => {
    setShowDeletePostModal(false);
  };

  if (isLoading || !post) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl text-slate-500">Loading post...</h2>
      </div>
    );
  }
  
  const isAuthor = currentUser?.username === post.author;

  return (
    <div>
      <div className="mb-8">
        <Link
          to={document.referrer.includes('/explore') ? "/explore" : "/"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <Icon name="back" className="h-5 w-5" />
          Back to list
        </Link>
      </div>

      <article className="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <div className="p-8 sm:p-12">
            <header className="mb-8 text-center border-b border-slate-200 dark:border-slate-700 pb-8">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {post.title}
                </h1>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    By <Link to={`/profile/${post.author}`} className="font-medium text-primary-600 hover:underline dark:text-primary-400">{post.author}</Link> &bull; Last updated on {new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </header>
            
            <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-strong:text-slate-800 dark:prose-strong:text-slate-100 prose-em:text-slate-700 dark:prose-em:text-slate-200"
            dangerouslySetInnerHTML={{ 
                __html: post.content
                    .replace(/<iframe([^>]*src="https:\/\/www\.youtube\.com[^"]*"[^>]*)><\/iframe>/gi, 
                        '<div class="video-container"><iframe$1 allowfullscreen></iframe></div>')
                    .replace(/<iframe([^>]*src="https:\/\/www\.youtube-nocookie\.com[^"]*"[^>]*)><\/iframe>/gi, 
                        '<div class="video-container"><iframe$1 allowfullscreen></iframe></div>')
                    .replace(/<iframe([^>]*src="https:\/\/youtu\.be[^"]*"[^>]*)><\/iframe>/gi, 
                        '<div class="video-container"><iframe$1 allowfullscreen></iframe></div>')
            }}
            />

            <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <VoteControl post={post} />
                {isAuthor && (
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/edit/${post.id}`}
                            className="inline-flex items-center gap-2 justify-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                        >
                            <Icon name="edit" className="h-5 w-5" />
                            Edit post
                        </Link>
                        <button
                            onClick={handleDeletePost}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50"
                        >
                            <Icon name="trash" className="h-5 w-5" />
                            {isDeleting ? 'Deleting...' : 'Delete post'}
                        </button>
                    </div>
                )}
            </footer>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 sm:p-12 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Comments ({post.comments.length})</h2>
            
            <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-0 bg-white dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                    placeholder="Add your comment..."
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
                >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
            </form>
            
            <div className="space-y-4 divide-y divide-slate-200 dark:divide-slate-700">
                {post.comments.length > 0 ? (
                    post.comments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(comment => <Comment key={comment.id} comment={comment} postId={post.id} onAction={fetchPost} />)
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">Be the first to comment on this post.</p>
                )}
            </div>
        </div>
      </article>

      {/* Delete Post Confirmation Modal */}
      {showDeletePostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Confirm Post Deletion
                </h3>
                <button
                  onClick={cancelDeletePost}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <Icon name="x-mark" className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-600 dark:text-slate-300">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                {post && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Post: {post.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Author: {post.author}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDeletePost}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePost}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPreview;