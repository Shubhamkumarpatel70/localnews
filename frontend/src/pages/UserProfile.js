import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, post } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import NewsCard from "../components/NewsCard";
import VideoCard from "../components/VideoCard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

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
        const userResponse = await get(`/api/user/profile/${username}`);
        setUser(userResponse);
        setFollowersCount(userResponse.followers?.length || 0);
        setFollowingCount(userResponse.following?.length || 0);

        if (isAuthenticated && currentUser) {
          setIsFollowing(
            userResponse.followers?.includes(currentUser._id) || false
          );
        }

        const postsResponse = await get(
          `/api/posts?author=${encodeURIComponent(userResponse.username)}`
        );
        setPosts(postsResponse.posts || []);

        const videosResponse = await get(
          `/api/videos?uploadedBy=${userResponse._id}`
        );
        // Transform videos to map uploadedBy to author and uploadDate to createdAt
        const transformedVideos = (videosResponse.videos || videosResponse || []).map((video) => ({
          ...video,
          author: video.uploadedBy, // Map uploadedBy to author for consistency
          createdAt: video.uploadDate || video.createdAt, // Map uploadDate to createdAt for consistency
        }));
        setVideos(transformedVideos);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/404");
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

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

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
      <div className="pt-14 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-14 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile =
    isAuthenticated && currentUser && currentUser._id === user._id;

  return (
    <div className="pt-14 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={user.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E"}
                alt={user.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E";
                }}
              />
              {isOwnProfile && (
                <label
                  htmlFor="avatar-input"
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <PhotoCameraIcon className="text-xl" />
                  )}
                </label>
              )}
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.username}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex gap-6 mb-4 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{followersCount}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {posts.length + videos.length}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
              {!isOwnProfile && (
                <button
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  onClick={handleFollow}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === "posts"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("posts")}
            >
              Posts ({posts.length})
            </button>
            <button
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === "videos"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("videos")}
            >
              Videos ({videos.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <AccountCircleIcon className="text-6xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No posts yet</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <AccountCircleIcon className="text-6xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No videos yet</p>
                  </div>
                ) : (
                  videos.map((video) => (
                    <VideoCard
                      key={video._id}
                      video={video}
                      onSave={() => handleSave(video._id, "video")}
                      onShare={() => handleShare(video._id)}
                      onComment={() => {}}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
