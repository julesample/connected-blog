
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePostsContext } from '../context/PostsContext';
import { useToast } from '../context/ToastContext';
import { generateContent } from '../services/geminiService';
import Icon from './Icon';
import TinyMCEEditor from './TinyMCEEditor';

const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addPost, updatePost } = usePostsContext();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      getPost(id).then(post => {
        if (post) {
          setTitle(post.title);
          setContent(post.content);
        } else {
          showToast('Post not found', 'error');
          navigate('/');
        }
      });
    }
  }, [id, isEditing, navigate, showToast, getPost]);

  const handleGenerateContent = async () => {
    if (!aiPrompt.trim()) {
      showToast('Please enter a prompt for the AI.', 'info');
      return;
    }
    setIsAiLoading(true);
    try {
      const generated = await generateContent(aiPrompt);
      setContent(prevContent => `${prevContent}\n\n${generated}`.trim());
      showToast('Content generated successfully!', 'success');
    } catch (error) {
      showToast('Failed to generate content.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        showToast('Title is required', 'error');
        return;
    }
    setIsSaving(true);
    
    try {
      if (isEditing) {
        await updatePost(id!, { title, content });
        showToast('Post updated successfully', 'success');
      } else {
        await addPost({ title, content });
        showToast('Post created successfully', 'success');
      }
      navigate('/');
    } catch(error) {
       showToast('Failed to save post.', 'error');
    } finally {
       setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
            Title
          </label>
          <div className="mt-2">
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
              placeholder="Your Post Title"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-100 mb-2">
            Content
          </label>
          <TinyMCEEditor
            api-key="bbf7tkn7ioraaze412j5m51on50pdoqnzrknvu5x4j0xf2kt"
            value={content}
            onChange={setContent}
            placeholder="Write your blog content here... Use the toolbar above to format your text."
            height={500}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden"
          />
        </div>

        <div className="space-y-4 rounded-lg border border-primary-300/50 dark:border-primary-500/30 p-4 bg-primary-50/50 dark:bg-primary-900/10">
            <div className="flex items-center gap-2">
                <Icon name="sparkles" className="h-6 w-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">AI Content Assistant</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Need inspiration? Describe what you want to write about and let Gemini draft it for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="flex-grow block w-full rounded-md border-0 bg-white/5 dark:bg-white/5 py-2 px-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition"
                placeholder="e.g., 'Write a short intro to React hooks'"
              />
              <button
                type="button"
                onClick={handleGenerateContent}
                disabled={isAiLoading}
                className="inline-flex items-center gap-2 justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Icon name="sparkles" className="h-5 w-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
        </div>

        <div className="flex items-center justify-end gap-x-4 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button type="button" onClick={() => navigate(-1)} className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
          >
            <Icon name="save" className="h-5 w-5" />
            {isSaving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;