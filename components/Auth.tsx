import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from './Icon';
import { Post } from '../types';
import * as postsService from '../services/postsService';
const NICKNAMES = [
  'SilentObserver', 'NightOwl', 'CosmicDreamer', 'DigitalNomad', 'PixelArtisan', 
  'QuietReader', 'CloudWalker', 'HiddenGem', 'TechZen', 'DataTraveler',
  'EchoChaser', 'VelvetWriter', 'LunarScribe', 'NeonPhilosopher', 'MysticCoder',
  'SolarVoyager', 'AuroraDreamer', 'QuantumWanderer', 'MidnightThinker', 'StarlightPoet',
  'ShadowSculptor', 'ZenithExplorer', 'CipherWaver', 'AmberSoul', 'SereneMind'
];

const SAMPLE_HIGHLIGHTS: Post[] = [
  {
    id: 'sample-post-1',
    title: 'The Art of Slow Living in a Fast World',
    content: '<p>Taking a step back from constant notifications and fast-paced demands has changed my mental clarity completely. Taking time every morning to sit quietly before diving into work has brought back my focus and peace of mind.</p>',
    author_username: 'SilentObserver',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    upvotes: 24,
    downvotes: 1,
    voted_users: {}
  },
  {
    id: 'sample-post-2',
    title: 'Why I Started Writing Anonymously',
    content: '<p>Expressing thoughts without the weight of personal branding or social pressure feels incredibly liberating. Here, thoughts stand on their own merit rather than who posted them.</p>',
    author_username: 'NightOwl',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    upvotes: 42,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-3',
    title: 'Late Night Coding & Stargazing',
    content: '<p>There is a special peace when the world sleeps and code just flows like poetry. Stargazing during short breaks reminds us how vast the universe is.</p>',
    author_username: 'CosmicDreamer',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    upvotes: 19,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-4',
    title: 'The Beauty of Minimalist Design',
    content: '<p>Less is truly more. Eliminating clutter creates mental space for meaningful ideas to blossom. Clean layouts, generous whitespace, and purposeful typography always win.</p>',
    author_username: 'DigitalNomad',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    upvotes: 35,
    downvotes: 2,
    voted_users: {}
  },
  {
    id: 'sample-post-5',
    title: 'Digital Detox: 30 Days Without Social Feeds',
    content: '<p>Disconnecting from endless scroll algorithms restored my attention span. I finished three books and started learning watercolor painting!</p>',
    author_username: 'PixelArtisan',
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    upvotes: 51,
    downvotes: 1,
    voted_users: {}
  },
  {
    id: 'sample-post-6',
    title: 'Finding Inspiration in Everyday Architecture',
    content: '<p>Walking through the city with fresh eyes reveals intricate geometry and light reflections we usually pass right by. Take a second look today!</p>',
    author_username: 'QuietReader',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    upvotes: 14,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-7',
    title: 'The Power of Daily Journaling',
    content: '<p>Writing down three thoughts every morning keeps anxiety at bay and gives structure to ambitious dreams. Don’t overthink it, just write.</p>',
    author_username: 'CloudWalker',
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    upvotes: 29,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-8',
    title: 'Lessons from Building Open Source Software',
    content: '<p>Community collaboration turns small sparks into robust global tools. Kindness in code reviews makes all the difference.</p>',
    author_username: 'HiddenGem',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    upvotes: 38,
    downvotes: 1,
    voted_users: {}
  },
  {
    id: 'sample-post-9',
    title: 'The Intersection of Philosophy and Technology',
    content: '<p>How ancient Stoic wisdom guides modern ethical decisions in software design and user experience...</p>',
    author_username: 'TechZen',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    upvotes: 22,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-10',
    title: 'Morning Coffee & Fresh Perspectives',
    content: '<p>The ritual of brewing coffee while the sun rises sets a calm, productive tone for creative breakthroughs.</p>',
    author_username: 'DataTraveler',
    created_at: new Date(Date.now() - 3600000 * 34).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 34).toISOString(),
    upvotes: 18,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-11',
    title: 'Navigating Creative Block',
    content: '<p>When the words or ideas won’t come, changing your physical environment or taking a walk in nature is the best medicine.</p>',
    author_username: 'EchoChaser',
    created_at: new Date(Date.now() - 3600000 * 38).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 38).toISOString(),
    upvotes: 27,
    downvotes: 1,
    voted_users: {}
  },
  {
    id: 'sample-post-12',
    title: 'A Deep Dive into Micro-Habits',
    content: '<p>Small 1% daily changes compound into massive personal growth over time. Start with two minutes of reading per night.</p>',
    author_username: 'VelvetWriter',
    created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    upvotes: 33,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-13',
    title: 'Solitude vs. Loneliness',
    content: '<p>Learning to enjoy your own company is the ultimate superpower. Solitude replenishes energy; loneliness seeks validation.</p>',
    author_username: 'LunarScribe',
    created_at: new Date(Date.now() - 3600000 * 46).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 46).toISOString(),
    upvotes: 45,
    downvotes: 2,
    voted_users: {}
  },
  {
    id: 'sample-post-14',
    title: 'Soundscapes for Deep Work',
    content: '<p>Ambient rain sounds and lofi synth beats create a steady acoustic shield against distracting background noise.</p>',
    author_username: 'NeonPhilosopher',
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    upvotes: 21,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-15',
    title: 'Rediscovering Physical Books',
    content: '<p>The tactile feel of paper offers a quiet solace that digital screens can never duplicate.</p>',
    author_username: 'MysticCoder',
    created_at: new Date(Date.now() - 3600000 * 54).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 54).toISOString(),
    upvotes: 30,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-16',
    title: 'Embracing Failure as a Stepping Stone',
    content: '<p>Every bug fixed and failed attempt is a step closer to deep mastery in engineering and life.</p>',
    author_username: 'SolarVoyager',
    created_at: new Date(Date.now() - 3600000 * 58).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 58).toISOString(),
    upvotes: 39,
    downvotes: 1,
    voted_users: {}
  },
  {
    id: 'sample-post-17',
    title: 'The Unseen Value of Active Listening',
    content: '<p>True communication begins when we stop planning our response and genuinely listen to understand.</p>',
    author_username: 'AuroraDreamer',
    created_at: new Date(Date.now() - 3600000 * 62).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 62).toISOString(),
    upvotes: 17,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-18',
    title: 'Exploring High-Altitude Hiking Trails',
    content: '<p>Reaching mountain ridges puts everyday anxieties in context. The air is crisp and the horizon feels endless.</p>',
    author_username: 'QuantumWanderer',
    created_at: new Date(Date.now() - 3600000 * 66).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 66).toISOString(),
    upvotes: 28,
    downvotes: 0,
    voted_users: {}
  },
  {
    id: 'sample-post-19',
    title: 'The Magic of Generative Visual Art',
    content: '<p>Where mathematics, code, and color harmony intersect to form mesmerising generative visual landscapes.</p>',
    author_username: 'MidnightThinker',
    created_at: new Date(Date.now() - 3600000 * 70).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 70).toISOString(),
    upvotes: 25,
    downvotes: 1,
    voted_users: {}
  },
  {
    id: 'sample-post-20',
    title: 'Designing for Accessibility First',
    content: '<p>Making web experiences accessible to everyone is an essential requirement of good craftsmanship, not an afterthought.</p>',
    author_username: 'StarlightPoet',
    created_at: new Date(Date.now() - 3600000 * 74).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 74).toISOString(),
    upvotes: 48,
    downvotes: 0,
    voted_users: {}
  }
];

const AnonymousPostCard: React.FC<{ post: Post; onClick: () => void }> = ({ post, onClick }) => {
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
  };

  const hash = getHash(post.id);
  const authorNumber = hash % 8;
  const nickname = NICKNAMES[hash % NICKNAMES.length];

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

  const avatars = ['user', 'user-circle', 'face-smile', 'fire', 'sparkles', 'sun', 'moon', 'star'];
  const authorColor = colors[authorNumber];
  const avatarIcon = avatars[authorNumber];
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
  const truncate = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <div onClick={onClick} className="block cursor-pointer">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${authorColor}`}>
            <Icon name={avatarIcon} className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{nickname}</p>
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPost]);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        setIsLoadingPosts(true);
        console.log("[v0] Starting to fetch posts from postsService...");
        const allPosts = await postsService.getAllPosts();
        console.log("[v0] Posts fetched successfully:", allPosts);
        console.log("[v0] Total posts:", allPosts?.length ?? 0);
        setPublicPosts(allPosts || []); // Show all posts
      } catch (error) {
        console.error('[v0] Error fetching posts:', error);
        console.error('[v0] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          type: error instanceof Error ? error.name : typeof error,
          stack: error instanceof Error ? error.stack : 'no stack'
        });
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
                {publicPosts.map((post) => (
                  <AnonymousPostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">No posts yet. Be the first to share!</p>
              </div>
            )}


            {/* Fullscreen Post Modal */}
            {selectedPost && (
              <div
                className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-screen h-screen overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Top Navigation Bar */}
                <div className="w-full bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      <Icon name="sparkles" className="h-3.5 w-3.5" />
                      Anonymous Highlight
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                    aria-label="Close post"
                  >
                    <span>Close</span>
                    <Icon name="x-mark" className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Fullscreen Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                      {selectedPost.title}
                    </h1>
                    <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-6" />
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none focus:outline-none"
                      dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                    />
                  </div>
                </div>
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
