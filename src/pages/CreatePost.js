import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/api';
export default function CreatePost() {
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

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
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    formData.append('title', title);
    formData.append('content', text);
    formData.append('tags', tags);
    formData.append('location', location);
    // Optionally add category if needed
    // formData.append('category', 'news');
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
      // Optionally redirect to home
      window.location.href = '/';
    } catch (err) {
      alert('Failed to create post: ' + err.message);
    }
  };

  return (
    <div style={{padding: '1.5rem', paddingBottom: '70px', maxWidth: 420, margin: '0 auto'}}>
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Images</label><br />
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          {imageURLs.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {imageURLs.map((url, i) => (
                <img key={i} src={url} alt="preview" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, background: '#eee' }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Title</label><br />
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Text</label><br />
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={500} required style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Location</label><br />
          <input type="text" value={loadingLocation ? 'Fetching location...' : location} readOnly style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc', background: '#f5f5f5' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Tags (comma separated)</label><br />
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="news, event, sports" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: '#2196f3', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>Create Post</button>
      </form>
    </div>
  );
} 