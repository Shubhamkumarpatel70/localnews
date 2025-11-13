import React, { useState, useEffect } from "react";
import AccountMenu from "../components/AccountMenu";
import "./Account.css";
import { useAuth } from "../context/AuthContext";
import NewsCard from "../components/NewsCard";
import { get, del } from "../utils/api";

const sections = {
  profile: "Profile Section (edit your info here)",
  mynews: "My News",
  mycomments: "My Comments Section (your comments)",
  "community-posts": "Community Posts Section (your community posts)",
  saved: "My Saved Section (your saved videos, posts etc.)",
  settings: "Settings Section (preferences, etc.)",
};

function MyNews() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    async function fetchMyNews() {
      setLoading(true);
      try {
        const response = await get("/api/user/news");
        setNewsList(response || []);
      } catch (e) {
        console.error("Failed to load my news", e);
        setNewsList([]);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchMyNews();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
    try {
      await del(`/api/news/${id}`);
      setNewsList((list) => list.filter((n) => n._id !== id));
      alert("News deleted");
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete news: " + (e.message || e));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="card-skeleton"
            style={{ height: 180, borderRadius: 12, background: "#f5f5f5" }}
          />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Please login to view your uploaded news.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {newsList.length === 0 ? (
        <div>You have not uploaded any news yet.</div>
      ) : (
        newsList.map((n) => (
          <NewsCard key={n._id} news={n} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}

function MyComments() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function fetchMyComments() {
      setLoading(true);
      try {
        const response = await get(`/api/user/${user._id}/comments`);
        setComments(response || []);
      } catch (e) {
        console.error("Failed to load my comments", e);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && user) {
      fetchMyComments();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="card-skeleton"
            style={{ height: 120, borderRadius: 12, background: "#f5f5f5" }}
          />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Please login to view your comments.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {comments.length === 0 ? (
        <div>You have not posted any comments yet.</div>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="comment-card">
            <div className="comment-header">
              <div className="comment-meta">
                <span className="comment-type">
                  {comment.news
                    ? "News"
                    : comment.post
                    ? "Post"
                    : comment.communityPost
                    ? "Community"
                    : comment.video
                    ? "Video"
                    : "Unknown"}
                </span>
                <span className="comment-time">
                  {getTimeAgo(comment.createdAt)}
                </span>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MySaved() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    async function fetchSavedItems() {
      setLoading(true);
      try {
        // This would need to be implemented in the backend
        // For now, show empty state
        setSavedItems([]);
      } catch (e) {
        console.error("Failed to load saved items", e);
        setSavedItems([]);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchSavedItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="card-skeleton"
            style={{ height: 180, borderRadius: 12, background: "#f5f5f5" }}
          />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Please login to view your saved items.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {savedItems.length === 0 ? (
        <div>You have not saved any items yet.</div>
      ) : (
        savedItems.map((item) => (
          <div key={item._id} className="saved-item-card">
            {/* Render saved item */}
          </div>
        ))
      )}
    </div>
  );
}

export default function Account() {
  const [open, setOpen] = useState(true);
  const [section, setSection] = useState("profile");

  // Listen for global event to open the drawer
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("openAccountMenu", handler);
    return () => window.removeEventListener("openAccountMenu", handler);
  }, []);

  const handleSelect = (key) => {
    setSection(key);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="account-page">
      <AccountMenu
        open={open}
        onClose={handleClose}
        onSelect={handleSelect}
        selected={section}
      />
      <div className="account-section">
        <h2>
          {sections[section] ? section.replace(/([a-z])([A-Z])/g, "$1 $2") : ""}
        </h2>
        <div className="account-section-content">
          {section === "mynews" ? (
            <MyNews />
          ) : section === "mycomments" ? (
            <MyComments />
          ) : section === "saved" ? (
            <MySaved />
          ) : (
            sections[section] || "Select an option."
          )}
        </div>
      </div>
    </div>
  );
}
