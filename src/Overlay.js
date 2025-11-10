import React, { useEffect, useState, useRef } from "react";
import "./Overlay.css";

const Overlay = ({ user }) => {
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [particles, setParticles] = useState([]);
  const auraRef = useRef(null);

  // === FETCH FOLLOWERS ===
  const fetchFollowers = async () => {
    try {
      const res = await fetch(`https://kick.com/api/v1/channels/${user}`);
      const data = await res.json();

      if (data?.followersCount !== undefined) {
        const current = data.followersCount;

        if (current > followers) triggerParticles("green");
        else if (current < followers) triggerParticles("red");

        setFollowers(current);
        setProfilePic(data.user.profile_pic || "");
      }
    } catch (err) {
      console.error("Eroare la fetch:", err);
    }
  };

  // === PARTICULE la FOLLOW / UNFOLLOW ===
  const triggerParticles = (type) => {
    const color = type === "green" ? "#00ffaa" : "#ff5050";
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: Date.now() + i,
      color,
      size: Math.random() * 20 + 10,
      startX: Math.random() * 140 - 70, // pornire aleatorie
      startY: Math.random() * 60 - 30,
      x: Math.random() * 500 - 250, // dispersie
      y: Math.random() * -300 - 50,
      duration: Math.random() * 1 + 0.8,
    }));
    setParticles(newParticles);

    // curăță după 2s
    setTimeout(() => setParticles([]), 2000);
  };

  useEffect(() => {
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 8000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="overlay-container">
      <div className="content">
        {profilePic && <img src={profilePic} alt="pfp" className="profile-pic" />}

        <div className="aura" ref={auraRef}></div>

        {/* === PARTICULE === */}
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

        <h1 className="followers-count">{followers.toLocaleString()}</h1>
        <p className="followers-label">@{user}</p>
      </div>
    </div>
  );
};

export default Overlay;
