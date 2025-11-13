import React, { useState, useEffect } from 'react';

export default function CreateUpload() {
  const [video, setVideo] = useState(null);
  const [videoURL, setVideoURL] = useState('');
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

  const handleVideoChange = e => {
    const file = e.target.files[0];
    setVideo(file);
    if (file) {
      setVideoURL(URL.createObjectURL(file));
    } else {
      setVideoURL('');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    // For now, just log the values
    console.log({ video, title, location, tags: tags.split(',').map(t => t.trim()) });
    alert('Video upload submitted! (Check console for values)');
  };

  return (
    <div style={{padding: '1.5rem', paddingBottom: '70px', maxWidth: 420, margin: '0 auto'}}>
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Video File</label><br />
          <input type="file" accept="video/*" onChange={handleVideoChange} required />
          {videoURL && (
            <video src={videoURL} controls style={{ width: '100%', marginTop: 10, borderRadius: 12, background: '#000' }} />
          )}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Title</label><br />
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Location</label><br />
          <input type="text" value={loadingLocation ? 'Fetching location...' : location} readOnly style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc', background: '#f5f5f5' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Tags (comma separated)</label><br />
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="news, event, sports" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: '#2196f3', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>Upload Video</button>
      </form>
    </div>
  );
} 