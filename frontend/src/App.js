import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import Home from "./pages/Home";
import Trending from "./pages/Trending";
import Create from "./pages/Create";
import Notifications from "./pages/Notifications";
import BottomNav from "./components/BottomNav";
import Navbar from "./components/Navbar";
import CreateModal from "./components/CreateModal";
import AccountMenu from "./components/AccountMenu";
import Community from "./pages/Community";
import CommunityPostCard from "./components/CommunityPostCard";
import CreatePostModal from "./components/CreatePostModal";
import CreateUpload from "./pages/CreateUpload";
import CreatePost from "./pages/CreatePost";
import CreateLive from "./pages/CreateLive";
import UploadVideo from "./pages/UploadVideo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { get, post as apiPost, post, put, del } from "./utils/api";

function ProfileSection() {
  const { user, isAuthenticated } = useAuth();
  const [followers, setFollowers] = React.useState([]);
  const [following, setFollowing] = React.useState([]);
  const [posts, setPosts] = React.useState([]);
  const [verificationStatus, setVerificationStatus] = React.useState("none"); // 'none', 'pending', 'approved'

  React.useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    get(`/api/user/${user._id}/followers`)
      .then(setFollowers)
      .catch(() => setFollowers([]));
    get(`/api/user/${user._id}/following`)
      .then(setFollowing)
      .catch(() => setFollowing([]));
    get(`/api/posts?author=${encodeURIComponent(user.username)}`)
      .then((res) => setPosts(res.posts || []))
      .catch(() => setPosts([]));
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div
        className="account-section"
        style={{ maxWidth: 420, margin: "0 auto", padding: "2rem 1rem" }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: "2rem 1.5rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#B71C1C", marginBottom: "1rem" }}>
            Please Login
          </h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            You need to be logged in to view your profile.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            style={{
              background: "#B71C1C",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const userData = {
    avatar: user?.avatar || "https://randomuser.me/api/portraits/men/99.jpg",
    username: user?.username || "User",
    followers: followers.length,
    following: following.length,
    posts: posts.length,
    live: 1, // TODO: Fetch from backend if needed
    communityPosts: 7, // TODO: Fetch from backend if needed
    verified: verificationStatus === "approved",
  };

  return (
    <div
      className="account-section"
      style={{ maxWidth: 420, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            width: "100%",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <img
            src={userData.avatar}
            alt={userData.username}
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              border: "3px solid #2196f3",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: "#222",
              wordBreak: "break-all",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {userData.username}
            {userData.verified && (
              <span
                title="Verified"
                style={{ display: "flex", alignItems: "center", marginLeft: 4 }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #3797f0 0%, #4ab3f4 100%)",
                    boxShadow: "0 1px 4px rgba(55,151,240,0.18)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="6.5" cy="6.5" r="6.5" fill="none" />
                    <path
                      d="M4 7.5L6 9.5L9 5.5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, margin: "12px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {userData.followers}
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>Followers</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {userData.following}
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>Following</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, margin: "10px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {userData.posts}
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>Posts</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{userData.live}</div>
            <div style={{ fontSize: 13, color: "#888" }}>Live</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {userData.communityPosts}
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>Community</div>
          </div>
        </div>
        {userData.posts >= 50 && verificationStatus === "none" && (
          <button
            onClick={() => setVerificationStatus("pending")}
            style={{
              marginTop: 16,
              background: "#2196f3",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 22px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(33,150,243,0.10)",
            }}
          >
            Apply for Verification Badge
          </button>
        )}
        {verificationStatus === "pending" && (
          <div
            style={{
              marginTop: 14,
              color: "#3797f0",
              fontWeight: 600,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3797f0 0%, #4ab3f4 100%)",
                marginRight: 2,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="6.5" cy="6.5" r="6.5" fill="none" />
                <path
                  d="M4 7.5L6 9.5L9 5.5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Verification status: Pending Approval
          </div>
        )}
        {verificationStatus === "approved" && (
          <div
            style={{
              marginTop: 14,
              color: "#3797f0",
              fontWeight: 600,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3797f0 0%, #4ab3f4 100%)",
                marginRight: 2,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="6.5" cy="6.5" r="6.5" fill="none" />
                <path
                  d="M4 7.5L6 9.5L9 5.5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Verification status: Approved
          </div>
        )}
        {/* For demo: button to approve instantly */}
        {verificationStatus === "pending" && (
          <button
            onClick={() => setVerificationStatus("approved")}
            style={{
              marginTop: 10,
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "7px 18px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Approve (Demo)
          </button>
        )}
      </div>
    </div>
  );
}
function MyNewsSection() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = React.useState([]);
  const [videos, setVideos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editVideo, setEditVideo] = React.useState(null);
  const [editPost, setEditPost] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    title: "",
    description: "",
    location: "",
    tags: "",
    isPublished: true,
  });

  React.useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    setLoading(true);
    Promise.all([
      get(`/api/posts?author=${encodeURIComponent(user.username)}`).catch(() => ({ posts: [] })),
      get(`/api/videos?uploadedBy=${user._id}`).catch(() => ({ videos: [] })),
    ]).then(([postsRes, videosRes]) => {
      setPosts(postsRes.posts || []);
      setVideos(videosRes.videos || []);
      setLoading(false);
    });
  }, [isAuthenticated, user]);

  const handleEditVideo = (video) => {
    setEditVideo(video);
    setEditForm({
      title: video.title || "",
      description: video.description || "",
      location: video.location || "",
      tags: Array.isArray(video.tags) ? video.tags.join(", ") : "",
      isPublished: video.isPublished !== undefined ? video.isPublished : true,
    });
  };

  const handleSaveVideo = async () => {
    if (!editVideo) return;
    try {
      const tagsArray = editForm.tags
        ? editForm.tags.split(",").map((t) => t.trim()).filter((t) => t)
        : [];
      
      const response = await put(`/api/videos/${editVideo._id}`, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        tags: tagsArray,
        isPublished: editForm.isPublished,
      });

      setVideos((videos) =>
        videos.map((v) => (v._id === editVideo._id ? response : v))
      );
      setEditVideo(null);
      alert("Video updated successfully!");
    } catch (error) {
      console.error("Error updating video:", error);
      alert("Failed to update video");
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await del(`/api/videos/${id}`);
      setVideos((videos) => videos.filter((v) => v._id !== id));
      alert("Video deleted successfully!");
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  const handleEditPost = (post) => {
    setEditPost(post);
    setEditForm({
      title: post.title || "",
      description: post.content || "",
      location: post.location || "",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      isPublished: post.isPublished !== undefined ? post.isPublished : true,
    });
  };

  const handleSavePost = async () => {
    if (!editPost) return;
    try {
      const tagsArray = editForm.tags
        ? editForm.tags.split(",").map((t) => t.trim()).filter((t) => t)
        : [];
      
      const response = await put(`/api/posts/${editPost._id}`, {
        title: editForm.title,
        content: editForm.description,
        location: editForm.location,
        tags: tagsArray,
        isPublished: editForm.isPublished,
      });

      setPosts((posts) =>
        posts.map((p) => (p._id === editPost._id ? response : p))
      );
      setEditPost(null);
      alert("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await del(`/api/posts/${id}`);
      setPosts((posts) => posts.filter((p) => p._id !== id));
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const allContent = [
    ...posts.map((p) => ({ ...p, contentType: "post" })),
    ...videos.map((v) => ({ ...v, contentType: "video" })),
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.uploadDate);
    const dateB = new Date(b.createdAt || b.uploadDate);
    return dateB - dateA;
  });

  return (
    <div
      className="account-section"
      style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "1.5rem",
        minHeight: "calc(100vh - 140px)"
      }}
    >
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.75rem", fontWeight: 700 }}>
        My Content
      </h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p style={{ color: "#888" }}>Loading your content...</p>
        </div>
      ) : allContent.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem", 
          color: "#888",
          background: "#f9f9f9",
          borderRadius: "12px"
        }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No content uploaded yet.</p>
          <p style={{ fontSize: "0.9rem" }}>Start creating posts and videos!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {allContent.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
              }}
            >
              {/* Thumbnail/Image */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
                {item.images && item.images.length > 0 && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {item.contentType === "video" && !item.thumbnail && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    height: "100%",
                    color: "#fff",
                    fontSize: "3rem"
                  }}>
                    ▶
                  </div>
                )}
                {/* Type badge */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  background: item.contentType === "video" ? "#ff0000" : "#2196f3",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}>
                  {item.contentType}
                </div>
                {/* Action buttons */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  display: "flex",
                  gap: "0.5rem"
                }}>
                  <button
                    onClick={() => item.contentType === "video" ? handleEditVideo(item) : handleEditPost(item)}
                    style={{
                      background: "rgba(33, 150, 243, 0.9)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "18px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => item.contentType === "video" ? handleDeleteVideo(item._id) : handleDeletePost(item._id)}
                    style={{
                      background: "rgba(211, 47, 47, 0.9)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "18px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                    color: "#222",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: "1.4",
                    minHeight: "2.8rem"
                  }}
                  title={item.title}
                >
                  {item.title}
                </div>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: "#666",
                  marginBottom: "0.75rem"
                }}>
                  {new Date(item.createdAt || item.uploadDate).toLocaleDateString()}
                </div>
                <div style={{ 
                  display: "flex", 
                  gap: "1rem", 
                  fontSize: "0.875rem",
                  color: "#888"
                }}>
                  <span>👁️ {item.views || 0}</span>
                  <span style={{ color: "#d90429" }}>
                    ❤️ {typeof item.likes === "number" ? item.likes : (Array.isArray(item.likes) ? item.likes.length : 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Video Modal */}
      {editVideo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={() => setEditVideo(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 700 }}>
              Edit Video
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                  placeholder="Video title"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "100px",
                    resize: "vertical"
                  }}
                  placeholder="Video description"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                  placeholder="Location"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                />
                <label htmlFor="isPublished" style={{ fontWeight: 600 }}>
                  Published
                </label>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  onClick={handleSaveVideo}
                  disabled={!editForm.title.trim()}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#2196f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: editForm.title.trim() ? "pointer" : "not-allowed",
                    opacity: editForm.title.trim() ? 1 : 0.6
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditVideo(null)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#f0f0f0",
                    color: "#333",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editPost && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={() => setEditPost(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 700 }}>
              Edit Post
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                  placeholder="Post title"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Content *
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "150px",
                    resize: "vertical"
                  }}
                  placeholder="Post content"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                  placeholder="Location"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="isPublishedPost"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                />
                <label htmlFor="isPublishedPost" style={{ fontWeight: 600 }}>
                  Published
                </label>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  onClick={handleSavePost}
                  disabled={!editForm.title.trim() || !editForm.description.trim()}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#2196f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: (editForm.title.trim() && editForm.description.trim()) ? "pointer" : "not-allowed",
                    opacity: (editForm.title.trim() && editForm.description.trim()) ? 1 : 0.6
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditPost(null)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#f0f0f0",
                    color: "#333",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function MyCommentsSection() {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = React.useState([]);
  React.useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    get(`/api/user/${user._id}/comments`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [isAuthenticated, user]);
  const [editId, setEditId] = React.useState(null);
  const [editText, setEditText] = React.useState("");

  const handleEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };
  const handleEditSave = (id) => {
    setComments((comments) =>
      comments.map((c) => (c._id === id ? { ...c, content: editText } : c))
    );
    setEditId(null);
    setEditText("");
  };
  const handleDelete = (id) => {
    setComments((comments) => comments.filter((c) => c._id !== id));
  };

  return (
    <div
      className="account-section"
      style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <h2 style={{ marginBottom: 18 }}>My Comments</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {comments.map((comment) => (
          <div
            key={comment._id}
            style={{
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {editId === comment._id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    padding: 6,
                    fontSize: 15,
                  }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button
                    onClick={() => handleEditSave(comment._id)}
                    style={{
                      background: "#2196f3",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "4px 14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    style={{
                      background: "#eee",
                      color: "#333",
                      border: "none",
                      borderRadius: 8,
                      padding: "4px 14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 15, color: "#222", marginBottom: 2 }}>
                  {comment.content}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                  {comment.createdAt
                    ? new Date(comment.createdAt).toLocaleDateString()
                    : ""}
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>
                  {comment.post && comment.post.title && (
                    <span>
                      On Post: <b>{comment.post.title}</b>
                    </span>
                  )}
                  {comment.news && comment.news.title && (
                    <span>
                      On News: <b>{comment.news.title}</b>
                    </span>
                  )}
                  {comment.communityPost && comment.communityPost.title && (
                    <span>
                      On Community: <b>{comment.communityPost.title}</b>
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => handleEdit(comment._id, comment.content)}
                    style={{
                      background: "#2196f3",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "3px 12px",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment._id)}
                    style={{
                      background: "#B71C1C",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "3px 12px",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            No comments yet.
          </div>
        )}
      </div>
    </div>
  );
}
function SavedSection() {
  const { isAuthenticated } = useAuth();
  const [savedPosts, setSavedPosts] = React.useState([]);
  const [savedNews, setSavedNews] = React.useState([]);
  const [savedVideos, setSavedVideos] = React.useState([]);
  const [savedCommunity, setSavedCommunity] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([
      get("/api/posts/saved").catch(() => []),
      get("/api/news/saved").catch(() => []),
      get("/api/videos/saved").catch(() => []),
      get("/api/community/saved").catch(() => []),
    ]).then(([posts, news, videos, community]) => {
      setSavedPosts(posts || []);
      setSavedNews(news || []);
      setSavedVideos(videos || []);
      setSavedCommunity(community || []);
      setLoading(false);
    });
  }, [isAuthenticated]);

  const handleRemovePost = (id) => {
    setSavedPosts((items) => items.filter((item) => item._id !== id));
  };
  const handleRemoveNews = (id) => {
    setSavedNews((items) => items.filter((item) => item._id !== id));
  };
  const handleRemoveVideo = (id) => {
    setSavedVideos((items) => items.filter((item) => item._id !== id));
  };
  const handleRemoveCommunity = (id) => {
    setSavedCommunity((items) => items.filter((item) => item._id !== id));
  };

  const allSaved = [
    ...savedPosts.map((item) => ({ ...item, type: "post" })),
    ...savedNews.map((item) => ({ ...item, type: "news" })),
    ...savedVideos.map((item) => ({ ...item, type: "video" })),
    ...savedCommunity.map((item) => ({ ...item, type: "community" })),
  ].sort((a, b) => new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate));

  const filteredSaved = filter === "all" 
    ? allSaved 
    : allSaved.filter(item => item.type === filter);

  return (
    <div
      className="account-section"
      style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "1rem",
        minHeight: "calc(100vh - 140px)"
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 700 }}>My Saved Content</h2>
        
        {/* Filter buttons */}
        <div style={{ 
          display: "flex", 
          gap: "0.5rem", 
          flexWrap: "wrap",
          marginBottom: "1rem"
        }}>
          {["all", "post", "video", "news", "community"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                border: "none",
                background: filter === type ? "#B71C1C" : "#f0f0f0",
                color: filter === type ? "#fff" : "#333",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          Loading saved content...
        </div>
      ) : filteredSaved.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem", 
          color: "#888",
          background: "#f9f9f9",
          borderRadius: "12px"
        }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No saved {filter === "all" ? "content" : filter} yet.</p>
          <p style={{ fontSize: "0.9rem" }}>Start saving content you like!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredSaved.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Image/Thumbnail */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
                {item.images && item.images.length > 0 && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {item.type === "video" && !item.thumbnail && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    height: "100%",
                    color: "#fff",
                    fontSize: "3rem"
                  }}>
                    ▶
                  </div>
                )}
                {/* Type badge */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}>
                  {item.type}
                </div>
              </div>
              
              <div
                style={{
                  padding: "1rem",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                    color: "#222",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: "1.4",
                    minHeight: "2.8rem"
                  }}
                  title={item.title}
                >
                  {item.title}
                </div>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: "#666",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  {item.author?.username && (
                    <span>By {item.author.username}</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    onClick={() => {
                      const endpoint = item.type === "post" 
                        ? `/api/posts/${item._id}/unsave`
                        : item.type === "video"
                        ? `/api/videos/${item._id}/save`
                        : item.type === "news"
                        ? `/api/news/${item._id}/save`
                        : `/api/community/${item._id}/save`;
                      post(endpoint, {}).then(() => {
                        if (item.type === "post") handleRemovePost(item._id);
                        else if (item.type === "news") handleRemoveNews(item._id);
                        else if (item.type === "video") handleRemoveVideo(item._id);
                        else setSavedCommunity(prev => prev.filter(p => p._id !== item._id));
                      });
                    }}
                    style={{
                      flex: 1,
                      background: "#f0f0f0",
                      color: "#333",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#e0e0e0"}
                    onMouseLeave={(e) => e.target.style.background = "#f0f0f0"}
                  >
                    Unsave
                  </button>
                  <button
                    onClick={() => {
                      const url = item.type === "video" 
                        ? `/video/${item._id}`
                        : `/post/${item._id}`;
                      window.location.href = url;
                    }}
                    style={{
                      flex: 1,
                      background: "#B71C1C",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#8B0000"}
                    onMouseLeave={(e) => e.target.style.background = "#B71C1C"}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function SettingsSection() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [privacy, setPrivacy] = React.useState(false);
  const [language, setLanguage] = React.useState("en");
  const [theme, setTheme] = React.useState("default");
  const [contentPrefs, setContentPrefs] = React.useState({
    sensitive: false,
    categories: [],
  });
  const [pushLikes, setPushLikes] = React.useState(true);
  const [pushComments, setPushComments] = React.useState(true);
  const [pushFollows, setPushFollows] = React.useState(true);
  const [emailDigest, setEmailDigest] = React.useState(false);
  const [emailNewsletter, setEmailNewsletter] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [showBlocked, setShowBlocked] = React.useState(false);
  const [showSessions, setShowSessions] = React.useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [show2FA, setShow2FA] = React.useState(false);
  const [verificationStatus, setVerificationStatus] = React.useState("none");
  // Mock blocked users and sessions
  const blockedUsers = ["spammer1", "troll2"];
  const sessions = [
    { device: "iPhone 14", location: "Gurugram", lastActive: "2h ago" },
    { device: "Chrome on Windows", location: "Delhi", lastActive: "now" },
  ];
  return (
    <div
      className="account-section"
      style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <h2 style={{ marginBottom: 18 }}>Settings</h2>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          padding: "1.5rem 1.2rem",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* Account Management */}
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
          Account
        </div>
        <button
          onClick={() => setShowEditProfile(true)}
          style={{
            background: "#2196f3",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Edit Profile
        </button>
        <button
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Manage Email/Phone
        </button>
        <button
          onClick={() => setShow2FA(true)}
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Two-Factor Authentication
        </button>
        <button
          onClick={() => setShowDelete(true)}
          style={{
            background: "#B71C1C",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Delete Account
        </button>
        {/* Privacy & Security */}
        <div style={{ fontWeight: 600, fontSize: 15, margin: "10px 0 2px 0" }}>
          Privacy & Security
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
          />
          <span>Private Profile</span>
        </label>
        <button
          onClick={() => setShowBlocked((b) => !b)}
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Blocked Users
        </button>
        {showBlocked && (
          <div style={{ margin: "6px 0 10px 0", fontSize: 14, color: "#888" }}>
            {blockedUsers.length === 0
              ? "No blocked users."
              : blockedUsers.join(", ")}
          </div>
        )}
        <button
          onClick={() => setShowSessions((b) => !b)}
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Session Management
        </button>
        {showSessions && (
          <div style={{ margin: "6px 0 10px 0", fontSize: 14, color: "#888" }}>
            {sessions.map((s, i) => (
              <div key={i}>
                {s.device} ({s.location}) - {s.lastActive}
              </div>
            ))}
          </div>
        )}
        {/* App Preferences */}
        <div style={{ fontWeight: 600, fontSize: 15, margin: "10px 0 2px 0" }}>
          App Preferences
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <span>Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              borderRadius: 6,
              padding: "3px 10px",
              border: "1px solid #ccc",
            }}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <span>Theme</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              borderRadius: 6,
              padding: "3px 10px",
              border: "1px solid #ccc",
            }}
          >
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={contentPrefs.sensitive}
            onChange={(e) =>
              setContentPrefs((p) => ({ ...p, sensitive: e.target.checked }))
            }
          />
          <span>Hide Sensitive Content</span>
        </label>
        {/* Notification Preferences */}
        <div style={{ fontWeight: 600, fontSize: 15, margin: "10px 0 2px 0" }}>
          Notifications
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={pushLikes}
            onChange={(e) => setPushLikes(e.target.checked)}
          />
          <span>Push: Likes</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={pushComments}
            onChange={(e) => setPushComments(e.target.checked)}
          />
          <span>Push: Comments</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={pushFollows}
            onChange={(e) => setPushFollows(e.target.checked)}
          />
          <span>Push: Follows</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={emailDigest}
            onChange={(e) => setEmailDigest(e.target.checked)}
          />
          <span>Email: Digest</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={emailNewsletter}
            onChange={(e) => setEmailNewsletter(e.target.checked)}
          />
          <span>Email: Newsletter</span>
        </label>
        {/* Support & Legal */}
        <div style={{ fontWeight: 600, fontSize: 15, margin: "10px 0 2px 0" }}>
          Support & Legal
        </div>
        <button
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Help Center / FAQ
        </button>
        <button
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Contact Support
        </button>
        <button
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Terms of Service
        </button>
        <button
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Privacy Policy
        </button>
        <div style={{ fontSize: 13, color: "#888", margin: "8px 0 0 0" }}>
          App Version: 1.0.0
        </div>
        {/* Advanced */}
        <div style={{ fontWeight: 600, fontSize: 15, margin: "10px 0 2px 0" }}>
          Advanced
        </div>
        <button
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Export Data
        </button>
        <button
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          Import Data
        </button>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <input type="checkbox" />
          <span>Beta Features</span>
        </label>
        {/* Log Out */}
        <div style={{ borderTop: "1px solid #eee", margin: "10px 0" }} />
        <button
          style={{
            background: "#B71C1C",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Log Out
        </button>
      </div>
      {/* Modals for edit profile, 2FA, delete account (mock) */}
      {showEditProfile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 300,
            }}
          >
            <h3>Edit Profile (Mock)</h3>
            <div style={{ margin: "18px 0" }}>
              Profile editing form goes here.
            </div>
            <button
              onClick={() => setShowEditProfile(false)}
              style={{
                background: "#2196f3",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {show2FA && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 300,
            }}
          >
            <h3>Two-Factor Authentication (Mock)</h3>
            <div style={{ margin: "18px 0" }}>2FA setup goes here.</div>
            <button
              onClick={() => setShow2FA(false)}
              style={{
                background: "#2196f3",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 300,
            }}
          >
            <h3>Delete Account</h3>
            <div style={{ margin: "18px 0", color: "#B71C1C" }}>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </div>
            <button
              onClick={() => setShowDelete(false)}
              style={{
                background: "#eee",
                color: "#333",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
                marginRight: 10,
              }}
            >
              Cancel
            </button>
            <button
              style={{
                background: "#B71C1C",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {verificationStatus === "pending" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 300,
            }}
          >
            <h3>Verification Pending</h3>
            <div style={{ margin: "18px 0", color: "#3797f0" }}>
              Your verification badge application is pending approval.
            </div>
            <button
              onClick={() => setVerificationStatus("approved")}
              style={{
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Approve (Demo)
            </button>
            <button
              onClick={() => setVerificationStatus("none")}
              style={{
                background: "#B71C1C",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: 10,
              }}
            >
              Reject (Demo)
            </button>
          </div>
        </div>
      )}
      {verificationStatus === "approved" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 300,
            }}
          >
            <h3>Verification Approved</h3>
            <div style={{ margin: "18px 0", color: "#3797f0" }}>
              Your verification badge has been approved!
            </div>
            <button
              onClick={() => setVerificationStatus("none")}
              style={{
                background: "#2196f3",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function MyCommunityPostsSection() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editPost, setEditPost] = React.useState(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    get("/api/community/mine")
      .then((res) => {
        setPosts(res || []);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, [isAuthenticated]);

  const handleDelete = (id) => {
    setPosts((posts) => posts.filter((p) => p._id !== id));
  };
  const handleEdit = (post) => {
    setEditPost(post);
  };
  const handleEditSave = (content) => {
    setPosts((posts) =>
      posts.map((p) =>
        p._id === editPost._id ? { ...p, content, edited: true } : p
      )
    );
    setEditPost(null);
  };
  return (
    <div className="account-section">
      <h2>My Community Posts</h2>
      <div className="account-section-content">
        {loading ? (
          <div>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            No community posts yet.
          </div>
        ) : (
          posts.map((post) => (
            <CommunityPostCard
              key={post._id}
              post={post}
              onLike={() => {}}
              onSave={() => {}}
              onShare={() => {}}
              onComment={() => {}}
              onDelete={() => handleDelete(post._id)}
              onEdit={() => handleEdit(post)}
            />
          ))
        )}
        <CreatePostModal
          open={!!editPost}
          onClose={() => setEditPost(null)}
          onCreate={handleEditSave}
          initialContent={editPost ? editPost.content : ""}
          isEdit
        />
      </div>
    </div>
  );
}

function PostDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = React.useState(null);
  const [postType, setPostType] = React.useState("post"); // "post" or "community"
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const [savedCount, setSavedCount] = React.useState(0);
  const [comments, setComments] = React.useState([]);
  const [commentText, setCommentText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [commentLoading, setCommentLoading] = React.useState(false);

  React.useEffect(() => {
    if (!id) {
      setError("Invalid post ID");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Try to fetch as regular post first, then community post
    const fetchPost = async () => {
      let postFound = false;
      
      // Try regular post first
      try {
        const post = await get(`/api/posts/${id}`);
        if (post && post._id) {
          setPost(post);
          setPostType("post");
          setLiked(isAuthenticated ? post.likes?.includes(user?._id) : false);
          setLikesCount(post.likes?.length || 0);
          setSaved(isAuthenticated ? post.savedBy?.includes(user?._id) : false);
          setSavedCount(post.savedBy?.length || 0);
          setLoading(false);
          postFound = true;
          // Fetch comments for regular post
          get(`/api/comments/${id}/comments?type=post`)
            .then(setComments)
            .catch((err) => {
              console.error("Error fetching comments:", err);
              setComments([]);
            });
          return;
        }
      } catch (err) {
        // If regular post fails, try community post (don't log error yet)
        console.log("Regular post not found, trying community post...");
      }
      
      // Try community post if regular post failed
      if (!postFound) {
        try {
          const communityPost = await get(`/api/community/${id}`);
          if (communityPost && communityPost._id) {
            setPost(communityPost);
            setPostType("community");
            setLiked(isAuthenticated ? communityPost.likes?.includes(user?._id) : false);
            setLikesCount(communityPost.likes?.length || 0);
            setSaved(false);
            setSavedCount(0);
            setLoading(false);
            postFound = true;
            // Fetch comments for community post
            get(`/api/comments/${id}/comments?type=community`)
              .then(setComments)
              .catch((err) => {
                console.error("Error fetching comments:", err);
                setComments([]);
              });
            return;
          }
        } catch (communityErr) {
          console.error("Error fetching community post:", communityErr);
        }
      }
      
      // If both fail
      if (!postFound) {
        setError("Post not found");
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, isAuthenticated, user]);

  const handleLike = async () => {
    if (!isAuthenticated) return alert("Please login to like posts");
    try {
      const endpoint = postType === "community" 
        ? `/api/community/${id}/like`
        : `/api/posts/${id}/like`;
      const res = await apiPost(endpoint, {});
      setLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      alert("Failed to like post");
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return alert("Please login to save posts");
    // Community posts don't have save functionality yet
    if (postType === "community") {
      alert("Save functionality not available for community posts");
      return;
    }
    try {
      const res = await apiPost(
        `/api/posts/${id}/${saved ? "unsave" : "save"}`,
        {}
      );
      setSaved(res.saved);
      setSavedCount(res.savedCount);
    } catch (err) {
      alert("Failed to save post");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const title = post.title || post.content?.slice(0, 50) || "Check out this post";
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) return alert("Please login to comment");
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await apiPost(`/api/comments/${id}/comment`, {
        text: commentText,
        type: postType === "community" ? "community" : "post",
      });
      setCommentText("");
      // Refresh comments
      const commentType = postType === "community" ? "community" : "post";
      get(`/api/comments/${id}/comments?type=${commentType}`).then(setComments);
    } catch (err) {
      alert("Failed to add comment");
    }
    setCommentLoading(false);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem", textAlign: "center" }}>
        <div style={{ fontSize: 18, color: "#666" }}>Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            padding: "2rem 1.5rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#B71C1C", marginBottom: 10 }}>Post Not Found</h2>
          <p style={{ color: "#666", marginBottom: 20 }}>
            {error || "The post you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "#2196f3",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: "2rem 1.5rem",
          marginBottom: 18,
        }}
      >
        {post.images && post.images.length > 0 && (
          <img
            src={post.images[0]}
            alt={post.title || "Post image"}
            style={{ width: "100%", borderRadius: 12, marginBottom: 18 }}
          />
        )}
        {post.title && (
          <h2 style={{ fontWeight: 700, color: "#B71C1C", marginBottom: 10 }}>
            {post.title}
          </h2>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <img
            src={post.author?.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E"}
            alt={post.author?.username}
            style={{ width: 36, height: 36, borderRadius: "50%" }}
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E";
            }}
          />
          <span style={{ fontWeight: 600, color: "#222" }}>
            {post.author?.username}
          </span>
          <span style={{ color: "#888", fontSize: 13 }}>
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
        <div style={{ fontSize: 16, color: "#222", marginBottom: 18 }}>
          {post.content}
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <button
            onClick={handleLike}
            style={{
              background: liked ? "#2196f3" : "#eee",
              color: liked ? "#fff" : "#222",
              border: "none",
              borderRadius: 8,
              padding: "6px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {liked ? "Unlike" : "Like"} ({likesCount})
          </button>
          <button
            onClick={handleSave}
            style={{
              background: saved ? "#B71C1C" : "#eee",
              color: saved ? "#fff" : "#222",
              border: "none",
              borderRadius: 8,
              padding: "6px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {saved ? "Unsave" : "Save"} ({savedCount})
          </button>
          <button
            onClick={handleShare}
            style={{
              background: "#2196f3",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Share
          </button>
        </div>
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 10 }}>Comments</h3>
          {isAuthenticated && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
                disabled={commentLoading}
              />
              <button
                onClick={handleAddComment}
                disabled={commentLoading || !commentText.trim()}
                style={{
                  background: "#2196f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Post
              </button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {comments.length === 0 && (
              <div style={{ color: "#888" }}>No comments yet.</div>
            )}
            {comments.map((comment) => (
              <div
                key={comment._id}
                style={{
                  background: "#f5f5f5",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <img
                  src={comment.author?.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E"}
                  alt={comment.author?.username}
                  style={{ width: 28, height: 28, borderRadius: "50%" }}
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E";
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {comment.author?.username}
                  </div>
                  <div style={{ fontSize: 14 }}>{comment.content}</div>
                  <div style={{ color: "#888", fontSize: 12 }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfilePage() {
  const { username } = useParams();
  const [user, setUser] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [followers, setFollowers] = React.useState([]);
  const [following, setFollowing] = React.useState([]);
  React.useEffect(() => {
    if (!username) return;
    // Fetch user by username
    get(`/api/user/profile?username=${encodeURIComponent(username)}`)
      .then((u) => {
        setUser(u);
        if (u && u._id) {
          get(`/api/user/${u._id}/followers`)
            .then(setFollowers)
            .catch(() => setFollowers([]));
          get(`/api/user/${u._id}/following`)
            .then(setFollowing)
            .catch(() => setFollowing([]));
        }
      })
      .catch(() => setUser(null));
    get(`/api/posts?author=${encodeURIComponent(username)}`)
      .then((res) => setPosts(res.posts || []))
      .catch(() => setPosts([]));
  }, [username]);
  if (!user) return <div>Loading...</div>;
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          marginBottom: 18,
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: "2rem 1.5rem",
        }}
      >
        <img
          src={user.avatar}
          alt={user.username}
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            border: "3px solid #2196f3",
            objectFit: "cover",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 28,
              color: "#222",
              marginBottom: 2,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {user.username}
            {user.verified && (
              <span
                title="Verified"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginLeft: 4,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #3797f0 0%, #4ab3f4 100%)",
                    boxShadow: "0 1px 4px rgba(55,151,240,0.18)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="6.5" cy="6.5" r="6.5" fill="none" />
                    <path
                      d="M4 7.5L6 9.5L9 5.5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            )}
          </div>
          <div style={{ fontSize: 15, color: "#888", marginBottom: 6 }}>
            {user.bio}
          </div>
          <div
            style={{
              display: "flex",
              gap: 32,
              fontSize: 18,
              color: "#222",
              marginBottom: 8,
            }}
          >
            <div>
              <span style={{ fontWeight: 700 }}>{followers.length}</span>{" "}
              <span style={{ color: "#888", fontWeight: 400, fontSize: 15 }}>
                Followers
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>{following.length}</span>{" "}
              <span style={{ color: "#888", fontWeight: 400, fontSize: 15 }}>
                Following
              </span>
            </div>
          </div>
        </div>
        <button
          style={{
            background: "#d90429",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 28px",
            fontWeight: 700,
            fontSize: 17,
            cursor: "pointer",
            height: 44,
          }}
        >
          Login
        </button>
      </div>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>
        {user.bio}
      </div>
      <div
        style={{
          background: "#fafbfc",
          borderRadius: 12,
          padding: "1rem 0",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            color: "#888",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#d90429" }}>
              {posts.length}
            </div>
            <div>Posts</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#2196f3" }}>
              {posts.reduce((acc, p) => acc + (p.images?.length || 0), 0)}
            </div>
            <div>Images</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#888" }}>
              0
            </div>
            <div>Videos</div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
        }}
      >
        {posts.map((post) => {
          const imgSrc =
            post.images && post.images.length > 0 ? post.images[0] : null;
          if (!imgSrc) return null;
          return (
            <div
              key={post._id}
              style={{
                width: "100%",
                aspectRatio: "1/1",
                background: "#eee",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <img
                src={imgSrc}
                alt={post.title || "post"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const accountRoutes = {
  profile: "/account/profile",
  mynews: "/account/mynews",
  mycomments: "/account/mycomments",
  communityposts: "/account/community-posts",
  saved: "/account/saved",
  settings: "/account/settings",
};

function MainRoutes({ onCreate, onAccount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathToKey = {
    "/": "home",
    "/trending": "trending",
    "/community": "community",
    "/create": "create",
    "/create/upload": "create-upload",
    "/create/post": "create-post",
    "/create/live": "create-live",
    "/upload-video": "upload-video",
    "/login": "login",
    "/register": "register",
    "/notifications": "notifications",
    "/account/profile": "account",
    "/account/mynews": "account",
    "/account/mycomments": "account",
    "/account/community-posts": "account",
    "/account/saved": "account",
    "/account/settings": "account",
    "/user/:username": "user-profile",
    "/post/:id": "post-detail",
  };
  const keyToPath = {
    home: "/",
    trending: "/trending",
    community: "/community",
    create: "/create",
    "create-upload": "/create/upload",
    "create-post": "/create/post",
    "create-live": "/create/live",
    "upload-video": "/upload-video",
    login: "/login",
    register: "/register",
    notifications: "/notifications",
    account: "/account/profile",
    "user-profile": "/user/:username",
    "post-detail": "/post/:id",
  };
  const current = pathToKey[location.pathname] || "home";
  return (
    <>
      <div style={{ paddingTop: 56, paddingBottom: 70 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/community" element={<Community />} />
          <Route path="/create" element={<Create />} />
          <Route
            path="/create/upload"
            element={
              <ProtectedRoute>
                <CreateUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/live"
            element={
              <ProtectedRoute>
                <CreateLive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-video"
            element={
              <ProtectedRoute>
                <UploadVideo />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/account/profile"
            element={
              <ProtectedRoute>
                <ProfileSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/mynews"
            element={
              <ProtectedRoute>
                <MyNewsSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/mycomments"
            element={
              <ProtectedRoute>
                <MyCommentsSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/community-posts"
            element={
              <ProtectedRoute>
                <MyCommunityPostsSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/saved"
            element={
              <ProtectedRoute>
                <SavedSection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/settings"
            element={
              <ProtectedRoute>
                <SettingsSection />
              </ProtectedRoute>
            }
          />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route
            path="/account"
            element={<Navigate to="/account/profile" replace />}
          />
        </Routes>
      </div>
      <BottomNav
        current={current}
        onChange={(key) => {
          if (key === "create") onCreate();
          else if (key === "account") onAccount();
          else navigate(keyToPath[key]);
        }}
      />
    </>
  );
}

export default function App() {
  const [createOpen, setCreateOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const handleCreate = () => setCreateOpen(true);
  const handleClose = () => setCreateOpen(false);
  const handleOption = (option) => {
    alert(`Selected: ${option}`);
    setCreateOpen(false);
  };
  const openAccountMenu = () => setAccountOpen(true);
  const closeAccountMenu = () => setAccountOpen(false);

  // Allow global event for opening account menu
  useEffect(() => {
    const handler = () => setAccountOpen(true);
    window.addEventListener("openAccountMenu", handler);
    return () => window.removeEventListener("openAccountMenu", handler);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes
          createOpen={createOpen}
          handleCreate={handleCreate}
          handleClose={handleClose}
          handleOption={handleOption}
          accountOpen={accountOpen}
          closeAccountMenu={closeAccountMenu}
          openAccountMenu={openAccountMenu}
        />
      </AuthProvider>
    </Router>
  );
}

function AppRoutes({
  createOpen,
  handleCreate,
  handleClose,
  handleOption,
  accountOpen,
  closeAccountMenu,
  openAccountMenu,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAccountSelect = (key) => {
    closeAccountMenu();
    if (key === "login") {
      navigate("/login");
      return;
    }
    if (key === "register") {
      navigate("/register");
      return;
    }
    if (accountRoutes[key]) {
      if (!isAuthenticated) {
        navigate("/login", { state: { from: accountRoutes[key] } });
        return;
      }
      navigate(accountRoutes[key]);
    }
  };

  const handleCreateOption = (option) => {
    handleClose();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/create" } });
      return;
    }
    if (option === "video") navigate("/upload-video");
    else if (option === "post") navigate("/create/post");
    else if (option === "live") navigate("/create/live");
  };

  return (
    <>
      <Navbar onProfileClick={openAccountMenu} />
      <AccountMenu
        open={accountOpen}
        onClose={closeAccountMenu}
        onSelect={handleAccountSelect}
      />
      <CreateModal
        open={createOpen}
        onClose={handleClose}
        onOption={handleCreateOption}
      />
      <MainRoutes onCreate={handleCreate} onAccount={openAccountMenu} />
    </>
  );
}
