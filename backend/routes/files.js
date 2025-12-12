const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { getFileById, getFileMetadata } = require("../utils/gridfs");

// Serve file from GridFS by ID
router.get("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }

    // Get file metadata
    const fileMetadata = await getFileMetadata(fileId);
    if (!fileMetadata) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set appropriate headers
    res.set({
      "Content-Type": fileMetadata.contentType || "application/octet-stream",
      "Content-Length": fileMetadata.length,
      "Accept-Ranges": "bytes",
    });

    // Stream file
    const downloadStream = getFileById(fileId);
    
    downloadStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming file" });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get file metadata
router.get("/:fileId/info", async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }

    const fileMetadata = await getFileMetadata(fileId);
    if (!fileMetadata) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({
      id: fileMetadata._id,
      filename: fileMetadata.filename,
      contentType: fileMetadata.contentType,
      length: fileMetadata.length,
      uploadDate: fileMetadata.uploadDate,
      metadata: fileMetadata.metadata,
    });
  } catch (error) {
    console.error("Error getting file info:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

