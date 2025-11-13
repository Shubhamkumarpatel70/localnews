import React, { useState } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoCommentSection from './VideoCommentSection';
import './CommunityPostCard.css';
import { useNavigate } from 'react-router-dom';

export default function CommunityPostCard({ post, onLike, onComment, onShare, onSave, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [commentOpen, setCommentOpen] = useState(false);
  const handleOpenComments = () => setCommentOpen(true);
  const handleCloseComments = () => setCommentOpen(false);

  const handleShare = () => {
    const shareUrl = window.location.origin + '/community/' + post._id;
    const shareText = `Check what happened today in your areas only on Local News: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: post.content, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copied!');
    }
  };

  return (
    <div className="community-post-card">
      <div className="community-post-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src={post.author.avatar}
          alt={post.author.username}
          style={{ width: 36, height: 36, borderRadius: '50%', cursor: 'pointer' }}
          onClick={() => navigate(`/user/${post.author.username}`)}
        />
        <span
          style={{ fontWeight: 600, color: '#222', cursor: 'pointer' }}
          onClick={() => navigate(`/user/${post.author.username}`)}
        >
          {post.author.username}
        </span>
        <div style={{ flex: 1 }}>
          <div className="community-post-time">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {(onEdit || onDelete) && (
          <div className="community-post-actions-admin">
            {onEdit && <button className="edit-btn" onClick={onEdit} title="Edit"><EditIcon /></button>}
            {onDelete && <button className="delete-btn" onClick={onDelete} title="Delete"><DeleteIcon /></button>}
          </div>
        )}
      </div>
      <div className="community-post-content">
        {post.content} {post.edited && <span className="community-post-edited">(edited)</span>}
      </div>
      <div className="community-post-actions">
        <button onClick={onLike} className={post.liked ? 'liked' : ''} title="Like">
          {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />} {typeof post.likes === 'number' ? post.likes : (Array.isArray(post.likes) ? post.likes.length : 0)}
        </button>
        <button onClick={handleOpenComments} title="Comment">
          <ChatBubbleOutlineIcon /> {Array.isArray(post.comments) ? post.comments.length : (typeof post.comments === 'number' ? post.comments : 0)}
        </button>
        <button onClick={handleShare} title="Share">
          <ShareIcon />
        </button>
        <button onClick={onSave} className={post.saved ? 'saved' : ''} title="Save">
          {post.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </button>
      </div>
      <button
        style={{ marginTop: 10, background: '#2196f3', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
        onClick={() => navigate(`/post/${post._id}`)}
      >
        Read More
      </button>
      <VideoCommentSection open={commentOpen} onClose={handleCloseComments} postId={post._id} type="community" />
    </div>
  );
} 