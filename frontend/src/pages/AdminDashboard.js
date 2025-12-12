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
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ForumIcon from "@mui/icons-material/Forum";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

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
        live: 0,
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
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.users}</div>
                <div className="text-blue-100">Total Users</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.posts}</div>
                <div className="text-green-100">Total Posts</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.videos}</div>
                <div className="text-purple-100">Total Videos</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.community}</div>
                <div className="text-orange-100">Community Posts</div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.live}</div>
                <div className="text-red-100">Live Streams</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h4>
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
                        stroke="#667eea"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Content Engagement</h4>
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
                            fill={["#667eea", "#10b981", "#f59e0b"][index % 3]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Content Views</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topContent}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Manage Users</h2>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user._id} className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={user.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23999'/%3E%3Cpath d='M20 85 Q20 65 50 65 Q80 65 80 85' fill='%23999'/%3E%3C/svg%3E"} 
                      alt={user.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{user.username}</h4>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">Role: {user.role || "User"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={user.role || "user"}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
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
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Manage Posts</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
                    <p className="text-gray-600">By {post.author?.username}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post._id, "posts")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
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
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Manage Videos</h2>
            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video._id} className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{video.title}</h4>
                    <p className="text-gray-600">By {video.uploadedBy?.username}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(video._id, "videos")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
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
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Manage Community</h2>
            <div className="space-y-4">
              {community.map((post) => (
                <div key={post._id} className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">{post.content}</p>
                    <p className="text-gray-600 mt-1">By {post.author?.username}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post._id, "community")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="text-center py-12 text-gray-500">Select a section</div>;
    }
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { key: "users", label: "Users", icon: <PeopleIcon /> },
    { key: "posts", label: "Posts", icon: <PostAddIcon /> },
    { key: "videos", label: "Videos", icon: <VideoLibraryIcon /> },
    { key: "community", label: "Community", icon: <ForumIcon /> },
  ];

  return (
    <div className="pt-14 pb-20 min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AdminPanelSettingsIcon className="text-3xl text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                activeSection === item.key
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveSection(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
