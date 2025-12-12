const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const Video = require("../models/Video");
const { uploadFile } = require("../utils/gridfs");

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"), false);
    }
  },
});

// Upload video
router.post("/upload", auth, upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const { title, location, tags, isLive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        console.error("Error parsing tags:", error);
      }
    }

    // Generate unique filename
    const filename = `video_${req.user.id}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}_${req.file.originalname}`;

    // Upload video to MongoDB GridFS
    const fileResult = await uploadFile(req.file.buffer, filename, {
      contentType: req.file.mimetype,
      uploadedBy: req.user.id,
      originalName: req.file.originalname,
    });

    // Create video document
    const video = new Video({
      title: title.trim(),
      location: location || "",
      tags: parsedTags,
      filename: fileResult.filename,
      originalName: req.file.originalname,
      path: `/api/files/${fileResult.id}`, // URL to serve file from GridFS
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      isLive: isLive === "true" || isLive === true,
      thumbnail: `/api/files/${fileResult.id}/thumbnail`, // Can generate thumbnail later
    });

    await video.save();

    res.status(201).json({
      message: "Video uploaded successfully",
      video: {
        id: video._id,
        title: video.title,
        location: video.location,
        tags: video.tags,
        filename: video.filename,
        uploadedBy: video.uploadedBy,
        uploadDate: video.uploadDate,
        isLive: video.isLive,
        thumbnail: video.thumbnail,
        url: video.path,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    // Return proper JSON error response
    if (error.message) {
      return res.status(500).json({ 
        message: error.message || "Server error during upload",
        error: error.toString()
      });
    }
    res.status(500).json({ 
      message: "Server error during upload",
      error: "Unknown error occurred"
    });
  }
});

// Start live stream
router.post("/live", auth, async (req, res) => {
  try {
    const { title, location } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Create live video document
    const liveVideo = new Video({
      title: title.trim(),
      location: location || "",
      tags: ["live"],
      filename: `live-${Date.now()}`,
      originalName: "Live Stream",
      path: "",
      size: 0,
      mimetype: "video/live",
      uploadedBy: req.user.id,
      isLive: true,
      thumbnail:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80", // Default live thumbnail
    });

    await liveVideo.save();

    res.status(201).json({
      message: "Live stream started successfully",
      video: {
        id: liveVideo._id,
        title: liveVideo.title,
        location: liveVideo.location,
        isLive: true,
        viewers: 0,
        uploadedBy: liveVideo.uploadedBy,
        uploadDate: liveVideo.uploadDate,
      },
    });
  } catch (error) {
    console.error("Live stream error:", error);
    res.status(500).json({ message: "Server error starting live stream" });
  }
});

// Get all videos
router.get("/", async (req, res) => {
  try {
    const { uploadedBy, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    let query = { isPublished: true };
    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }
    const videos = await Video.find(query)
      .populate("uploadedBy", "username avatar")
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(query);
    res.json({
      videos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all videos saved by the logged-in user
router.get("/saved", auth, async (req, res) => {
  try {
    const videos = await Video.find({ savedBy: req.user.id })
      .populate("uploadedBy", "username avatar")
      .populate("comments")
      .sort({ uploadDate: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Error fetching saved videos:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get top hashtags
router.get("/top-tags", async (req, res) => {
  try {
    const tagsAgg = await Video.aggregate([
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

// Get video by ID
router.get("/:id", async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid video ID" });
  }
  try {
    const { id } = req.params;

    const video = await Video.findById(id)
      .populate("uploadedBy", "username avatar")
      .populate("comments");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Like/unlike video
router.post("/:id/like", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.user.id;
    const isLiked = video.likes.includes(userId);

    if (isLiked) {
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    } else {
      video.likes.push(userId);
    }

    await video.save();
    res.json({ liked: !isLiked, likesCount: video.likes.length });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save/Unsave video
router.post("/:id/save", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    let saved;
    if (!video.savedBy) video.savedBy = [];
    if (!video.savedBy.includes(req.user.id)) {
      video.savedBy.push(req.user.id);
      saved = true;
    } else {
      video.savedBy = video.savedBy.filter(
        (id) => id.toString() !== req.user.id
      );
      saved = false;
    }
    await video.save();
    res.json({ saved, savedCount: video.savedBy.length });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update video
router.put("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user is the owner
    if (video.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, description, location, tags, isPublished } = req.body;

    if (title) video.title = title.trim();
    if (description !== undefined) video.description = description;
    if (location !== undefined) video.location = location;
    if (tags) {
      video.tags = Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim());
    }
    if (isPublished !== undefined) video.isPublished = isPublished;

    await video.save();

    const populatedVideo = await Video.findById(video._id).populate(
      "uploadedBy",
      "username avatar"
    );

    res.json(populatedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete video
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user is the owner
    if (video.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete video file from GridFS if needed
    // Note: GridFS files are stored separately, you may want to delete them too
    // For now, we'll just delete the video document
    await video.deleteOne();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get top hashtags
router.get("/top-tags", async (req, res) => {
  try {
    const tagsAgg = await Video.aggregate([
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
