import React, { useState, useEffect } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import VideoCommentSection from "./VideoCommentSection";
import PopupModal from "./PopupModal";
import LoadingSpinner from "./LoadingSpinner";
import { useNavigate } from "react-router-dom";

export default function NewsCard({
  news,
  onLike = () => {},
  onSave = () => {},
  onShare = () => {},
  onComment = () => {},
  onDelete,
  liked,
  saved,
  likesCount,
  savedCount,
}) {
  const navigate = useNavigate();
  const [commentOpen, setCommentOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(!news);

  useEffect(() => {
    setIsLoading(!news);
  }, [news]);

  const handleOpenComments = () => setCommentOpen(true);
  const handleCloseComments = () => setCommentOpen(false);

  const handleShare = () => {
    const shareUrl = window.location.origin + "/news/" + news._id;
    const shareText = `Check what happened today in your areas only on Local News: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: news.title, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareText);
      setModalMessage("Link copied!");
      setShowConfirmButton(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
      {news.image && (
        <img 
          src={news.image} 
          alt={news.title} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{news.title}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {news.content.slice(0, 100)}
          {news.content.length > 100 ? "..." : ""}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span className="font-medium">
            By {news.author?.username || "Unknown"}
          </span>
          <span>
            {new Date(news.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-4 items-center mb-4">
          <button
            title="Like"
            onClick={onLike}
            className={`flex items-center gap-1 font-semibold transition-colors ${
              liked ? "text-red-600" : "text-gray-600 hover:text-red-600"
            }`}
          >
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}{" "}
            {typeof likesCount === "number"
              ? likesCount
              : Array.isArray(likesCount)
              ? likesCount.length
              : 0}
          </button>
          <button
            title="Save"
            onClick={onSave}
            className={`flex items-center gap-1 font-semibold transition-colors ${
              saved ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}{" "}
            {savedCount > 0 ? savedCount : ""}
          </button>
          <button 
            title="Share" 
            onClick={handleShare}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ShareIcon />
          </button>
          <button 
            title="Comment" 
            onClick={handleOpenComments}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <ChatBubbleOutlineIcon />{" "}
            {Array.isArray(news.comments)
              ? news.comments.length
              : typeof news.comments === "number"
              ? news.comments
              : 0}
          </button>
        </div>
        <button
          className="w-full mt-2 bg-green-700 hover:bg-orange-600 text-white border-none rounded-lg py-2 px-4 font-semibold cursor-pointer transition-colors duration-200"
          onClick={() => navigate(`/post/${news._id}`)}
        >
          View More
        </button>
        {onDelete && (
          <button
            title="Delete"
            className="mt-2 ml-2 bg-red-700 text-white border-none rounded-lg py-2 px-3 font-semibold cursor-pointer hover:bg-red-800 transition-colors"
            onClick={() => {
              setModalMessage("Are you sure you want to delete this news item?");
              setShowConfirmButton(true);
              setConfirmAction(() => async () => {
                setIsDeleting(true);
                try {
                  await onDelete(news._id);
                } catch (e) {
                  console.error("Delete handler error", e);
                  setModalMessage("Failed to delete item");
                  setShowConfirmButton(false);
                } finally {
                  setIsDeleting(false);
                }
              });
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
      <VideoCommentSection
        open={commentOpen}
        onClose={handleCloseComments}
        postId={news._id}
        type="post"
      />
      <PopupModal
        message={modalMessage}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
          setModalMessage(null);
        }}
        onCancel={() => setModalMessage(null)}
        showConfirmButton={showConfirmButton}
      />
    </div>
  );
}
