import React, { useState, useEffect } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CommunityPostCard from '../components/CommunityPostCard';
import CreatePostModal from '../components/CreatePostModal';
import { get, post } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Community.css';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch community posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await get('/api/community');
        
        // Transform posts for frontend
        const transformedPosts = response.posts?.map(post => ({
          ...post,
          liked: isAuthenticated ? post.likes?.includes(post.author?._id) : false,
          saved: false // TODO: Implement saved functionality
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
      
      // Update local state
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

  const handleSave = (id) => {
    if (!isAuthenticated) {
      alert('Please login to save posts');
      return;
    }
    setPosts(posts => posts.map(p => p._id === id ? { ...p, saved: !p.saved } : p));
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
        title: content.substring(0, 100), // Use first 100 chars as title
        content: content,
        category: 'general'
      });

      // Add the new post to the beginning of the list
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
    <div className="community-page">
      <div className="community-banner">
        <PeopleIcon fontSize="large" style={{ color: '#B71C1C', marginRight: 8 }} />
        <h1>Community</h1>
        <p>Connect, share, and grow with your local community!</p>
      </div>
      <div className="community-feed-header">
        <button className="community-create-btn" onClick={handleCreateClick}>
          <AddCircleIcon style={{ marginRight: 6 }} /> Create Post
        </button>
      </div>
      <div className="community-feed">
        {loading ? (
          <div className="loading-message">Loading community posts...</div>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : posts.length === 0 ? (
          <div className="empty-message">No community posts yet. Be the first to post!</div>
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
      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreatePost} />
    </div>
  );
} 