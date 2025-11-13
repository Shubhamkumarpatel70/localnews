import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, post } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import NewsCard from "../components/NewsCard";
import VideoCard from "../components/VideoCard";
import "./UserProfile.css";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userResponse = await get(`/api/user/profile/${username}`);
        setUser(userResponse);
        setFollowersCount(userResponse.followers?.length || 0);
        setFollowingCount(userResponse.following?.length || 0);

        // Check if current user is following this user
        if (isAuthenticated && currentUser) {
          setIsFollowing(
            userResponse.followers?.includes(currentUser._id) || false
          );
        }

        // Fetch user's posts
        const postsResponse = await get(
          `/api/posts?author=${encodeURIComponent(userResponse.username)}`
        );
        setPosts(postsResponse.posts || []);

        // Fetch user's videos
        const videosResponse = await get(
          `/api/videos?uploadedBy=${userResponse._id}`
        );
        setVideos(videosResponse || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/404"); // Redirect to 404 if user not found
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username, isAuthenticated, currentUser, navigate]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert("Please login to follow users");
      return;
    }

    try {
      const response = await post(`/api/user/${user._id}/follow`, {});
      setIsFollowing(response.following);
      setFollowersCount((prev) => (response.following ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error following user:", error);
      alert("Failed to follow user");
    }
  };

  const handleLike = async (id, type) => {
    if (!isAuthenticated) {
      alert("Please login to like content");
      return;
    }

    try {
      let endpoint = "";
      switch (type) {
        case "post":
          endpoint = `/api/posts/${id}/like`;
          break;
        case "video":
          endpoint = `/api/videos/${id}/like`;
          break;
        default:
          return;
      }

      const response = await post(endpoint, {});

      // Update local state
      if (type === "post") {
        setPosts((posts) =>
          posts.map((post) =>
            post._id === id
              ? { ...post, liked: response.liked, likes: response.likesCount }
              : post
          )
        );
      } else if (type === "video") {
        setVideos((videos) =>
          videos.map((video) =>
            video._id === id
              ? { ...video, liked: response.liked, likes: response.likesCount }
              : video
          )
        );
      }
    } catch (error) {
      console.error("Error liking content:", error);
      alert("Failed to like content");
    }
  };

  const handleSave = async (id, type) => {
    if (!isAuthenticated) {
      alert("Please login to save content");
      return;
    }

    try {
      let endpoint = "";
      switch (type) {
        case "post":
          endpoint = `/api/posts/${id}/save`;
          break;
        case "video":
          endpoint = `/api/videos/${id}/save`;
          break;
        default:
          return;
      }

      const response = await post(endpoint, {});

      // Update local state
      if (type === "post") {
        setPosts((posts) =>
          posts.map((post) =>
            post._id === id
              ? {
                  ...post,
                  saved: response.saved,
                  savedCount: response.savedCount,
                }
              : post
          )
        );
      } else if (type === "video") {
        setVideos((videos) =>
          videos.map((video) =>
            video._id === id
              ? {
                  ...video,
                  saved: response.saved,
                  savedCount: response.savedCount,
                }
              : video
          )
        );
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save content");
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/post/${id}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this post",
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-not-found">
          <h2>User not found</h2>
          <p>The user you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const isOwnProfile =
    isAuthenticated && currentUser && currentUser._id === user._id;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={user.username}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          {isOwnProfile && (
            <div className="avatar-upload">
              <label htmlFor="avatar-input" className="avatar-upload-btn">
                {uploadingAvatar ? (
                  <div className="upload-spinner"></div>
                ) : (
                  "📷"
                )}
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {posts.length + videos.length}
              </span>
              <span className="stat-label">Posts</span>
            </div>
          </div>
          {!isOwnProfile && (
            <button
              className={`follow-btn ${isFollowing ? "following" : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => setActiveTab("posts")}
        >
          Posts ({posts.length})
        </button>
        <button
          className={activeTab === "videos" ? "active" : ""}
          onClick={() => setActiveTab("videos")}
        >
          Videos ({videos.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "posts" && (
          <div className="posts-grid">
            {posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <NewsCard
                  key={post._id}
                  news={post}
                  onLike={() => handleLike(post._id, "post")}
                  onSave={() => handleSave(post._id, "post")}
                  onShare={() => handleShare(post._id)}
                  liked={post.liked}
                  saved={post.saved}
                  likesCount={post.likes}
                  savedCount={post.savedCount}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="videos-grid">
            {videos.length === 0 ? (
              <div className="empty-state">
                <p>No videos yet</p>
              </div>
            ) : (
              videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onSave={() => handleSave(video._id, "video")}
                  onShare={() => handleShare(video._id)}
                  onComment={() => {}} // TODO: Implement comment functionality
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
