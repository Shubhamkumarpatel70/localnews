const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Instrument app and router registration to log path arguments so we can
// identify any unexpected route strings (like full URLs) that cause
// path-to-regexp parse errors during startup on remote hosts.
try {
  const origAppUse = app.use.bind(app);
  app.use = function (...args) {
    try {
      if (args && args.length) {
        console.log("[app.use] mounting path:", String(args[0]).slice(0, 200));
      }
    } catch (e) {}
    return origAppUse(...args);
  };

  const Router = require("express").Router;
  ["use", "get", "post", "put", "delete", "patch", "all"].forEach((m) => {
    const orig = Router.prototype[m];
    if (!orig) return;
    Router.prototype[m] = function (...args) {
      try {
        if (args && args.length) {
          console.log(`[router.${m}]`, String(args[0]).slice(0, 200));
        }
      } catch (e) {}
      return orig.apply(this, args);
    };
  });
} catch (e) {
  // ignore instrumentation failures
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

function safeMount(path, routePath) {
  try {
    console.log(`Mounting ${routePath} -> ${path}`);
    const routes = require(routePath);
    app.use(path, routes);
  } catch (err) {
    console.error(
      `Error mounting ${routePath} at ${path}:`,
      err && err.message ? err.message : err
    );
    throw err;
  }
}

safeMount("/api/auth", "./routes/auth");
safeMount("/api/news", "./routes/news");
safeMount("/api/user", "./routes/user");
safeMount("/api/notifications", "./routes/notifications");
safeMount("/api/comments", "./routes/comments");
safeMount("/api/videos", "./routes/videos");
safeMount("/api/posts", "./routes/posts");
safeMount("/api/community", "./routes/community");
safeMount("/api/files", "./routes/files");
safeMount("/api/admin", "./routes/admin");

app.use(express.static(path.join(__dirname, "..", "frontend", "build")));

// Serve React app's index.html for any GET request that is not an API or
// uploads asset request. Use a function middleware (no string path) so we
// don't pass a wildcard string like '/*' into the path parser (which can
// throw in some environments / versions of path-to-regexp).
app.use((req, res, next) => {
  // Only handle GET requests that likely want HTML.
  if (req.method !== "GET") return next();

  const accept = req.headers && req.headers.accept ? req.headers.accept : "";
  if (!accept.includes("text/html")) return next();

  // Let API and static uploads routes be handled by their routers/static
  // middleware above.
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }

  // Send the SPA entrypoint.
  res.sendFile(
    path.join(__dirname, "..", "frontend", "build", "index.html"),
    (err) => {
      if (err) return next(err);
    }
  );
});

// TODO: Add routes here

module.exports = app;
