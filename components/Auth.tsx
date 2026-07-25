import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useSearchParams } from 'react-router-dom';
import Icon from './Icon';
import { Post } from '../types';
import * as postsService from '../services/postsService';
const AnonymousPostCard: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
  const getAuthorNumber = (str: string) => {
    return (str.charCodeAt(0) + str.charCodeAt(str.length - 1)) % 8;
  };

  const authorNumber = getAuthorNumber(post.author);
  const colors = [
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  ];

  const authorColor = colors[authorNumber];
  const voteScore = post.upvotes.length - post.downvotes.length;
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
  const truncate = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${authorColor}`}>
          A{index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Anonymous Writer</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
          {truncate(stripHtml(post.content), 150)}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Icon name="arrow-trending-up" className="h-4 w-4" />
            <span className={voteScore > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : voteScore < 0 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
              {voteScore > 0 ? '+' : ''}{voteScore}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="chat-bubble-left" className="h-4 w-4" />
            {post.comments.length}
          </div>
        </div>
      </div>
    </div>
  );
};

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(modeParam === 'signup' ? false : true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const { login, register } = useUser();

  // Generate math question for registration
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    let question;
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    setMathQuestion({ question, answer });
  };

  // Generate math question when switching to register mode
  React.useEffect(() => {
    if (!isLogin) {
      generateMathQuestion();
    }
  }, [isLogin]);

  // Fetch public posts on mount
  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const allPosts = await postsService.getAllPosts();
        setPublicPosts(allPosts || []); // Show all posts
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPublicPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPublicPosts();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify math answer for registration
    if (!isLogin) {
      if (parseInt(userAnswer) !== mathQuestion.answer) {
        alert('Please solve the math problem correctly to verify you are human.');
        generateMathQuestion(); // Generate new question
        setUserAnswer('');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, username, password);
        // Reset form and generate new math question
        setEmail('');
        setUsername('');
        setPassword('');
        setUserAnswer('');
        generateMathQuestion();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-screen">
        {/* Left: Auth Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 order-2 lg:order-1">
          <div className="w-full max-w-md space-y-8">
            {/* Product Description Section */}
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Connected-Blog
              </h1>
              <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Your AI-powered space for creating, sharing, and discovering content.
                Made by <a href="https://julesample.vercel.app/" target="_blank"  className="text-primary-600 dark:text-primary-400">Julesample</a>
              </p>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setShowModal(true); }}
                className="mt-6 inline-block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Learn More
              </a>
            </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()}>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What is Connected-Blog?</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Connected-Blog is a modern Content Management System (CMS) designed to demonstrate the power
                  of integrating large language models into web applications. It provides a seamless experience for multiple users
                  to register, create rich blog posts, and interact with content from the entire community.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Core Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full">
                       <Icon name="user-circle" className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">User Profiles & Settings</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Full user authentication, public profiles to view user content, and a private settings page to update your bio and password.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full">
                     <Icon name="sparkles" className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Content Generation</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Integrated with the Gemini API, the post editor can help you brainstorm ideas, draft paragraphs, or write entire articles from a simple prompt.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full">
                       <Icon name="chat-bubble-left-right" className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Full Post Interaction</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Engage with content through a full-featured comment system (create, edit, delete) and an upvote/downvote system.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full">
                        <Icon name="pencil-square" className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Content Management</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Users have complete control over their own posts with the ability to Create, Read, Update, and Delete them through an intuitive dashboard.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 inline-flex items-center justify-center h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

            {/* Authentication Form */}
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                {isLogin ? 'Welcome back! Sign in to continue your journey.' : 'Join our community of writers and creators.'}
              </p>
            </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 ${isLogin ? 'rounded-b-md' : ''} focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="mathVerification" className="sr-only">
                  Math Verification
                </label>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md mb-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Please solve this math problem to verify you're human:
                  </p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 text-center">
                    {mathQuestion.question} = ?
                  </p>
                </div>
                <input
                  id="mathVerification"
                  name="mathVerification"
                  type="number"
                  required={!isLogin}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Your answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setUsername('');
                setPassword('');
                setUserAnswer('');
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
          </div>
        </div>

        {/* Right: Public Feed */}
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 order-1 lg:order-2">
          <div className="w-full max-w-2xl space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Community Highlights</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Read what our anonymous writers are sharing
              </p>
            </div>

            {isLoadingPosts ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : publicPosts.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {publicPosts.slice(0, 5).map((post, index) => (
                  <AnonymousPostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">No posts yet. Be the first to share!</p>
              </div>
            )}

            {publicPosts.length > 5 && (
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Showing 5 of {publicPosts.length} posts
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                All authors are completely anonymous. Join to unlock the full experience!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
