import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Overlay.css";

export default function Overlay() {
  const [followers, setFollowers] = useState(0);
  const [previousFollowers, setPreviousFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
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

  // === Fetch followers & user ===
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

  useEffect(() => {
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 10000);
    return () => clearInterval(interval);
  }, [fetchFollowers]);

  // === Detect follow/unfollow + animations ===
  useEffect(() => {
    if (followers === 0 && previousFollowers === 0) return;

    if (followers > previousFollowers) {
      setAuraColor(`${customColor}80`);
      spawnBubbles(`${customColor}`);
      triggerFlash("green");
    } else if (followers < previousFollowers) {
      setAuraColor("rgba(255, 60, 60, 0.6)");
      spawnBubbles("rgba(255, 60, 60, 0.9)");
      triggerFlash("red");
    }

    const timer = setTimeout(() => setAuraColor(`${customColor}40`), 1200);
    setPreviousFollowers(followers);
    return () => clearTimeout(timer);
  }, [followers, previousFollowers, customColor]);

  const triggerFlash = (type) => {
    setFlash(type);
    setTimeout(() => setFlash(false), 400);
  };

  // === Bubble spawn ===
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
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
      }, duration * 1000);
    }
  };

  const progress = Math.min((followers / goal) * 100, 100);

  return (
    <div className="overlay-container" style={{ "--main-color": customColor }}>
      {/* Aura cinematică */}
      <div
        className={`aura ${flash ? "aura-flash" : ""}`}
        style={{
          background: `radial-gradient(circle, ${
            auraColor || `${customColor}40`
          }, transparent 70%)`,
        }}
      ></div>

      {/* Profile Picture */}
      {showProfile && profilePic && (
        <img src={profilePic} alt="pfp" className="pfp" draggable="false" />
      )}

      {/* Followers count */}
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
          <div className="goal-bar">
            <div
              className="goal-progress"
              style={{
                width: `${progress}%`,
                backgroundColor: customColor,
              }}
            >
              <span className="goal-text">
                {followers.toLocaleString()} / {goal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bubble layer */}
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
