const User = require("../models/User");
const News = require("../models/News");
const { createNotification } = require("./notificationController");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;

    // Handle avatar upload to Cloudinary
    if (req.file) {
      const cloudinary = require("../config/cloudinary");
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "avatars",
              public_id: `avatar_${req.user.id}_${Date.now()}`,
              transformation: [
                { width: 300, height: 300, crop: "fill", gravity: "face" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserNews = async (req, res) => {
  try {
    const news = await News.find({ author: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id)
      return res.status(400).json({ message: "Cannot follow yourself" });
    const user = await User.findById(req.user.id);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });
    const isFollowing = user.following.includes(targetId);
    if (!isFollowing) {
      user.following.push(targetId);
      target.followers.push(req.user.id);
      await user.save();
      await target.save();
      // Notify target
      await createNotification({
        user: targetId,
        type: "follow",
        message: `${user.username} started following you.`,
      });
      return res.json({ following: true });
    } else {
      user.following = user.following.filter(
        (id) => id.toString() !== targetId
      );
      target.followers = target.followers.filter(
        (id) => id.toString() !== req.user.id
      );
      await user.save();
      await target.save();
      return res.json({ following: false });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "username avatar"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "username avatar"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
