import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import PostAddIcon from '@mui/icons-material/PostAdd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ImageIcon from '@mui/icons-material/Image';
import TagIcon from '@mui/icons-material/Tag';

export default function CreatePost() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
          setLoadingLocation(false);
        },
        err => {
          setLocation('');
          setLoadingLocation(false);
        }
      );
    } else {
      setLocation('');
      setLoadingLocation(false);
    }
  }, []);

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImageURLs(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    formData.append('title', title);
    formData.append('content', text);
    formData.append('tags', tags);
    formData.append('location', location);
    
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Post created successfully!');
      navigate('/');
    } catch (err) {
      alert('Failed to create post: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-14 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <PostAddIcon className="text-3xl text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">Create Post</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <ImageIcon className="text-indigo-600" />
                Images
              </label>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              {imageURLs.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-4">
                  {imageURLs.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt="preview" 
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                placeholder="Enter post title"
              />
            </div>
            
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Content</label>
              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)} 
                rows={6} 
                maxLength={500} 
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                placeholder="Write your post content here..."
              />
              <p className="text-sm text-gray-500 mt-1">{text.length}/500</p>
            </div>
            
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <LocationOnIcon className="text-indigo-600" />
                Location
              </label>
              <input 
                type="text" 
                value={loadingLocation ? 'Fetching location...' : location} 
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <TagIcon className="text-indigo-600" />
                Tags (comma separated)
              </label>
              <input 
                type="text" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                placeholder="news, event, sports"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg border-none cursor-pointer transition-all duration-300 shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PostAddIcon />
                  <span>Create Post</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
