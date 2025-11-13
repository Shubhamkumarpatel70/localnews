import React, { useRef, useState, useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VideoCommentSection from './VideoCommentSection';
import './VideoCard.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

let userHasInteracted = false;
function setUserInteracted() {
  userHasInteracted = true;
  window.removeEventListener('pointerdown', setUserInteracted, true);
  window.removeEventListener('keydown', setUserInteracted, true);
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', setUserInteracted, true);
  window.addEventListener('keydown', setUserInteracted, true);
}

export default function VideoCard({ video, onLike, onComment, onShare, onSave, isPlaying, setCurrentlyPlayingVideoId, currentlyPlayingVideoId, shortsStyle = false, shortsRatio = '9/14' }) {
  const videoRef = useRef(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);
  const titleMaxLength = 38;
  const isTitleLong = video.title && video.title.length > titleMaxLength;
  const navigate = useNavigate();

  // Only auto-play if user has interacted
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      if (userHasInteracted) {
        videoRef.current.play().catch(() => setShowPlayOverlay(true));
        setShowPlayOverlay(false);
      } else {
        setShowPlayOverlay(true);
      }
    } else if (!isPlaying && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Play or pause on video click
  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        setCurrentlyPlayingVideoId(video._id);
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handlePlay = () => {
    setCurrentlyPlayingVideoId(video._id);
    setShowPlayOverlay(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => setShowPlayOverlay(true));
    }
  };
  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  const handleVideoPlay = () => setCurrentlyPlayingVideoId(video._id);
  const handleVideoPause = () => {
    if (currentlyPlayingVideoId === video._id) {
      setCurrentlyPlayingVideoId(null);
    }
  };

  const handleOpenComments = () => setCommentOpen(true);
  const handleCloseComments = () => setCommentOpen(false);

  // Overlay play button handler
  const handleOverlayPlay = (e) => {
    e.stopPropagation();
    setUserInteracted();
    handlePlay();
  };

  // Follow button handler
  const handleFollow = (e) => {
    e.stopPropagation();
    setIsFollowing(f => !f);
  };

  // Share button handler
  const handleShare = () => {
    const shareUrl = window.location.origin + '/video/' + video._id;
    const shareText = `Check what happened today in your areas only on Local News: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: video.title, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copied!');
    }
  };

  return (
    <div className="video-card">
      {shortsStyle ? (
        <div className="video-card-media-wrapper" style={{ aspectRatio: shortsRatio }}>
          <video
            className="video-card-media"
            ref={videoRef}
            poster={video.thumbnail}
            src={video.url}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            controls={false}
            tabIndex={-1}
            style={{ cursor: 'pointer' }}
            onClick={handleVideoClick}
          />
          {showPlayOverlay && (
            <button className="video-play-overlay-btn" onClick={handleOverlayPlay} tabIndex={0} title="Play">
              <PlayArrowIcon style={{ fontSize: 48 }} />
            </button>
          )}
          {/* Overlay: profile bottom left, actions right, Local News top right, title below profile */}
          <div className="video-card-overlay" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', height: '100%', pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>
            {/* Top right: Local News tag */}
            <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 2, pointerEvents: 'auto' }}>
              <span style={{ background: '#fff', color: '#B71C1C', fontWeight: 700, borderRadius: 12, padding: '6px 18px', fontSize: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', letterSpacing: 0.2, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))' }}>Local News</span>
            </div>
            {/* Actions right: move up, vertically centered */}
            <div className="video-card-overlay-actions-vertical" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'absolute', top: '50%', right: 1, transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 2 }}>
              <button onClick={onLike} className={video.liked ? 'liked' : ''} title="Like" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', marginBottom: 2 }}>
                {video.liked ? <FavoriteIcon style={{ color: '#B71C1C' }} /> : <FavoriteBorderIcon style={{ color: '#222' }} />}
                <div style={{ fontSize: 13, color: '#222', marginTop: 2 }}>{typeof video.likes === 'number' ? video.likes : (Array.isArray(video.likes) ? video.likes.length : 0)}</div>
              </button>
              <button onClick={handleOpenComments} title="Comment" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', marginBottom: 2 }}>
                <ChatBubbleOutlineIcon style={{ color: '#222' }} />
                <div style={{ fontSize: 13, color: '#222', marginTop: 2 }}>{Array.isArray(video.comments) ? video.comments.length : (typeof video.comments === 'number' ? video.comments : 0)}</div>
              </button>
              <button onClick={handleShare} title="Share" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', marginBottom: 2 }}>
                <ShareIcon style={{ color: '#222' }} />
              </button>
              <button onClick={onSave} className={video.saved ? 'saved' : ''} title="Save" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                {video.saved ? <BookmarkIcon style={{ color: '#B71C1C' }} /> : <BookmarkBorderIcon style={{ color: '#222' }} />}
              </button>
            </div>
            {/* Bottom left: profile and title with blurred background, moved lower */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'absolute', left: 16, bottom: 24, maxWidth: 270, borderRadius: 18, backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.32)', padding: '14px 18px 12px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', pointerEvents: 'auto', zIndex: 2 }}>
              <div className="video-card-overlay-profile" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                onClick={() => navigate(`/user/${video.author?.username || 'unknown'}`)}
              >
                <img src={video.author?.avatar} alt={video.author?.username} style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, textShadow: '0 2px 8px rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {video.author?.username || 'Unknown'}
                  {video.author?.verified && <CheckCircleIcon style={{ color: '#2196f3', fontSize: 17, marginLeft: 2 }} />}
                  <button
                    className="video-follow-btn"
                    onClick={e => { e.stopPropagation(); handleFollow(e); }}
                    style={{ marginLeft: 10, background: isFollowing ? '#fff' : 'rgba(33,150,243,0.85)', color: isFollowing ? '#2196f3' : '#fff', border: 'none', borderRadius: 14, padding: '2px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
              {/* Title with more/less toggle and fade-out for truncation */}
              <div className="video-card-overlay-title" style={{ color: '#fff', fontSize: 19, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.7)', marginTop: 10, maxWidth: 240, wordBreak: 'break-word', whiteSpace: showFullTitle ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: showFullTitle ? 'clip' : 'ellipsis', lineHeight: 1.3, display: 'flex', alignItems: 'center', position: 'relative' }}>
                <span style={{ pointerEvents: 'none', flex: 1, position: 'relative' }}>
                  {showFullTitle || !isTitleLong ? video.title : video.title.slice(0, titleMaxLength) + '...'}
                  {!showFullTitle && isTitleLong && (
                    <span style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.7))' }} />
                  )}
                </span>
                {isTitleLong && (
                  <button
                    style={{ marginLeft: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 8, padding: '2px 8px', fontSize: 13, cursor: 'pointer', fontWeight: 500, pointerEvents: 'auto' }}
                    onClick={e => { e.stopPropagation(); setShowFullTitle(f => !f); }}
                  >
                    {showFullTitle ? 'Less' : 'More'}
                  </button>
                )}
              </div>
            </div>
            {/* Bottom gradient overlay for readability */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, borderRadius: '0 0 24px 24px', background: 'linear-gradient(to top, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.0) 100%)', zIndex: 1, pointerEvents: 'none' }} />
          </div>
        </div>
      ) : (
        <video
          className="video-card-media"
          ref={videoRef}
          poster={video.thumbnail}
          src={video.url}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          controls={false}
          tabIndex={-1}
          style={{ cursor: 'pointer', width: '100%', maxHeight: 320, objectFit: 'cover', background: '#000' }}
          onClick={handleVideoClick}
        />
      )}
      <div className="video-card-controls">
        {isPlaying ? (
          <button onClick={handlePause} className="video-play-btn" title="Pause"><PauseIcon /></button>
        ) : (
          <button onClick={handlePlay} className="video-play-btn" title="Play"><PlayArrowIcon /></button>
        )}
      </div>
      {!shortsStyle && (
        <div className="video-card-content">
          <h2>{video.title}</h2>
          <div className="video-card-meta">
            <span className="video-card-author">By {video.author?.username || 'Unknown'}</span>
            <span className="video-card-time">{new Date(video.createdAt).toLocaleString()}</span>
          </div>
          <div className="video-card-actions">
            <button onClick={onLike} className={video.liked ? 'liked' : ''} title="Like">
              {video.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />} {typeof video.likes === 'number' ? video.likes : (Array.isArray(video.likes) ? video.likes.length : 0)}
            </button>
            <button onClick={handleOpenComments} title="Comment">
              <ChatBubbleOutlineIcon /> {Array.isArray(video.comments) ? video.comments.length : (typeof video.comments === 'number' ? video.comments : 0)}
            </button>
            <button onClick={handleShare} title="Share">
              <ShareIcon />
            </button>
            <button onClick={onSave} className={video.saved ? 'saved' : ''} title="Save">
              {video.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </button>
          </div>
        </div>
      )}
      <VideoCommentSection open={commentOpen} onClose={handleCloseComments} postId={video._id} type="video" />
    </div>
  );
} 