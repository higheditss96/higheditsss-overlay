import React, { useEffect, useState } from "react";
import "./Overlay.css";

export default function Overlay() {
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [latestFollower, setLatestFollower] = useState("loading...");
  const [auraColor, setAuraColor] = useState("rgba(0, 255, 170, 0.25)");
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user") || "hyghman";

  // Fetch Kick channel info
  const fetchFollowers = async () => {
    try {
      const res = await fetch(`https://kick.com/api/v1/channels/${user}`);
      const data = await res.json();
      setFollowers(data.followersCount);
      setProfilePic(data.user.profile_pic);
      setUsername(data.user.username);
    } catch (err) {
      console.error("Failed to fetch channel data", err);
    }
  };

  // Fetch recent followers
  const fetchLatestFollower = async () => {
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
  };

  // Fetch on load
  useEffect(() => {
    fetchFollowers();
    fetchLatestFollower();

    // Refresh every 15 seconds
    const interval = setInterval(() => {
      fetchFollowers();
      fetchLatestFollower();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Simple aura pulse effect when follower changes
  useEffect(() => {
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
