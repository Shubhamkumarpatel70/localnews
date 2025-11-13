import React, { useState } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VideoCommentSection from './VideoCommentSection';
import './NewsCard.css';
import { useNavigate } from 'react-router-dom';

export default function NewsCard({ news, onLike = () => {}, onSave = () => {}, onShare = () => {}, onComment = () => {}, liked, saved, likesCount, savedCount }) {
  const navigate = useNavigate();
  const [commentOpen, setCommentOpen] = useState(false);
  const handleOpenComments = () => setCommentOpen(true);
  const handleCloseComments = () => setCommentOpen(false);

  const handleShare = () => {
    const shareUrl = window.location.origin + '/news/' + news._id;
    const shareText = `Check what happened today in your areas only on Local News: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: news.title, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copied!');
    }
  };

  return (
    <div className="news-card">
      {news.image && <img src={news.image} alt={news.title} className="news-image" />}
      <div className="news-content">
        <h2>{news.title}</h2>
        <p className="news-snippet">{news.content.slice(0, 100)}{news.content.length > 100 ? '...' : ''}</p>
        <div className="news-meta">
          <span className="news-author">By {news.author?.username || 'Unknown'}</span>
          <span className="news-time">{new Date(news.createdAt).toLocaleString()}</span>
        </div>
        <div className="news-actions">
          <button title="Like" onClick={onLike} style={{ color: liked ? '#B71C1C' : undefined, fontWeight: 600 }}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />} {typeof likesCount === 'number' ? likesCount : (Array.isArray(likesCount) ? likesCount.length : 0)}
          </button>
          <button title="Save" onClick={onSave} style={{ color: saved ? '#2196f3' : undefined, fontWeight: 600 }}>
            {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />} {savedCount > 0 ? savedCount : ''}
          </button>
          <button title="Share" onClick={handleShare}><ShareIcon /></button>
          <button title="Comment" onClick={handleOpenComments}><ChatBubbleOutlineIcon /> {Array.isArray(news.comments) ? news.comments.length : (typeof news.comments === 'number' ? news.comments : 0)}</button>
        </div>
      </div>
      <button
        style={{ marginTop: 10, background: '#2196f3', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
        onClick={() => navigate(`/post/${news._id}`)}
      >
        View More
      </button>
      <VideoCommentSection open={commentOpen} onClose={handleCloseComments} postId={news._id} type="post" />
    </div>
  );
} 