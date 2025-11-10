import React, { useEffect, useState, useCallback } from "react";
import "./Overlay.css";

export default function Overlay() {
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [latestFollower, setLatestFollower] = useState("loading...");
  const [auraColor, setAuraColor] = useState("rgba(0, 255, 170, 0.25)");
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user") || "hyghman";

  // Fetch Kick channel info
  const fetchFollowers = useCallback(async () => {
    try {
      const res = await fetch(`https://kick.com/api/v1/channels/${user}`);
      const data = await res.json();
      setFollowers(data.followersCount);
      setProfilePic(data.user.profile_pic);
    } catch (err) {
      console.error("Failed to fetch channel data", err);
    }
  }, [user]);

  // Fetch recent followers
  const fetchLatestFollower = useCallback(async () => {
    try {
      const res = await fetch(
        `https://kick.com/api/v2/channels/${user}/followers`
      );
      const data = await res.json();
      if (data?.data?.length > 0) {
        setLatestFollower(data.data[0].username);
      }
    } catch (err) {
      console.error("Failed to fetch latest follower", err);
    }
  }, [user]);

  // Fetch on load and refresh every 15s
  useEffect(() => {
    fetchFollowers();
    fetchLatestFollower();

    const interval = setInterval(() => {
      fetchFollowers();
      fetchLatestFollower();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchFollowers, fetchLatestFollower]);

  // Simple aura pulse effect when follower count changes
  useEffect(() => {
    if (!followers) return;
    setAuraColor("rgba(0, 255, 170, 0.45)");
    const timer = setTimeout(
      () => setAuraColor("rgba(0, 255, 170, 0.25)"),
      1200
    );
    return () => clearTimeout(timer);
  }, [followers]);

  return (
    <div className="overlay-container">
      <div
        className="aura"
        style={{
          background: `radial-gradient(circle, ${auraColor}, transparent 70%)`,
        }}
      ></div>

      {profilePic && (
        <img src={profilePic} alt="pfp" className="pfp" draggable="false" />
      )}

      <div className="followers-count">
        {followers.toLocaleString()}
      </div>

      <div className="latest-follower">
        💚 Last follow: <span>{latestFollower}</span>
      </div>
    </div>
  );
}
