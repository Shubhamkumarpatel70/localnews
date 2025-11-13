import React, { useState } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { get, post as apiPost } from '../utils/api';

export default function VideoCommentSection({ open, onClose, postId, type = 'video', comments: propComments, onLikeComment, onReactComment, onPostComment }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!open || !postId) return;
    setError('');
    setLoading(true);
    let url = '';
    if (type === 'post') url = `/api/comments/${postId}/comments?type=post`;
    else if (type === 'community') url = `/api/comments/${postId}/comments?type=community`;
    else if (type === 'video') url = `/api/comments/${postId}/comments?type=video`;
    else return;
    get(url)
      .then(comments => {
        setComments(comments.map(c => ({
          ...c,
          user: c.author || {},
          likes: 0,
          liked: false,
          reactions: {},
        })));
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load comments.');
        setLoading(false);
      });
  }, [open, postId, type]);

  const handleLike = (id) => {
    if (onLikeComment) return onLikeComment(id);
    setComments(comments => comments.map(c => c._id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c));
  };
  const handleReact = (id, emoji) => {
    if (onReactComment) return onReactComment(id, emoji);
    setComments(comments => comments.map(c => c._id === id ? {
      ...c,
      reactions: { ...c.reactions, [emoji]: (c.reactions[emoji] || 0) + 1 },
    } : c));
  };
  const handlePost = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setPosting(true);
    setError('');
    let commentType = type;
    if (type === 'video') commentType = 'video';
    if (type === 'community') commentType = 'community';
    if (type === 'post') commentType = 'post';
    try {
      await apiPost(`/api/comments/${postId}/comment`, { text: input, type: commentType });
      setInput('');
      // Refresh comments
      let url = `/api/comments/${postId}/comments?type=${commentType}`;
      get(url).then(comments => {
        setComments(comments.map(c => ({
          ...c,
          user: c.author || {},
          likes: 0,
          liked: false,
          reactions: {},
        })));
      });
    } catch (err) {
      setError('Failed to add comment.');
    }
    setPosting(false);
  };

  if (!open) return null;
  return (
    <div className="video-comment-modal" style={{ zIndex: 2000 }}>
      <div className="video-comment-modal-backdrop" onClick={onClose} />
      <div className="video-comment-modal-content" style={{ maxWidth: 420, width: '95vw', borderRadius: 14, padding: 0 }}>
        <button className="video-comment-modal-close" onClick={onClose}>×</button>
        <div className="video-comment-section" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 22, marginBottom: 10 }}>Comments</h3>
          <form className="video-comment-form" onSubmit={handlePost} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={posting}
              maxLength={200}
              style={{ flex: 1, borderRadius: 8, border: '1px solid #ccc', padding: 8, fontSize: 15 }}
            />
            <button type="submit" disabled={posting || !input.trim()} style={{ background: '#B71C1C', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Post</button>
          </form>
          {error && <div style={{ color: '#B71C1C', marginBottom: 8 }}>{error}</div>}
          <div className="video-comment-list" style={{ maxHeight: 260, overflowY: 'auto' }}>
            {loading ? (
              <div className="video-comment-empty">Loading...</div>
            ) : comments.length === 0 ? (
              <div className="video-comment-empty">No comments yet.</div>
            ) : comments.map(c => (
              <div className="video-comment-item" key={c._id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <img src={c.user.avatar} alt={c.user.username} className="video-comment-avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div className="video-comment-body" style={{ flex: 1 }}>
                  <div className="video-comment-header" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span className="video-comment-username" style={{ fontWeight: 600 }}>{c.user.username}</span>
                    <span className="video-comment-time" style={{ color: '#888', fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="video-comment-text" style={{ fontSize: 15 }}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 