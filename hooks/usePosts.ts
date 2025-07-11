import { usePostsContext } from '../context/PostsContext';

export const usePosts = () => {
  const { allPosts, isLoading, vote } = usePostsContext();
  
  return {
    posts: allPosts,
    loading: isLoading,
    error: null,
    voteOnPost: vote
  };
};