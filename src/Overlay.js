import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Overlay.css";

export default function Overlay() {
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [lastFollower, setLastFollower] = useState(null);
  const [previousFollowers, setPreviousFollowers] = useState(0);
  const [auraColor, setAuraColor] = useState("");
  const [bubbles, setBubbles] = useState([]);
  const [flash, setFlash] = useState(false);
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

  // === FETCH DATA ===
  const fetchFollowers = useCallback(async () => {
    try {
      // followers count
      const res = await fetch(`https://kick.com/api/v2/channels/${user}`);
      const data = await res.json();

      const followersCount =
        data?.followers_count || data?.follower_count || data?.followersCount || 0;

      setFollowers(followersCount);
      setProfilePic(data?.user?.profile_pic || "");

      // last follower (mock or real)
      const endpoint = useMock
        ? "/api/mock-followers"
        : `/api/last-follower?user=${user}`;
      const res2 = await fetch(endpoint);
      const data2 = await res2.json();

      if (Array.isArray(data2) && data2.length > 0) {
        const follower = data2[0].user;
        if (follower?.username !== lastFollower?.username) {
          setLastFollower(follower);
        }
      }
    } catch (err) {
      console.error("Failed to fetch Kick data:", err);
    }
  }, [user, lastFollower, useMock]);

  // update interval
  useEffect(() => {
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 8000);
    return () => clearInterval(interval);
  }, [fetchFollowers]);

  // animation on follow change
  useEffect(() => {
    if (followers > previousFollowers) {
      setAuraColor(`${customColor}40`);
      triggerFlash("green");
      spawnBubbles(customColor);
    }
    setPreviousFollowers(followers);
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
      const bubble = {
        id,
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        size: 6 + Math.random() * 14,
        duration: 2 + Math.random() * 2,
        color,
        dx: (Math.random() - 0.5) * 150,
        dy: -200 - Math.random() * 100,
      };
      setBubbles((prev) => [...prev, bubble]);
      setTimeout(
        () => setBubbles((prev) => prev.filter((b) => b.id !== id)),
        bubble.duration * 1000
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
      />

      {/* PROFILE PICTURE */}
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

      {/* LAST FOLLOWER SECTION */}
      {lastFollower && (
        <div className="last-follower">
          <span className="label">⭐ Last Follower:</span>
          {lastFollower.profile_pic && (
            <img
              src={lastFollower.profile_pic}
              alt="last follower"
              className="last-follower-pfp"
              draggable="false"
            />
          )}
          <strong className="username">{lastFollower.username}</strong>
        </div>
      )}

      {/* BUBBLES */}
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
              "--dx": `${b.dx}px`,
              "--dy": `${b.dy}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
