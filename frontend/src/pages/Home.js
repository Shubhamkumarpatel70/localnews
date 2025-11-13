import React, { useState, useEffect } from "react";
import NewsCard from "../components/NewsCard";
import VideoCard from "../components/VideoCard";
import CommunityPostCard from "../components/CommunityPostCard";
import CommentModal from "../components/CommentModal";
import PopupModal from "../components/PopupModal";
import "./Home.css";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { get, post } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function LiveCard({ live }) {
  return (
    <div
      className="live-card"
      style={{
        background: "var(--background-color)",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        marginBottom: "1.2rem",
        padding: "1.2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "2px solid var(--accent-color)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          aspectRatio: "16/9",
          background: "#000",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <video
          src={live.url}
          poster={live.thumbnail}
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: "#000",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "var(--accent-color)",
            color: "var(--background-color)",
            borderRadius: 6,
            padding: "2px 10px",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <LiveTvIcon fontSize="small" /> LIVE
        </span>
      </div>
      <h2
        style={{ color: "var(--accent-color)", fontSize: "1.1rem", margin: 0 }}
      >
        {live.title}
      </h2>
      <div
        style={{
          color: "var(--text-color)",
          fontSize: 15,
          margin: "6px 0 0 0",
        }}
      >
        By {live.author?.username || "Unknown"} &bull; {live.viewers} viewers
      </div>
      <div style={{ color: "var(--text-color)", fontSize: 14, marginTop: 2 }}>
        {new Date(live.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "post", label: "Posts" },
  { key: "video", label: "Videos" },
  { key: "live", label: "Live" },
  { key: "community", label: "Community" },
];

export default function Home() {
  const [feed, setFeed] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentlyPlayingVideoId, setCurrentlyPlayingVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [hashtags, setHashtags] = useState([]);
  const [commentModal, setCommentModal] = useState({
    isOpen: false,
    postId: null,
    postType: null,
  });
  const [modalMessage, setModalMessage] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch posts, videos, and community posts in parallel
        const [postsResponse, videosResponse, communityResponse] =
          await Promise.all([
            get("/api/posts"),
            get("/api/videos"),
            get("/api/community"),
          ]);

        // Transform posts
        const posts = (postsResponse.posts || []).map((post) => ({
          ...post,
          type: "post",
          liked: isAuthenticated
            ? post.likes?.includes(post.author?._id)
            : false,
          saved: false, // TODO: Implement saved functionality
        }));

        // Transform videos
        const videos = (videosResponse.videos || []).map((video) => ({
          ...video,
          type: video.isLive ? "live" : "video",
          url: video.isLive ? null : `/uploads/videos/${video.filename}`,
          thumbnail:
            video.thumbnail ||
            "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
          liked: isAuthenticated
            ? video.likes?.includes(video.uploadedBy?._id)
            : false,
          saved: false,
        }));

        // Transform community posts
        const communityPosts = (communityResponse.posts || []).map((post) => ({
          ...post,
          type: "community",
          liked: isAuthenticated
            ? post.likes?.includes(post.author?._id)
            : false,
          saved: false,
        }));

        // Combine all data and sort by creation date
        const allData = [...posts, ...videos, ...communityPosts].sort(
          (a, b) =>
            new Date(b.createdAt || b.uploadDate) -
            new Date(a.createdAt || a.uploadDate)
        );

        setFeed(allData);
      } catch (error) {
        console.error("Error fetching feed data:", error);
        setFeed([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const [postTags, videoTags, communityTags] = await Promise.all([
          get("/api/posts/top-tags"),
          get("/api/videos/top-tags"),
          get("/api/community/top-tags"),
        ]);
        // Merge and count tags
        const tagMap = {};
        [...postTags, ...videoTags, ...communityTags].forEach(
          ({ tag, count }) => {
            if (!tag) return;
            tagMap[tag] = (tagMap[tag] || 0) + count;
          }
        );
        const sorted = Object.entries(tagMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }));
        setHashtags(sorted);
      } catch (e) {
        setHashtags([]);
      }
    }
    fetchTags();
  }, []);

  const handleLike = async (id, type) => {
    if (!isAuthenticated) {
      setModalMessage("Please login to like content");
      return;
    }

    try {
      let endpoint = "";
      switch (type) {
        case "post":
          endpoint = `/api/posts/${id}/like`;
          break;
        case "video":
          endpoint = `/api/videos/${id}/like`;
          break;
        case "community":
          endpoint = `/api/community/${id}/like`;
          break;
        default:
          return;
      }

      const response = await post(endpoint, {});

      // Update local state
      setFeed((feed) =>
        feed.map((item) =>
          item._id === id
            ? { ...item, liked: response.liked, likes: response.likesCount }
            : item
        )
      );
    } catch (error) {
      console.error("Error liking content:", error);
      setModalMessage("Failed to like content");
    }
  };

  const handleSave = async (id, type) => {
    if (!isAuthenticated) {
      setModalMessage("Please login to save content");
      return;
    }
    if (type === "post") {
      try {
        const postItem = feed.find((item) => item._id === id);
        const endpoint = `/api/posts/${id}/${
          postItem.saved ? "unsave" : "save"
        }`;
        const response = await post(endpoint, {});
        setFeed((feed) =>
          feed.map((item) =>
            item._id === id
              ? {
                  ...item,
                  saved: response.saved,
                  savedCount: response.savedCount,
                }
              : item
          )
        );
      } catch (error) {
        setModalMessage("Failed to save post");
      }
    } else if (type === "video") {
      try {
        const videoItem = feed.find((item) => item._id === id);
        const endpoint = `/api/videos/${id}/save`;
        const response = await post(endpoint, {});
        setFeed((feed) =>
          feed.map((item) =>
            item._id === id
              ? {
                  ...item,
                  saved: response.saved,
                  savedCount: response.savedCount,
                }
              : item
          )
        );
      } catch (error) {
        setModalMessage("Failed to save video");
      }
    } else if (type === "news") {
      try {
        const newsItem = feed.find((item) => item._id === id);
        const endpoint = `/api/news/${id}/save`;
        const response = await post(endpoint, {});
        setFeed((feed) =>
          feed.map((item) =>
            item._id === id
              ? {
                  ...item,
                  saved: response.saved,
                  savedCount: response.savedCount,
                }
              : item
          )
        );
      } catch (error) {
        setModalMessage("Failed to save news");
      }
    } else {
      setModalMessage(
        "Save feature is not available for this content type yet."
      );
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/post/${id}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this post",
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setModalMessage("Link copied to clipboard!");
    }
  };

  const handleComment = (id, type) => {
    if (!isAuthenticated) {
      setModalMessage("Please login to comment");
      return;
    }
    setCommentModal({ isOpen: true, postId: id, postType: type });
  };

  const handleCommentSubmit = (comment) => {
    // Handle comment submission if needed
    console.log("Comment submitted:", comment);
  };

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, postId: null, postType: null });
  };

  const filteredFeed =
    filter === "all" ? feed : feed.filter((item) => item.type === filter);

  // Group by type for section titles
  const grouped =
    filter === "all"
      ? {
          post: filteredFeed.filter((i) => i.type === "post"),
          video: filteredFeed.filter((i) => i.type === "video"),
          live: filteredFeed.filter((i) => i.type === "live"),
          community: filteredFeed.filter((i) => i.type === "community"),
        }
      : { [filter]: filteredFeed };

  return (
    <div className="home-page">
      <div className="home-banner">
        <h1>Welcome to Local News</h1>
        <p>Stay updated with the latest news and videos in your area.</p>
      </div>
      <div
        className="trending-tags"
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}
      >
        {hashtags.length === 0 ? (
          <span style={{ color: "var(--text-color)" }}>
            No trending hashtags
          </span>
        ) : (
          hashtags.map(({ tag }) => (
            <span
              key={tag}
              style={{
                color: hoveredTag === tag ? "#ff6b35" : "var(--accent-color)",
                fontWeight: 600,
                fontSize: 18,
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              #{tag}
            </span>
          ))
        )}
      </div>
      <div className="home-filters sticky-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? "active" : ""}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="news-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="card-skeleton"
                style={{
                  height: 220,
                  borderRadius: 16,
                  background: "#f5f5f5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              />
            ))
          : Object.entries(grouped).map(
              ([type, items]) =>
                items.length > 0 && (
                  <React.Fragment key={type}>
                    <div
                      className="section-title"
                      style={{
                        gridColumn: "1/-1",
                        fontWeight: 700,
                        fontSize: 20,
                        color: "var(--primary-color)",
                        margin: "18px 0 6px 0",
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                    {items.map((item) =>
                      item.type === "post" ? (
                        <NewsCard
                          key={item._id}
                          news={item}
                          onLike={() => handleLike(item._id, item.type)}
                          onSave={() => handleSave(item._id, item.type)}
                          onShare={() => handleShare(item._id)}
                          onComment={() => handleComment(item._id, item.type)}
                          liked={item.liked}
                          saved={item.saved}
                          likesCount={item.likes}
                          savedCount={item.savedCount}
                        />
                      ) : item.type === "video" ? (
                        <VideoCard
                          key={item._id}
                          video={item}
                          onSave={() => handleSave(item._id, "video")}
                          onShare={() => handleShare(item._id)}
                          onComment={() => handleComment(item._id, "video")}
                          setModalMessage={setModalMessage}
                          isPlaying={currentlyPlayingVideoId === item._id}
                          setCurrentlyPlayingVideoId={
                            setCurrentlyPlayingVideoId
                          }
                          currentlyPlayingVideoId={currentlyPlayingVideoId}
                        />
                      ) : item.type === "live" ? (
                        <LiveCard key={item._id} live={item} />
                      ) : (
                        <CommunityPostCard
                          key={item._id}
                          post={item}
                          onLike={() => handleLike(item._id, "community")}
                          onSave={() => handleSave(item._id)}
                          onShare={() => handleShare(item._id)}
                          onComment={() => handleComment(item._id, "community")}
                        />
                      )
                    )}
                  </React.Fragment>
                )
            )}
      </div>
      <button
        className="fab-create"
        style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          background: "var(--accent-color)",
          color: "var(--background-color)",
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          boxShadow: "0 4px 16px rgba(194,65,12,0.13)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          zIndex: 200,
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        title="Create"
      >
        <AddCircleIcon fontSize="inherit" />
      </button>

      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={closeCommentModal}
        postId={commentModal.postId}
        postType={commentModal.postType}
        onCommentSubmit={handleCommentSubmit}
      />
      <PopupModal
        message={modalMessage}
        onCancel={() => setModalMessage(null)}
      />
    </div>
  );
}
