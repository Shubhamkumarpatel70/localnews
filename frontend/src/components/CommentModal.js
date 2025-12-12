import React, { useState, useEffect } from "react";
import { get, post } from "../utils/api";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ChatBubbleIcon className="text-indigo-600" />
            <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading comments...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ChatBubbleIcon className="text-6xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No comments yet</p>
                  <p className="text-sm mt-2">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={comment.author?.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E"}
                        alt={comment.author?.username || "Anonymous"}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">
                          {comment.author?.username || "Anonymous"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTimeAgo(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-800 ml-13">{comment.content}</div>
                  </div>
                ))
              )}
            </div>
          )}

          <form className="mt-6 pt-6 border-t border-gray-200" onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{comment.length}/500</span>
              <button
                type="submit"
                disabled={!comment.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
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
