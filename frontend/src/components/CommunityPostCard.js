import React, { useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoCommentSection from "./VideoCommentSection";
import { useNavigate } from "react-router-dom";

export default function CommunityPostCard({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const [commentOpen, setCommentOpen] = useState(false);
  const handleOpenComments = () => setCommentOpen(true);
  const handleCloseComments = () => setCommentOpen(false);

  const handleShare = () => {
    const shareUrl = window.location.origin + "/community/" + post._id;
    const shareText = `Check what happened today in your areas only on Local News: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: post.content, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Link copied!");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={post.author?.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E"}
          alt={post.author?.username}
          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-200"
          onClick={() => navigate(`/user/${post.author?.username}`)}
        />
        <div className="flex-1 min-w-0">
          <span
            className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => navigate(`/user/${post.author?.username}`)}
          >
            {post.author?.username}
          </span>
          <div className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                onClick={onEdit}
                title="Edit"
              >
                <EditIcon />
              </button>
            )}
            {onDelete && (
              <button
                className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                onClick={onDelete}
                title="Delete"
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="text-gray-800 mb-4 leading-relaxed">
        {post.content}{" "}
        {post.edited && (
          <span className="text-xs text-gray-500 italic">(edited)</span>
        )}
      </div>
      
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <button
          onClick={onLike}
          className={`flex items-center gap-1 font-semibold transition-colors ${
            post.liked ? "text-red-600" : "text-gray-600 hover:text-red-600"
          }`}
          title="Like"
        >
          {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}{" "}
          {typeof post.likes === "number"
            ? post.likes
            : Array.isArray(post.likes)
            ? post.likes.length
            : 0}
        </button>
        <button
          onClick={handleOpenComments}
          className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-semibold transition-colors"
          title="Comment"
        >
          <ChatBubbleOutlineIcon />{" "}
          {Array.isArray(post.comments)
            ? post.comments.length
            : typeof post.comments === "number"
            ? post.comments
            : 0}
        </button>
        <button
          onClick={handleShare}
          className="text-gray-600 hover:text-indigo-600 transition-colors"
          title="Share"
        >
          <ShareIcon />
        </button>
        <button
          onClick={onSave}
          className={`transition-colors ${
            post.saved ? "text-indigo-600" : "text-gray-600 hover:text-indigo-600"
          }`}
          title="Save"
        >
          {post.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </button>
      </div>
      
      <button
        className="w-full py-2 bg-green-700 hover:bg-orange-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-colors duration-200"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        Read More
      </button>
      
      <VideoCommentSection
        open={commentOpen}
        onClose={handleCloseComments}
        postId={post._id}
        type="community"
      />
    </div>
  );
}
