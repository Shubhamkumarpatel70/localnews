import React, { useEffect, useState, useRef, useCallback } from "react";
import { get, post } from "../utils/api";
import NewsCard from "../components/NewsCard";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import "./Trending.css";

export default function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentlyPlayingVideoId, setCurrentlyPlayingVideoId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // Fetch trending videos from backend
  const fetchTrendingVideos = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        const response = await get(`/api/videos?page=${pageNum}&limit=10`);

        // Transform videos for frontend
        const transformedVideos = (response.videos || []).map((video) => ({
          ...video,
          type: "video",
          url: `/uploads/videos/${video.filename}`,
          thumbnail:
            video.thumbnail ||
            `https://picsum.photos/400/600?random=${video._id}`,
          author: video.uploadedBy,
          createdAt: video.uploadDate,
          liked: isAuthenticated
            ? video.likes?.includes(video.uploadedBy?._id)
            : false,
          saved: false,
        }));

        setVideos((prev) =>
          pageNum === 1 ? transformedVideos : [...prev, ...transformedVideos]
        );
        setHasMore(transformedVideos.length === 10); // If we got less than 10, we've reached the end
      } catch (error) {
        console.error("Error fetching trending videos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    fetchTrendingVideos(1);
  }, [fetchTrendingVideos]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current || document.documentElement;
      if (
        el.scrollHeight - el.scrollTop - el.clientHeight < 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => {
          const next = prev + 1;
          fetchTrendingVideos(next);
          return next;
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchTrendingVideos]);

  // Snap to video on scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const videos = Array.from(
            el.querySelectorAll(".trending-video-snap")
          );
          const scrollTop =
            window.scrollY || document.documentElement.scrollTop;
          let minDiff = Infinity;
          let idx = 0;
          videos.forEach((v, i) => {
            const rect = v.getBoundingClientRect();
            const diff = Math.abs(rect.top - 80); // 80px offset for navbar
            if (diff < minDiff) {
              minDiff = diff;
              idx = i;
            }
          });
          setCurrentIndex(idx);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [videos]);

  // Scroll to current video when currentIndex changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const videos = Array.from(el.querySelectorAll(".trending-video-snap"));
    if (videos[currentIndex]) {
      videos[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentIndex]);

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      alert("Please login to like videos");
      return;
    }

    try {
      const response = await post(`/api/videos/${id}/like`, {});

      // Update local state
      setVideos((videos) =>
        videos.map((video) =>
          video._id === id
            ? { ...video, liked: response.liked, likes: response.likesCount }
            : video
        )
      );
    } catch (error) {
      console.error("Error liking video:", error);
      alert("Failed to like video");
    }
  };

  const handleSave = async (id, type = "video") => {
    if (!isAuthenticated) {
      alert("Please login to save content");
      return;
    }
    if (type === "news") {
      try {
        const endpoint = `/api/news/${id}/save`;
        const response = await post(endpoint, {});
        setVideos((videos) =>
          videos.map((video) =>
            video._id === id
              ? {
                  ...video,
                  saved: response.saved,
                  savedCount: response.savedCount,
                }
              : video
          )
        );
      } catch (error) {
        alert("Failed to save news");
      }
    } else if (type === "video") {
      try {
        const endpoint = `/api/videos/${id}/save`;
        const response = await post(endpoint, {});
        setVideos((videos) =>
          videos.map((video) =>
            video._id === id
              ? {
                  ...video,
                  saved: response.saved,
                  savedCount: response.savedCount,
                }
              : video
          )
        );
      } catch (error) {
        alert("Failed to save video");
      }
    } else {
      alert("Save feature is not available for this content type yet.");
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/video/${id}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this video",
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleComment = (id) => {
    if (!isAuthenticated) {
      alert("Please login to comment");
      return;
    }
    alert("Comment functionality coming soon!");
  };

  return (
    <div
      className="trending-page"
      ref={containerRef}
      style={{
        overflowY: "auto",
        minHeight: "100vh",
        scrollSnapType: "y mandatory",
      }}
    >
      <div className="trending-banner">
        <h1>🔥 Trending Shorts</h1>
        <p>Swipe up/down to see more videos.</p>
      </div>
      {loading && videos.length === 0 ? (
        <div className="trending-loading">Loading...</div>
      ) : error ? (
        <div className="trending-error">Error: {error}</div>
      ) : videos.length === 0 ? (
        <div className="trending-empty">No trending videos.</div>
      ) : (
        <div
          className="trending-videos-list"
          style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}
        >
          {videos.map((video, idx) => (
            <div
              key={video._id}
              className="trending-video-snap"
              style={{
                minHeight: "calc(100vh - 80px)",
                scrollSnapAlign: "start",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VideoCard
                video={video}
                isPlaying={currentIndex === idx}
                setCurrentlyPlayingVideoId={setCurrentlyPlayingVideoId}
                currentlyPlayingVideoId={currentlyPlayingVideoId}
                shortsStyle={true}
                shortsRatio="9/15"
                onLike={() => handleLike(video._id)}
                onSave={() => handleSave(video._id, "video")}
                onShare={() => handleShare(video._id)}
                onComment={() => handleComment(video._id)}
              />
            </div>
          ))}
        </div>
      )}
      {loading && videos.length > 0 && (
        <div className="trending-loading">Loading more...</div>
      )}
      {!hasMore && (
        <div className="trending-empty">No more trending videos.</div>
      )}
    </div>
  );
}
