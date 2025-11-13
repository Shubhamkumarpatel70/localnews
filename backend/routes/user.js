const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");
const Comment = require("../models/Comment");
const cloudinary = require("../config/cloudinary");

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/profile", auth, userController.getProfile);
router.get("/profile/:username", userController.getUserProfileByUsername);
router.put(
  "/profile",
  auth,
  upload.single("avatar"),
  userController.updateProfile
);
router.get("/news", auth, userController.getUserNews);
router.post("/:id/follow", auth, userController.followUser);
router.get("/:id/followers", auth, userController.getFollowers);
router.get("/:id/following", auth, userController.getFollowing);
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.params.id })
      .populate("post", "title")
      .populate("news", "title")
      .populate("communityPost", "title");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
