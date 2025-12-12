const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env early so any code that reads process.env gets values
dotenv.config(); // Load environment variables from .env file

// Instrument path-to-regexp parse to log the path being parsed when starting
// the server. This helps identify which route string causes parsing errors
// during startup on remote deploys where an unexpected value may be used.
try {
  const ptr = require("path-to-regexp");
  if (ptr && typeof ptr.parse === "function") {
    const orig = ptr.parse;
    ptr.parse = function (str, opts) {
      try {
        console.log(
          "[debug] path-to-regexp.parse input:",
          String(str).slice(0, 200)
        );
      } catch (e) {}
      return orig.call(this, str, opts);
    };
  }
} catch (e) {
  // ignore if module not found or cannot be patched
}

const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/localnews";

// Helper to mask credentials when logging the URI (don't leak secrets)
function maskMongoUri(uri) {
  try {
    // Replace user:pass@ with ***:***@ to avoid leaking credentials in logs
    return uri.replace(/:\/\/(.*@)/, "://***:***@");
  } catch (e) {
    return uri;
  }
}

console.log("Using MONGO_URI:", maskMongoUri(MONGO_URI));

// Note: options like useNewUrlParser/useUnifiedTopology are ignored by
// the MongoDB Node driver v4+. Keep the connect call simple and let mongoose
// use sensible defaults for current drivers.
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Initialize GridFS after connection
    const { initGridFS } = require("./utils/gridfs");
    initGridFS();
    console.log("GridFS initialized");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Helpful hint for common Atlas issues
    console.error(
      "Hint: If you are using MongoDB Atlas, make sure the cluster allows connections from your deployment IP range (Network Access -> IP Access List)."
    );
  });
