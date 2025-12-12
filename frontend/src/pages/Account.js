import React, { useState, useEffect } from "react";
import AccountMenu from "../components/AccountMenu";
import { useAuth } from "../context/AuthContext";
import NewsCard from "../components/NewsCard";
import { get, del } from "../utils/api";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const sections = {
  profile: "Profile",
  mynews: "My News",
  mycomments: "My Comments",
  "community-posts": "Community Posts",
  saved: "My Saved",
  settings: "Settings",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-gray-600">
        Please login to view your uploaded news.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {newsList.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500">
          <p className="text-lg">You have not uploaded any news yet.</p>
        </div>
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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-gray-600">
        Please login to view your comments.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">You have not posted any comments yet.</p>
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
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
                <span className="text-xs text-gray-500">
                  {getTimeAgo(comment.createdAt)}
                </span>
              </div>
            </div>
            <div className="text-gray-800">{comment.content}</div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-gray-600">
        Please login to view your saved items.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">You have not saved any items yet.</p>
        </div>
      ) : (
        savedItems.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-md p-6">
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
    <div className="pt-14 pb-20 min-h-screen bg-gray-50">
      <AccountMenu
        open={open}
        onClose={handleClose}
        onSelect={handleSelect}
        selected={section}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <AccountCircleIcon className="text-4xl text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {sections[section] || "Account"}
            </h2>
          </div>
          <div className="mt-6">
            {section === "mynews" ? (
              <MyNews />
            ) : section === "mycomments" ? (
              <MyComments />
            ) : section === "saved" ? (
              <MySaved />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">{sections[section] || "Select an option."}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
