import React, { useState, useEffect } from "react";
import { get, post } from "../utils/api";
import "./CommentModal.css";

const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

const CommentModal = ({
  isOpen,
  onClose,
  postId,
  postType,
  onCommentSubmit,
}) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await get(
        `/api/comments/${postId}/comments?type=${postType}`
      );
      setComments(response || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await post(`/api/comments/${postId}/comment`, {
        text: comment,
        type: postType,
      });

      const newComment = {
        _id: response._id,
        content: comment,
        author: response.author,
        createdAt: response.createdAt,
      };

      setComments((prev) => [...prev, newComment]);
      setComment("");
      onCommentSubmit && onCommentSubmit(newComment);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>Comments</h3>
          <button className="comment-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="comment-modal-body">
          {loading ? (
            <div className="comment-loading">Loading comments...</div>
          ) : (
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="no-comments">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <img
                          src={comment.author?.avatar || "/default-avatar.png"}
                          alt={comment.author?.username || "Anonymous"}
                          className="comment-author-avatar"
                        />
                        <div className="comment-author-details">
                          <div className="comment-author">
                            {comment.author?.username || "Anonymous"}
                          </div>
                          <div className="comment-date">
                            {getTimeAgo(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="comment-text">{comment.content}</div>
                  </div>
                ))
              )}
            </div>
          )}

          <form className="comment-form" onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              maxLength={500}
            />
            <div className="comment-form-actions">
              <span className="comment-char-count">{comment.length}/500</span>
              <button type="submit" disabled={!comment.trim()}>
                Post Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
