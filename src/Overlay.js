import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Overlay.css";

export default function Overlay() {
  const [followers, setFollowers] = useState(0);
  const [previousFollowers, setPreviousFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [auraColor, setAuraColor] = useState("");
  const [bubbles, setBubbles] = useState([]);
  const [flash, setFlash] = useState(false);
  const [lastFollower, setLastFollower] = useState(null);
  const numberRef = useRef(null);

  // === URL PARAMS ===
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user") || "hyghman";
  const customColor = decodeURIComponent(params.get("color") || "#00ffaa");
  const showProfile =
    params.get("showProfilePicture") === "true" ||
    params.get("showProfilePicture") === "yes";
  const useGoal =
    params.get("useGoal") === "true" || params.get("useGoal") === "yes";
  const goal = parseInt(params.get("goal")) || 10000;
  const useMock = params.get("mock") === "true";

  // === FETCH FOLLOWERS & LAST FOLLOWER ===
  const fetchFollowers = useCallback(async () => {
    try {
      // 1️⃣ Kick API v2 — followers total
      const channelRes = await fetch(`https://kick.com/api/v2/channels/${user}`);
      const channelData = await channelRes.json();

      const followersCount =
        channelData?.followers_count ||
        channelData?.followersCount ||
        channelData?.follower_count ||
        0;

      setFollowers(followersCount);
      setProfilePic(channelData?.user?.profile_pic || "");

      // 2️⃣ Fetch last follower (real sau mock)
      const endpoint = useMock
        ? "/api/mock-followers"
        : `/api/last-follower?user=${user}`;

      const followersRes = await fetch(endpoint);
      const followersData = await followersRes.json();

      if (Array.isArray(followersData) && followersData.length > 0) {
        const newFollower = followersData[0].user;
        if (newFollower.username !== lastFollower?.username) {
          setLastFollower(newFollower);
        }
      }
    } catch (err) {
      console.error("❌ Kick API fetch failed:", err);
    }
  }, [user, lastFollower, useMock]);

  // === INTERVAL UPDATE ===
  useEffect(() => {
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 8000); // update la 8 secunde
    return () => clearInterval(interval);
  }, [fetchFollowers]);

  // === FOLLOW / UNFOLLOW ANIMATION ===
  useEffect(() => {
    if (followers === 0 && previousFollowers === 0) return;

    if (followers > previousFollowers) {
      setAuraColor(`${customColor}50`);
      spawnBubbles(customColor);
      triggerFlash("green");
    } else if (followers < previousFollowers) {
      setAuraColor("rgba(255, 60, 60, 0.4)");
      spawnBubbles("rgba(255, 60, 60, 0.8)");
      triggerFlash("red");
    }

    const timer = setTimeout(() => setAuraColor(`${customColor}30`), 1200);
    setPreviousFollowers(followers);
    return () => clearTimeout(timer);
  }, [followers, previousFollowers, customColor]);

  const triggerFlash = (type) => {
    setFlash(type);
    setTimeout(() => setFlash(false), 400);
  };

  const spawnBubbles = (color) => {
    if (!numberRef.current) return;
    const rect = numberRef.current.getBoundingClientRect();

    for (let i = 0; i < 20; i++) {
      const id = Math.random().toString(36).substring(2, 9);
      const offsetX = rect.left + Math.random() * rect.width;
      const offsetY = rect.top + Math.random() * rect.height;
      const size = 6 + Math.random() * 14;
      const duration = 2 + Math.random() * 2;
      const directionX = (Math.random() - 0.5) * 150;
      const directionY = -200 - Math.random() * 100;

      const bubble = {
        id,
        color,
        x: offsetX,
        y: offsetY,
        size,
        duration,
        directionX,
        directionY,
      };

      setBubbles((prev) => [...prev, bubble]);
      setTimeout(
        () => setBubbles((prev) => prev.filter((b) => b.id !== id)),
        duration * 1000
      );
    }
  };

  const progress = Math.min((followers / goal) * 100, 100);

  return (
    <div
      className="overlay-container"
      style={{ "--main-color": customColor, "--goal-color": customColor }}
    >
      {/* AURA */}
      <div
        className={`aura ${flash ? "aura-flash" : ""}`}
        style={{
          background: `radial-gradient(circle, ${
            auraColor || `${customColor}30`
          }, transparent 70%)`,
        }}
      ></div>

      {/* PROFILE PIC */}
      {showProfile && profilePic && (
        <img src={profilePic} alt="pfp" className="pfp" draggable="false" />
      )}

      {/* FOLLOWER COUNT */}
      <div
        ref={numberRef}
        className={`followers-count ${flash ? `flash-${flash}` : ""} ${
          showProfile ? "" : "no-pfp"
        }`}
      >
        {followers.toLocaleString()}
      </div>

      {/* GOAL BAR */}
      {useGoal && (
        <div className="goal-container">
          <div
            className="goal-bar"
            style={{
              width: `${progress}%`,
              backgroundColor: customColor,
            }}
          ></div>
          <div className="goal-text">
            {followers.toLocaleString()} / {goal.toLocaleString()}
          </div>
        </div>
      )}

      {/* LAST FOLLOWER */}
      {lastFollower && (
        <div className="last-follower">
          <span>Last Follow:</span>
          {lastFollower.profile_pic && (
            <img
              src={lastFollower.profile_pic}
              alt="last follower"
              className="last-follower-pfp"
              draggable="false"
            />
          )}
          <strong>{lastFollower.username}</strong>
        </div>
      )}

      {/* BUBBLE LAYER */}
      <div className="bubble-layer">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="bubble"
            style={{
              left: `${b.x}px`,
              top: `${b.y}px`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              backgroundColor: b.color,
              animationDuration: `${b.duration}s`,
              "--dx": `${b.directionX}px`,
              "--dy": `${b.directionY}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
