import React, { useState, useEffect } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CommunityPostCard from '../components/CommunityPostCard';
import CreatePostModal from '../components/CreatePostModal';
import { get, post } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await get('/api/community');
        
        const transformedPosts = response.posts?.map(post => ({
          ...post,
          liked: isAuthenticated ? post.likes?.includes(user?._id) : false,
          saved: isAuthenticated && user ? post.savedBy?.includes(user._id) : false
        })) || [];
        
        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching community posts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthenticated]);

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      return;
    }

    try {
      const response = await post(`/api/community/${id}/like`, {});
      setPosts(posts => posts.map(post => 
        post._id === id 
          ? { ...post, liked: response.liked, likes: response.likesCount }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post');
    }
  };

  const handleSave = async (id) => {
    if (!isAuthenticated) {
      alert('Please login to save posts');
      return;
    }
    try {
      const endpoint = `/api/community/${id}/save`;
      const response = await post(endpoint, {});
      setPosts(posts => posts.map(post => 
        post._id === id 
          ? { ...post, saved: response.saved, savedCount: response.savedCount }
          : post
      ));
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/community/${id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Check out this community post',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleComment = (id) => {
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }
    alert('Comment functionality coming soon!');
  };

  const handleCreatePost = async (content) => {
    if (!isAuthenticated) {
      alert('Please login to create posts');
      return;
    }

    try {
      const newPost = await post('/api/community', {
        title: content.substring(0, 100),
        content: content,
        category: 'general'
      });

      setPosts(prevPosts => [newPost, ...prevPosts]);
      setCreateOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      alert('Please login to create posts');
      return;
    }
    setCreateOpen(true);
  };

  return (
    <div className="pt-14 pb-20 px-4 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-b-3xl p-8 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <PeopleIcon className="text-4xl" />
          <h1 className="text-3xl font-bold">Community</h1>
        </div>
        <p className="text-blue-100">Connect, share, and grow with your local community!</p>
      </div>
      
      <div className="mb-6 flex justify-end">
        <button
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors duration-200"
          onClick={handleCreateClick}
        >
          <AddCircleIcon />
          Create Post
        </button>
      </div>
      
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading community posts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            <p className="font-semibold">Error loading posts</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <PeopleIcon className="text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No community posts yet</p>
            <p className="text-gray-500 mb-6">Be the first to share something with the community!</p>
            {isAuthenticated && (
              <button
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors duration-200"
                onClick={handleCreateClick}
              >
                <AddCircleIcon />
                Create First Post
              </button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <CommunityPostCard
              key={post._id}
              post={post}
              onLike={() => handleLike(post._id)}
              onSave={() => handleSave(post._id)}
              onShare={() => handleShare(post._id)}
              onComment={() => handleComment(post._id)}
            />
          ))
        )}
      </div>
      
      <CreatePostModal 
        open={createOpen} 
        onClose={() => setCreateOpen(false)} 
        onCreate={handleCreatePost} 
      />
    </div>
  );
}
