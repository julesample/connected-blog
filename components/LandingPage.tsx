import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
          Read more →
        </span>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        setIsLoading(true);
        const allPosts = await postsService.getAllPosts();
        setPosts(allPosts.slice(0, 6)); // Show first 6 posts
        setTotalPosts(allPosts.length);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicPosts();
  }, []);

  const activeWriters = useMemo(() => {
    const uniqueAuthors = new Set(posts.map(p => p.author));
    return uniqueAuthors.size;
  }, [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              Connected‑Blog
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/auth?mode=login')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Thoughts</span> Anonymously
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join our community of anonymous writers. Share your ideas, read diverse perspectives, and engage with real voices from around the world—all while maintaining your privacy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Get Started Free
          </button>
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('public-feed')?.offsetTop || 0, behavior: 'smooth' })}
            className="px-8 py-3 border-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 font-semibold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
          >
            Browse Public Feed
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-slate-800 py-12 border-y border-slate-200 dark:border-slate-700">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {totalPosts.toLocaleString()}
              </div>
              <p className="text-slate-600 dark:text-slate-400">Public Posts</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {activeWriters.toLocaleString()}
              </div>
              <p className="text-slate-600 dark:text-slate-400">Active Writers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                100%
              </div>
              <p className="text-slate-600 dark:text-slate-400">Anonymous</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-16 text-center">
            Why Choose Connected‑Blog?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                <Icon name="shield-check" className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Complete Anonymity</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Share freely without revealing your identity. Your thoughts matter, not your name.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                <Icon name="users" className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Engaged Community</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Connect with thousands of writers and readers who value authentic expression.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                <Icon name="spark-les" className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Fresh Perspectives</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Discover diverse viewpoints without bias. Every voice deserves to be heard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Feed Section */}
      <section id="public-feed" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            See What&apos;s Being Shared
          </h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 animate-pulse">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {posts.map((post, index) => (
                  <AnonymousPostCard key={post.id} post={post} index={index} />
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  View All Posts & Join
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Be the first to share your thoughts!
              </p>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Share Your Story?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of anonymous writers building a community without judgment, without bias, without fear.
          </p>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Features</button></li>
                <li><button className="hover:text-white transition-colors">Pricing</button></li>
                <li><button className="hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Guidelines</button></li>
                <li><button className="hover:text-white transition-colors">Blog</button></li>
                <li><button className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Privacy</button></li>
                <li><button className="hover:text-white transition-colors">Terms</button></li>
                <li><button className="hover:text-white transition-colors">Cookies</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Twitter</button></li>
                <li><button className="hover:text-white transition-colors">LinkedIn</button></li>
                <li><button className="hover:text-white transition-colors">Discord</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Connected‑Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
