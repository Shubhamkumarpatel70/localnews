import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaMapMarkerAlt, FaTag, FaTimes, FaSpinner } from 'react-icons/fa';
import './UploadVideo.css';

const UploadVideo = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding would be implemented here
          setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation('Location unavailable');
          setIsLoading(false);
        }
      );
    } else {
      setLocation('Geolocation not supported');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || !title.trim()) {
      alert('Please select a video and enter a title');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', title);
    formData.append('location', location);
    formData.append('tags', JSON.stringify(tags));

    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert('Video uploaded successfully!');
        navigate('/');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-video">
      <div className="upload-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaTimes />
        </button>
        <h1>Upload Video</h1>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="upload-section">
          <h3>Select Video</h3>
          <div 
            className="video-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {videoPreview ? (
              <div className="video-preview">
                <video src={videoPreview} controls />
                <button 
                  type="button" 
                  className="change-video-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Video
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <FaUpload className="upload-icon" />
                <p>Click or drag video here</p>
                <p className="upload-hint">MP4, MOV, AVI up to 100MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="upload-section">
          <h3>Video Details</h3>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              maxLength={100}
              required
            />
            <span className="char-count">{title.length}/100</span>
          </div>

          <div className="form-group">
            <label>Location</label>
            <div className="location-input">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location or use current location"
              />
              <button
                type="button"
                className="location-btn"
                onClick={getCurrentLocation}
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="spinner" /> : <FaMapMarkerAlt />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags..."
              />
              <button type="button" className="add-tag-btn" onClick={addTag}>
                <FaTag />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag"
                    >
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="upload-btn"
            disabled={!videoFile || !title.trim() || isUploading}
          >
            {isUploading ? (
              <>
                <FaSpinner className="spinner" />
                Uploading...
              </>
            ) : (
              'Upload Video'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideo; 