import React, { useEffect, useState } from "react";
import { get, post } from "../utils/api";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import ShareIcon from "@mui/icons-material/Share";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const typeIcons = {
  like: <FavoriteIcon className="text-red-600" />,
  comment: <ChatBubbleIcon className="text-blue-600" />,
  follow: <PersonAddIcon className="text-blue-600" />,
  upload: <FiberNewIcon className="text-red-700" />,
  share: <ShareIcon className="text-red-600" />,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    get("/api/notifications")
      .then(setNotifications)
      .catch((e) => {
        console.error("Error fetching notifications:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  };

  const markAllAsRead = async () => {
    setMarking(true);
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => post(`/api/notifications/${n._id}/read`, {}))
      );
      fetchNotifications();
    } catch {}
    setMarking(false);
  };

  const markAsRead = async (id) => {
    try {
      await post(`/api/notifications/${id}/read`, {});
      fetchNotifications();
    } catch {}
  };

  return (
    <div className="pt-14 pb-20 px-4 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-b-3xl p-8 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NotificationsIcon className="text-4xl" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          {notifications.length > 0 && notifications.some(n => !n.read) && (
            <button
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
              onClick={markAllAsRead}
              disabled={marking}
            >
              <DoneAllIcon />
              {marking ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
          <p className="font-semibold">Error loading notifications</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <NotificationsIcon className="text-6xl text-gray-300 mb-4" />
          <p className="text-xl text-gray-600">No notifications yet</p>
          <p className="text-gray-500 mt-2">You'll see updates here when you get likes, comments, and more!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && markAsRead(n._id)}
              className={`p-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer ${
                n.read
                  ? "bg-gray-50 border border-gray-200"
                  : "bg-white border-2 border-purple-200 shadow-lg"
              } hover:shadow-xl`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  n.read ? "bg-gray-100" : "bg-purple-100"
                }`}>
                  {typeIcons[n.type] || <NotificationsIcon className="text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    n.read ? "text-gray-600" : "text-gray-900"
                  }`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <div className="flex-shrink-0 w-3 h-3 bg-purple-600 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
