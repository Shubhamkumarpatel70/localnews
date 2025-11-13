import React, { useState, useEffect } from "react";
export default function CreateLive() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

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
        // Redirect to home or live stream page
        window.location.href = "/";
      } else {
        const error = await response.json();
        alert(`Failed to start live stream: ${error.message}`);
      }
    } catch (error) {
      console.error("Live stream error:", error);
      alert("Failed to start live stream. Please try again.");
    }
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        paddingBottom: "70px",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <h2>Go Live</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Location</label>
          <br />
          <input
            type="text"
            value={loadingLocation ? "Fetching location..." : location}
            readOnly
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#f5f5f5",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            background: "#B71C1C",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
          }}
        >
          Start Live
        </button>
      </form>
    </div>
  );
}
