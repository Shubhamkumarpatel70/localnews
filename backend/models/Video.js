const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  duration: { type: Number }, // in seconds
  thumbnail: { type: String },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  tags: { type: [String], default: [] },
  location: { type: String },
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  isLive: { type: Boolean, default: false },
  viewers: { type: Number, default: 0 },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  uploadDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

videoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Video", videoSchema);
