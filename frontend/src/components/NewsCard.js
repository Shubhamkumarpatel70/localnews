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
import "./NewsCard.css";
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
    <div className="news-card">
      {news.image && (
        <img src={news.image} alt={news.title} className="news-image" />
      )}
      <div className="news-content">
        <h2>{news.title}</h2>
        <p className="news-snippet">
          {news.content.slice(0, 100)}
          {news.content.length > 100 ? "..." : ""}
        </p>
        <div className="news-meta">
          <span className="news-author">
            By {news.author?.username || "Unknown"}
          </span>
          <span className="news-time">
            {new Date(news.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="news-actions">
          <button
            title="Like"
            onClick={onLike}
            style={{ color: liked ? "#B71C1C" : undefined, fontWeight: 600 }}
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
            style={{ color: saved ? "#2196f3" : undefined, fontWeight: 600 }}
          >
            {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}{" "}
            {savedCount > 0 ? savedCount : ""}
          </button>
          <button title="Share" onClick={handleShare}>
            <ShareIcon />
          </button>
          <button title="Comment" onClick={handleOpenComments}>
            <ChatBubbleOutlineIcon />{" "}
            {Array.isArray(news.comments)
              ? news.comments.length
              : typeof news.comments === "number"
              ? news.comments
              : 0}
          </button>
        </div>
      </div>
      <button
        style={{
          marginTop: 10,
          background: "#166534",
          color: "#FEF7ED",
          border: "none",
          borderRadius: 8,
          padding: "8px 18px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.target.style.background = "#C2410C")}
        onMouseOut={(e) => (e.target.style.background = "#166534")}
        onClick={() => navigate(`/post/${news._id}`)}
      >
        View More
      </button>
      {onDelete && (
        <button
          title="Delete"
          style={{
            marginTop: 10,
            marginLeft: 8,
            background: "#B91C1C",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
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
