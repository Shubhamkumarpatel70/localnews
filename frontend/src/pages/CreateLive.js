import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function CreateLive() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
          setLoadingLocation(false);
        },
        (err) => {
          setLocation("");
          setLoadingLocation(false);
        }
      );
    } else {
      setLocation("");
      setLoadingLocation(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to start live stream");
        return;
      }

      const response = await fetch("/api/videos/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, location }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Live stream started successfully!");
        navigate("/");
      } else {
        const error = await response.json();
        alert(`Failed to start live stream: ${error.message}`);
      }
    } catch (error) {
      console.error("Live stream error:", error);
      alert("Failed to start live stream. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-14 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <LiveTvIcon className="text-4xl text-red-600" />
            <h2 className="text-3xl font-bold text-gray-900">Go Live</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                placeholder="Enter live stream title"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <LocationOnIcon className="text-red-600" />
                Location
              </label>
              <input
                type="text"
                value={loadingLocation ? "Fetching location..." : location}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg border-none cursor-pointer transition-all duration-300 shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <LiveTvIcon />
                  <span>Start Live</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
