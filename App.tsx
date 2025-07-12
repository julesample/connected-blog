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
        <PostsProvider
           apiKey='bbf7tkn7ioraaze412j5m51on50pdoqnzrknvu5x4j0xf2kt'
      init={{
        plugins: [
          // Core editing features
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
          // Your account includes a free trial of TinyMCE premium features
          // Try the most popular premium features until Jul 26, 2025:
          'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
        ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
      }}>
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