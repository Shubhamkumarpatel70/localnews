const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFile } = require("../utils/gridfs");

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all posts (optionally filter by author username)
router.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 10, author } = req.query;
    const skip = (page - 1) * limit;
    let query = { isPublished: true };
    if (category) {
      query.category = category;
    }
    if (author) {
      // Find user by username
      const User = require("../models/User");
      const userDoc = await User.findOne({ username: author });
      if (userDoc) {
        query.author = userDoc._id;
      } else {
        // No such user, return empty
        return res.json({
          posts: [],
          total: 0,
          page: parseInt(page),
          totalPages: 0,
        });
      }
    }
    const posts = await Post.find(query)
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Post.countDocuments(query);
    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all posts saved by the logged-in user
router.get("/saved", auth, async (req, res) => {
  try {
    const posts = await Post.find({ savedBy: req.user.id })
      .populate("author", "username avatar")
      .populate("comments")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get top hashtags
router.get("/top-tags", async (req, res) => {
  try {
    const tagsAgg = await Post.aggregate([
      { $match: { tags: { $exists: true, $ne: null, $not: { $size: 0 } } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(tagsAgg.map((t) => ({ tag: t._id, count: t.count })));
  } catch (error) {
    console.error("Error fetching top tags:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get post by ID
router.get("/:id", async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username avatar"
        }
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new post
router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const { title, content, tags, location, category } = req.body;

    // Upload images to MongoDB GridFS
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const filename = `post_${req.user.id}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}_${file.originalname}`;
        const fileResult = await uploadFile(file.buffer, filename, {
          contentType: file.mimetype,
          uploadedBy: req.user.id,
          originalName: file.originalname,
          type: "post-image",
        });
        return `/api/files/${fileResult.id}`;
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = new Post({
      title,
      content,
      images: imageUrls,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      location,
      category,
      author: req.user.id,
    });

    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "username avatar"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update post
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content, images, tags, location, category, isPublished } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (images !== undefined) post.images = images;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()).filter((t) => t);
    }
    if (location !== undefined) post.location = location;
    if (category !== undefined) post.category = category;
    if (isPublished !== undefined) post.isPublished = isPublished;

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "author",
      "username avatar"
    );

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Like/unlike post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ liked: !isLiked, likesCount: post.likes.length });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save post
router.post("/:id/save", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const userId = req.user.id;
    if (!post.savedBy.includes(userId)) {
      post.savedBy.push(userId);
      await post.save();
    }
    res.json({ saved: true, savedCount: post.savedBy.length });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Unsave post
router.post("/:id/unsave", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const userId = req.user.id;
    post.savedBy = post.savedBy.filter((id) => id.toString() !== userId);
    await post.save();
    res.json({ saved: false, savedCount: post.savedBy.length });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get top hashtags
router.get("/top-tags", async (req, res) => {
  try {
    const tagsAgg = await Post.aggregate([
      { $match: { tags: { $exists: true, $ne: null, $not: { $size: 0 } } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(tagsAgg.map((t) => ({ tag: t._id, count: t.count })));
  } catch (error) {
    console.error("Error fetching top tags:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
