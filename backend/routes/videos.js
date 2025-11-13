const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const Video = require("../models/Video");
const cloudinary = require("../config/cloudinary");

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

    // Upload video to Cloudinary
    const videoResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: "videos",
            public_id: `video_${req.user.id}_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    // Create video document
    const video = new Video({
      title: title.trim(),
      location: location || "",
      tags: parsedTags,
      filename: videoResult.public_id,
      originalName: req.file.originalname,
      path: videoResult.secure_url,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      isLive: isLive === "true" || isLive === true,
      thumbnail: videoResult.secure_url.replace(/\.[^/.]+$/, ".jpg"), // Cloudinary auto-generates thumbnail
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
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
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
