import React, { useState, useEffect } from "react";
import { get, post } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    videos: 0,
    community: 0,
    live: 0,
  });
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [community, setCommunity] = useState([]);
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    engagement: [],
    topContent: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
    if (activeSection === "users") fetchUsers();
    else if (activeSection === "posts") fetchPosts();
    else if (activeSection === "videos") fetchVideos();
    else if (activeSection === "community") fetchCommunity();
  }, [activeSection]);

  const fetchStats = async () => {
    try {
      const [userRes, postRes, videoRes, commRes] = await Promise.all([
        get("/api/admin/stats/users"),
        get("/api/admin/stats/posts"),
        get("/api/admin/stats/videos"),
        get("/api/admin/stats/community"),
      ]);
      setStats({
        users: userRes.count || 0,
        posts: postRes.count || 0,
        videos: videoRes.count || 0,
        community: commRes.count || 0,
        live: 0, // TODO: Add live stats
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await get("/api/admin/users");
      setUsers(res.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await get("/api/admin/posts");
      setPosts(res.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await get("/api/admin/videos");
      setVideos(res.videos || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchCommunity = async () => {
    try {
      const res = await get("/api/admin/community");
      setCommunity(res.posts || []);
    } catch (error) {
      console.error("Error fetching community:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setAnalytics({
        userGrowth: [
          { month: "Jan", users: 120 },
          { month: "Feb", users: 150 },
          { month: "Mar", users: 180 },
          { month: "Apr", users: 220 },
          { month: "May", users: 280 },
          { month: "Jun", users: 320 },
        ],
        engagement: [
          { name: "Posts", value: 45 },
          { name: "Videos", value: 30 },
          { name: "Community", value: 25 },
        ],
        topContent: [
          { name: "Breaking News", views: 1250 },
          { name: "Local Events", views: 980 },
          { name: "Sports Update", views: 750 },
          { name: "Weather Alert", views: 620 },
        ],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await post(`/api/admin/users/${userId}/delete`, {});
      setUsers(users.filter((u) => u._id !== userId));
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleDeletePost = async (postId, type) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await post(`/api/admin/${type}/${postId}/delete`, {});
      if (type === "posts") setPosts(posts.filter((p) => p._id !== postId));
      else if (type === "videos")
        setVideos(videos.filter((v) => v._id !== postId));
      else if (type === "community")
        setCommunity(community.filter((c) => c._id !== postId));
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await post(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      alert("Failed to update user role");
    }
  };

  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;

    switch (activeSection) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.users}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{stats.posts}</h3>
                <p>Total Posts</p>
              </div>
              <div className="stat-card">
                <h3>{stats.videos}</h3>
                <p>Total Videos</p>
              </div>
              <div className="stat-card">
                <h3>{stats.community}</h3>
                <p>Community Posts</p>
              </div>
              <div className="stat-card">
                <h3>{stats.live}</h3>
                <p>Live Streams</p>
              </div>
            </div>

            <div className="charts-section">
              <h3>Analytics</h3>
              <div className="charts-grid">
                <div className="chart-container">
                  <h4>User Growth</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h4>Content Engagement</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.engagement}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.engagement.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#0088FE", "#00C49F", "#FFBB28"][index % 3]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h4>Top Content Views</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topContent}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="users-content">
            <h2>Manage Users</h2>
            <div className="users-list">
              {users.map((user) => (
                <div key={user._id} className="user-item">
                  <div className="user-info">
                    <img src={user.avatar} alt={user.username} />
                    <div>
                      <h4>{user.username}</h4>
                      <p>{user.email}</p>
                      <p>Role: {user.role || "User"}</p>
                    </div>
                  </div>
                  <div className="user-actions">
                    <select
                      value={user.role || "user"}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "posts":
        return (
          <div className="posts-content">
            <h2>Manage Posts</h2>
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post._id} className="post-item">
                  <h4>{post.title}</h4>
                  <p>By {post.author?.username}</p>
                  <button
                    onClick={() => handleDeletePost(post._id, "posts")}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "videos":
        return (
          <div className="videos-content">
            <h2>Manage Videos</h2>
            <div className="videos-list">
              {videos.map((video) => (
                <div key={video._id} className="video-item">
                  <h4>{video.title}</h4>
                  <p>By {video.uploadedBy?.username}</p>
                  <button
                    onClick={() => handleDeletePost(video._id, "videos")}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "community":
        return (
          <div className="community-content">
            <h2>Manage Community</h2>
            <div className="community-list">
              {community.map((post) => (
                <div key={post._id} className="community-item">
                  <p>{post.content}</p>
                  <p>By {post.author?.username}</p>
                  <button
                    onClick={() => handleDeletePost(post._id, "community")}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <nav>
          <button
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeSection === "users" ? "active" : ""}
            onClick={() => setActiveSection("users")}
          >
            Users
          </button>
          <button
            className={activeSection === "posts" ? "active" : ""}
            onClick={() => setActiveSection("posts")}
          >
            Posts
          </button>
          <button
            className={activeSection === "videos" ? "active" : ""}
            onClick={() => setActiveSection("videos")}
          >
            Videos
          </button>
          <button
            className={activeSection === "community" ? "active" : ""}
            onClick={() => setActiveSection("community")}
          >
            Community
          </button>
        </nav>
      </div>
      <div className="main-content">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
