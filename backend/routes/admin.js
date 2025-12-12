const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Post = require("../models/Post");
const Video = require("../models/Video");
const CommunityPost = require("../models/CommunityPost");

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Apply auth and admin check to all routes
router.use(auth);
router.use(isAdmin);

// Stats endpoints
router.get("/stats/users", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats/posts", async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching post stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats/videos", async (req, res) => {
  try {
    const count = await Video.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching video stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats/community", async (req, res) => {
  try {
    const count = await CommunityPost.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching community stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all videos
router.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("uploadedBy", "username avatar")
      .sort({ uploadDate: -1 });
    res.json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all community posts
router.get("/community", async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role
router.post("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.post("/users/:id/delete", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete post
router.post("/posts/:id/delete", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete video
router.post("/videos/:id/delete", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Delete file from GridFS if path exists
    if (video.path) {
      try {
        const { deleteFile } = require("../utils/gridfs");
        const fileId = video.path.split("/").pop();
        await deleteFile(fileId);
      } catch (fileError) {
        console.error("Error deleting video file:", fileError);
        // Continue with deletion even if file deletion fails
      }
    }
    
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete community post
router.post("/community/:id/delete", async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Community post deleted successfully" });
  } catch (error) {
    console.error("Error deleting community post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Analytics endpoints
router.get("/analytics/user-growth", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const users = await User.find({
      createdAt: { $gte: sixMonthsAgo }
    }).select("createdAt");
    
    // Group by month
    const monthlyData = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    users.forEach(user => {
      const date = new Date(user.createdAt);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    // Convert to array format
    const growthData = Object.entries(monthlyData)
      .map(([month, users]) => ({ month, users }))
      .sort((a, b) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(a.month.split(" ")[0]) - months.indexOf(b.month.split(" ")[0]);
      });
    
    res.json(growthData);
  } catch (error) {
    console.error("Error fetching user growth analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/analytics/engagement", async (req, res) => {
  try {
    const [postsCount, videosCount, communityCount] = await Promise.all([
      Post.countDocuments(),
      Video.countDocuments(),
      CommunityPost.countDocuments()
    ]);
    
    const total = postsCount + videosCount + communityCount;
    
    res.json([
      { name: "Posts", value: total > 0 ? Math.round((postsCount / total) * 100) : 0 },
      { name: "Videos", value: total > 0 ? Math.round((videosCount / total) * 100) : 0 },
      { name: "Community", value: total > 0 ? Math.round((communityCount / total) * 100) : 0 }
    ]);
  } catch (error) {
    console.error("Error fetching engagement analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/analytics/top-content", async (req, res) => {
  try {
    const [topPosts, topVideos] = await Promise.all([
      Post.find()
        .select("title views")
        .sort({ views: -1 })
        .limit(5),
      Video.find()
        .select("title views")
        .sort({ views: -1 })
        .limit(5)
    ]);
    
    const topContent = [
      ...topPosts.map(p => ({ name: p.title || "Untitled Post", views: p.views || 0 })),
      ...topVideos.map(v => ({ name: v.title || "Untitled Video", views: v.views || 0 }))
    ]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    
    res.json(topContent);
  } catch (error) {
    console.error("Error fetching top content analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

