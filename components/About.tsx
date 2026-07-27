import React from 'react';
import Icon from './Icon';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg p-6 shadow-md border border-slate-200 dark:border-slate-700 h-full">
        <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
            {children}
        </p>
    </div>
);

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          About Connected-Blog
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
          Your AI-powered space for creating, sharing, and discovering content.
          Made by <a href="https://julesample.vercel.app" target="_blank"  className="text-primary-600 dark:text-primary-400">Julesample</a>
        </p>
      </div>

      <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">What is Connected-Blog?</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
            <p>
                Connected-Blog is a modern Content Management System (CMS) designed to demonstrate the power
                of integrating large language models into web applications. It provides a seamless experience for multiple users
                to register, create rich blog posts, and interact with content from the entire community.
            </p>
            
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard icon={<Icon name="users" className="h-6 w-6 text-primary-600 dark:text-primary-400" />} title="User Profiles & Settings">
                Full user authentication, public profiles to view user content, and a private settings page to update your bio and password.
            </FeatureCard>
            <FeatureCard icon={<Icon name="sparkles" className="h-6 w-6 text-primary-600 dark:text-primary-400" />} title="AI Content Generation">
                Integrated with the Gemini API, the post editor can help you brainstorm ideas, draft paragraphs, or write entire articles from a simple prompt.
            </FeatureCard>
            <FeatureCard icon={<Icon name="chat-bubble-left-right" className="h-6 w-6 text-primary-600 dark:text-primary-400" />} title="Full Post Interaction">
                Engage with content through a full-featured comment system (create, edit, delete) and an upvote/downvote system.
            </FeatureCard>
            <FeatureCard icon={<Icon name="pencil-square" className="h-6 w-6 text-primary-600 dark:text-primary-400" />} title="Content Management">
                Users have complete control over their own posts with the ability to Create, Read, Update, and Delete them through an intuitive dashboard.
            </FeatureCard>
        </div>
      </div>
    </div>
  );
};

export default About;
