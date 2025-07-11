import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PostsProvider } from './context/PostsContext';
import { ToastProvider } from './context/ToastContext';
import { UserProvider, useUser } from './context/UserContext';
import Header from './components/Header';
import PostList from './components/PostList';
import PostEditor from './components/PostEditor';
import PostPreview from './components/PostPreview';
import Auth from './components/Auth';
import Explore from './components/Explore';
import About from './components/About';
import Settings from './components/Settings';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <PostsProvider>
          <MainApp />
        </PostsProvider>
      </UserProvider>
    </ToastProvider>
  );
}

const MainApp: React.FC = () => {
  const { currentUser, checkUserSession } = useUser();

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (!currentUser) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile/:username" element={<UserProfile />} />
          <Route path="/new" element={<PostEditor />} />
          <Route path="/edit/:id" element={<PostEditor />} />
          <Route path="/post/:id" element={<PostPreview />} />
        </Routes>
      </main>
    </div>
  );
};


export default App;