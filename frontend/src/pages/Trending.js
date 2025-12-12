import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { get, post } from "../utils/api";
import NewsCard from "../components/NewsCard";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import FilterListIcon from "@mui/icons-material/FilterList";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ScheduleIcon from "@mui/icons-material/Schedule";
import RefreshIcon from "@mui/icons-material/Refresh";

const TIME_FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

const SORT_OPTIONS = [
  { label: "Trending", value: "trending", icon: TrendingUpIcon },
  { label: "Most Liked", value: "likes", icon: FavoriteIcon },
  { label: "Most Comments", value: "comments", icon: ChatBubbleIcon },
  { label: "Most Views", value: "views", icon: VisibilityIcon },
  { label: "Newest", value: "newest", icon: ScheduleIcon },
];

export default function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentlyPlayingVideoId, setCurrentlyPlayingVideoId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullToRefreshY, setPullToRefreshY] = useState(0);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const { isAuthenticated, user } = useAuth();

  // Calculate engagement score for trending
  const calculateEngagementScore = useCallback((video) => {
    const likes = Array.isArray(video.likes) ? video.likes.length : (video.likes || 0);
    const comments = Array.isArray(video.comments) ? video.comments.length : (video.comments || 0);
    const views = video.views || 0;
    // Weighted score: likes (3x), comments (2x), views (1x)
    return likes * 3 + comments * 2 + views;
  }, []);

  // Filter videos by time period
  const filterByTime = useCallback((videos, timeFilter) => {
    if (timeFilter === "all") return videos;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeFilter) {
      case "today":
        cutoff.setHours(0, 0, 0, 0);
        break;
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      default:
        return videos;
    }
    
    return videos.filter((video) => {
      const videoDate = new Date(video.uploadDate || video.createdAt);
      return videoDate >= cutoff;
    });
  }, []);

  // Sort videos based on selected option
  const sortVideos = useCallback((videos, sortBy) => {
    const sorted = [...videos];
    
    switch (sortBy) {
      case "trending":
        return sorted.sort((a, b) => {
          const scoreA = calculateEngagementScore(a);
          const scoreB = calculateEngagementScore(b);
          return scoreB - scoreA;
        });
      case "likes":
        return sorted.sort((a, b) => {
          const likesA = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
          const likesB = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
          return likesB - likesA;
        });
      case "comments":
        return sorted.sort((a, b) => {
          const commentsA = Array.isArray(a.comments) ? a.comments.length : (a.comments || 0);
          const commentsB = Array.isArray(b.comments) ? b.comments.length : (b.comments || 0);
          return commentsB - commentsA;
        });
      case "views":
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.uploadDate || a.createdAt);
          const dateB = new Date(b.uploadDate || b.createdAt);
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  }, [calculateEngagementScore]);

  const [allVideos, setAllVideos] = useState([]); // Store all fetched videos

  const fetchTrendingVideos = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setError(null);
        }
        const response = await get(`/api/videos?page=${pageNum}&limit=20`);

        const transformedVideos = (response.videos || []).map((video) => ({
          ...video,
          type: "video",
          url: video.path || `/api/files/${video._id}`, // Use path from backend or fallback to GridFS URL
          thumbnail:
            video.thumbnail ||
            `https://picsum.photos/400/600?random=${video._id}`,
          author: video.uploadedBy,
          createdAt: video.uploadDate,
          // Fix: Check if current user liked the video, not the author
          liked: isAuthenticated && user
            ? (Array.isArray(video.likes) ? video.likes.includes(user._id) : false)
            : false,
          saved: false,
          views: video.views || 0,
        }));

        // Store all videos (for filtering/sorting client-side)
        setAllVideos((prev) =>
          reset ? transformedVideos : [...prev, ...transformedVideos]
        );
        setHasMore(transformedVideos.length === 20);
      } catch (error) {
        console.error("Error fetching trending videos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated, user]
  );

  // Apply filters and sorting to all videos
  useEffect(() => {
    let filtered = filterByTime(allVideos, timeFilter);
    filtered = sortVideos(filtered, sortBy);
    setVideos(filtered);
    // Reset scroll position when filters change
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [allVideos, timeFilter, sortBy, filterByTime, sortVideos]);

  // Use videos directly (already filtered and sorted)
  const displayVideos = videos;

  // Initial fetch
  useEffect(() => {
    fetchTrendingVideos(1, true);
  }, [fetchTrendingVideos]);

  // Debounced infinite scroll
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const el = containerRef.current || document.documentElement;
        if (
          el.scrollHeight - el.scrollTop - el.clientHeight < 300 &&
          !loading &&
          !refreshing &&
          hasMore
        ) {
          setPage((prev) => {
            const next = prev + 1;
            fetchTrendingVideos(next, false);
            return next;
          });
        }
      }, 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [loading, refreshing, hasMore, fetchTrendingVideos]);

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
            const diff = Math.abs(rect.top - 80);
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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [displayVideos.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const videoElements = Array.from(el.querySelectorAll(".trending-video-snap"));
    if (videoElements[currentIndex] && currentIndex < videoElements.length) {
      videoElements[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentIndex, displayVideos.length]);

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      alert("Please login to like videos");
      return;
    }

    try {
      const response = await post(`/api/videos/${id}/like`, {});
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
    if (type === "video") {
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
    // Comment functionality is handled by VideoCard component
  };

  // Pull to refresh handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0 && window.scrollY === 0) {
      setPullToRefreshY(Math.min(diff, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullToRefreshY > 50 && !refreshing && !loading) {
      setRefreshing(true);
      setPage(1);
      fetchTrendingVideos(1, true);
    }
    setPullToRefreshY(0);
    touchStartY.current = 0;
  };

  return (
    <div
      className="min-h-screen overflow-y-auto bg-black"
      ref={containerRef}
      style={{ 
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth"
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullToRefreshY > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center bg-indigo-600 text-white py-4 z-50 transition-transform duration-200"
          style={{
            transform: `translateY(${pullToRefreshY - 80}px)`,
            height: 80,
          }}
        >
          <RefreshIcon
            className={`animate-spin ${refreshing ? "" : ""}`}
            style={{ fontSize: 24 }}
          />
          <span className="ml-2 font-semibold">
            {refreshing ? "Refreshing..." : "Pull to refresh"}
          </span>
        </div>
      )}

      {/* Minimal header - YouTube Shorts style */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md"
        style={{ 
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div className="flex items-center gap-2">
          <WhatshotIcon style={{ color: "#ff0000", fontSize: 28 }} />
          <h1 className="text-white font-bold text-lg">Shorts</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Filter options"
          style={{ color: "#fff" }}
        >
          <FilterListIcon />
        </button>
      </div>

      {/* Filter panel - Slide down from top */}
      {showFilters && (
        <div 
          className="fixed top-14 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10"
          style={{
            padding: "1.5rem",
            animation: "slideDown 0.3s ease-out"
          }}
        >
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          {/* Time filter */}
          <div style={{ marginBottom: "1rem" }}>
            <p className="text-sm font-semibold mb-2" style={{ color: "#fff" }}>Time Period</p>
            <div className="flex flex-wrap gap-2">
              {TIME_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTimeFilter(filter.value)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: timeFilter === filter.value ? "#ff0000" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort options */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "#fff" }}>Sort By</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      transition: "all 0.2s",
                      background: sortBy === option.value ? "#ff0000" : "rgba(255,255,255,0.1)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <Icon style={{ fontSize: 18 }} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading && displayVideos.length === 0 ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading trending videos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center shadow-sm">
          <p className="font-semibold text-lg mb-2">Error loading videos</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchTrendingVideos(1, true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : displayVideos.length === 0 ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center text-gray-500">
            <WhatshotIcon className="text-6xl mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold mb-2">No trending videos</p>
            <p className="text-sm">
              {timeFilter !== "all"
                ? `No videos found for ${TIME_FILTERS.find((f) => f.value === timeFilter)?.label.toLowerCase()}`
                : "Check back later for trending content"}
            </p>
          </div>
        </div>
      ) : (
        <div 
          className="w-full"
          style={{ 
            paddingTop: showFilters ? "200px" : "60px",
            paddingBottom: "20px"
          }}
        >
          {displayVideos.map((video, idx) => (
            <div
              key={video._id}
              className="trending-video-snap"
              style={{ 
                scrollSnapAlign: "start",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                width: "100%",
                maxWidth: "100%"
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  height: "calc(100vh - 80px)",
                  position: "relative",
                  margin: "0 auto"
                }}
              >
                <VideoCard
                  video={video}
                  isPlaying={currentIndex === idx}
                  setCurrentlyPlayingVideoId={setCurrentlyPlayingVideoId}
                  currentlyPlayingVideoId={currentlyPlayingVideoId}
                  shortsStyle={true}
                  shortsRatio="9/16"
                  onLike={() => handleLike(video._id)}
                  onSave={() => handleSave(video._id, "video")}
                  onShare={() => handleShare(video._id)}
                  onComment={() => handleComment(video._id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading more indicator */}
      {loading && displayVideos.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span className="text-sm font-medium">Loading more videos...</span>
          </div>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && displayVideos.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px bg-gray-300 flex-1 max-w-20"></div>
            <p className="text-sm font-medium">You've reached the end!</p>
            <div className="h-px bg-gray-300 flex-1 max-w-20"></div>
          </div>
        </div>
      )}
    </div>
  );
}
