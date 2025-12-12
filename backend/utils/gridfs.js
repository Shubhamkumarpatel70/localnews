const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gfs;

// Initialize GridFS
const initGridFS = () => {
  const conn = mongoose.connection;
  gfs = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  return gfs;
};

// Get GridFS instance
const getGridFS = () => {
  if (!gfs) {
    gfs = initGridFS();
  }
  return gfs;
};

// Upload file to GridFS
const uploadFile = (fileBuffer, filename, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const gfs = getGridFS();
    const uploadStream = gfs.openUploadStream(filename, {
      metadata: metadata,
    });

    uploadStream.on("error", (error) => {
      reject(error);
    });

    uploadStream.on("finish", () => {
      resolve({
        id: uploadStream.id,
        filename: filename,
      });
    });

    uploadStream.end(fileBuffer);
  });
};

// Get file from GridFS by ID
const getFileById = (fileId) => {
  const gfs = getGridFS();
  // Handle both string and ObjectId
  const objectId = typeof fileId === 'string' 
    ? new mongoose.Types.ObjectId(fileId)
    : fileId;
  return gfs.openDownloadStream(objectId);
};

// Get file from GridFS by filename
const getFileByFilename = (filename) => {
  const gfs = getGridFS();
  return gfs.openDownloadStreamByName(filename);
};

// Delete file from GridFS
const deleteFile = (fileId) => {
  return new Promise((resolve, reject) => {
    const gfs = getGridFS();
    const objectId = typeof fileId === 'string' 
      ? new mongoose.Types.ObjectId(fileId)
      : fileId;
    gfs.delete(objectId, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// Get file metadata
const getFileMetadata = async (fileId) => {
  const gfs = getGridFS();
  const objectId = typeof fileId === 'string' 
    ? new mongoose.Types.ObjectId(fileId)
    : fileId;
  const files = await gfs
    .find({ _id: objectId })
    .toArray();
  return files[0] || null;
};

module.exports = {
  initGridFS,
  getGridFS,
  uploadFile,
  getFileById,
  getFileByFilename,
  deleteFile,
  getFileMetadata,
};

