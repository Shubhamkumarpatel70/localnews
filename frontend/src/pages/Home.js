import React, { useState, useEffect } from "react";
import NewsCard from "../components/NewsCard";
import VideoCard from "../components/VideoCard";
import CommunityPostCard from "../components/CommunityPostCard";
import CommentModal from "../components/CommentModal";
import PopupModal from "../components/PopupModal";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { get, post } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function LiveCard({ live }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm mb-5 p-5 flex flex-col items-center border-2 border-orange-600">
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden mb-3">
        <video
          src={live.url}
          poster={live.thumbnail}
          controls
          className="w-full h-full object-cover bg-black"
        />
        <span className="absolute top-2 left-2 bg-orange-600 text-white rounded-md px-2.5 py-0.5 font-semibold text-sm flex items-center gap-1">
          <LiveTvIcon fontSize="small" /> LIVE
        </span>
      </div>
      <h2 className="text-orange-600 text-lg font-semibold m-0">
        {live.title}
      </h2>
      <div className="text-gray-900 text-sm mt-1.5">
        By {live.author?.username || "Unknown"} &bull; {live.viewers} viewers
      </div>
      <div className="text-gray-900 text-sm mt-0.5">
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
          url: video.isLive ? null : (video.path || `/api/files/${video._id}`), // Use path from backend or fallback to GridFS URL
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
    } else if (type === "community") {
      try {
        const communityItem = feed.find((item) => item._id === id);
        const endpoint = `/api/community/${id}/save`;
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
        setModalMessage("Failed to save community post");
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
    <div className="pt-14 pb-20 px-4 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome to Local News</h1>
        <p className="text-indigo-100">Stay updated with the latest news and videos in your area.</p>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        {hashtags.length === 0 ? (
          <span className="text-gray-600">
            No trending hashtags
          </span>
        ) : (
          hashtags.map(({ tag }) => (
            <span
              key={tag}
              className={`font-semibold text-lg cursor-pointer transition-colors duration-200 ${
                hoveredTag === tag ? "text-orange-500" : "text-orange-600"
              }`}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              #{tag}
            </span>
          ))
        )}
      </div>
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200 mb-4 -mx-4 px-4 pb-2 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              filter === f.key 
                ? "bg-indigo-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-2xl bg-gray-100 shadow-sm animate-pulse"
              />
            ))
          : Object.entries(grouped).map(
              ([type, items]) =>
                items.length > 0 && (
                  <React.Fragment key={type}>
                    <div className="col-span-full font-bold text-xl text-indigo-600 my-4">
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
        className="fixed bottom-24 right-6 bg-orange-600 text-white border-none rounded-full w-15 h-15 shadow-lg flex items-center justify-center text-3xl z-50 hover:bg-orange-700 transition-colors"
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
