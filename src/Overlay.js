import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Overlay.css";

const Overlay = ({ user }) => {
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [particles, setParticles] = useState([]);
  const [flash, setFlash] = useState("");
  const [arc, setArc] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const prevFollowersRef = useRef(0);

  // === trigger particles (verde / roșu) ===
  const triggerParticles = useCallback((colorType = "green") => {
    const color = colorType === "red" ? "#ff5050" : "#00ffaa";
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: Date.now() + i,
      color,
      size: Math.random() * 14 + 6,
      startX: Math.random() * 120 - 60,
      startY: Math.random() * 40 - 20,
      x: Math.random() * 400 - 200,
      y: Math.random() * -200 - 50,
      duration: Math.random() * 1 + 0.7,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1500);
  }, []);

  // === flash + arc electric ===
  const triggerFlash = useCallback((type) => {
    setFlash(type);
    setArc(true);
    setTimeout(() => setFlash(""), 700);
    setTimeout(() => setArc(false), 400);
  }, []);

  // === scântei în jurul numerelor ===
  const triggerSparkles = useCallback(() => {
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 800);
  }, []);

  // === fetch followers ===
  const fetchFollowers = useCallback(async () => {
    try {
      const res = await fetch(`https://kick.com/api/v1/channels/${user}`);
      const data = await res.json();

      if (data?.followersCount !== undefined) {
        const current = data.followersCount;
        const prev = prevFollowersRef.current;

        if (current > prev) {
          triggerParticles("green");
          triggerFlash("follow");
          triggerSparkles();
        } else if (current < prev) {
          triggerParticles("red"); // 🔴 bule roșii la unfollow
          triggerFlash("unfollow");
        }

        setFollowers(current);
        prevFollowersRef.current = current;

        if (data?.user?.profile_pic) {
          setProfilePic(data.user.profile_pic);
        }
      }
    } catch (err) {
      console.error("Eroare la fetch:", err);
    }
  }, [user, triggerParticles, triggerFlash, triggerSparkles]);

  // === useEffect pentru fetch periodic ===
  useEffect(() => {
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 8000);
    return () => clearInterval(interval);
  }, [fetchFollowers]);

  return (
    <div className="overlay-container">
      <div className="content">
        {profilePic && <img src={profilePic} alt="pfp" className="profile-pic" />}

        {/* Aura */}
        <div className="aura">
          <div className="energy-ring"></div>
        </div>

        {/* Fulger + Arc */}
        {flash && <div className={`flash-effect ${flash}`}></div>}
        {arc && <div className="electric-arc"></div>}

        {/* Particule (bule colorate) */}
        <div className="particles-container">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                backgroundColor: p.color,
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `calc(50% + ${p.startX}px)`,
                top: `calc(55% + ${p.startY}px)`,
                animationDuration: `${p.duration}s`,
                "--x": `${p.x}px`,
                "--y": `${p.y}px`,
              }}
            />
          ))}
        </div>

        {/* Număr + Sparkles */}
        <div className="number-wrapper">
          <h1 className={`followers-count ${flash === "follow" ? "zoom" : ""}`}>
            {followers.toLocaleString()}
          </h1>
          {sparkles.map((s) => (
            <span
              key={s.id}
              className="sparkle"
              style={{ left: s.left, top: s.top }}
            ></span>
          ))}
        </div>

        <p className="followers-label">@{user}</p>
      </div>
    </div>
  );
};

export default Overlay;
