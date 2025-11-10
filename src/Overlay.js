import React, { useEffect, useState } from "react";
import "./Overlay.css";

const Overlay = ({ user }) => {
  const [followers, setFollowers] = useState(0);
  const [pulse, setPulse] = useState("");
  const [particles, setParticles] = useState([]);
  const [idleParticles, setIdleParticles] = useState([]);

  // Fetch followers
  const fetchFollowers = async () => {
    try {
      const res = await fetch(`https://kick.com/api/v1/channels/${user}`);
      const data = await res.json();

      if (data?.followersCount !== undefined) {
        const current = data.followersCount;

        if (current > followers) {
          triggerParticles("green");
          setPulse("pulse-green");
        } else if (current < followers) {
          triggerParticles("red");
          setPulse("pulse-red");
        }

        setFollowers(current);
        setTimeout(() => setPulse(""), 1000);
      }
    } catch (err) {
      console.error("Eroare la fetch:", err);
    }
  };

  // Particule explozive
  const triggerParticles = (color) => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      color,
      angle: Math.random() * 360,
      size: Math.random() * 25 + 15, // bule mai mari
      duration: Math.random() * 1 + 0.8,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.slice(newParticles.length));
    }, 1500);
  };

  // Bule idle (lente)
  const createIdleParticle = () => {
    const newParticle = {
      id: Date.now(),
      size: Math.random() * 18 + 12,
      left: 48 + Math.random() * 4, // ies aproape din centrul textului
      duration: Math.random() * 8 + 5,
      delay: Math.random() * 3,
    };
    setIdleParticles((prev) => [...prev, newParticle]);
    setTimeout(() => {
      setIdleParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, (newParticle.duration + 1) * 1000);
  };

  useEffect(() => {
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 10000);
    const idleInterval = setInterval(createIdleParticle, 1200);
    return () => {
      clearInterval(interval);
      clearInterval(idleInterval);
    };
  }, [user]);

  return (
    <div className="overlay-container">
      <div className="content">
        {/* bule lente */}
        <div className="idle-bubbles">
          {idleParticles.map((b) => (
            <div
              key={b.id}
              className="idle-bubble"
              style={{
                left: `${b.left}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>

        {/* particule rapide */}
        <div className="particles-container">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                backgroundColor: p.color === "green" ? "#00ffaa" : "#ff5050",
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        <h1 className={`followers-count ${pulse}`}>
          {followers.toLocaleString()}
        </h1>
        <p className="followers-label">@{user} followers</p>
      </div>
    </div>
  );
};

export default Overlay;
