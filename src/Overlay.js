import React, { useEffect, useState } from "react";

function Overlay() {
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("user") || "hyghman";
  const color = urlParams.get("color") || "#00ffaa";
  const font = urlParams.get("font") || "Poppins";
  const useGoal = urlParams.get("useGoal") === "true";
  const goal = parseInt(urlParams.get("goal") || "10000");
  const showPfp = urlParams.get("showPfp") === "true";
  const goalColor = urlParams.get("goalColor") || "#ffffff";

  const fetchKickUser = async () => {
    try {
      const res = await fetch(`https://kick.com/api/v1/channels/${username}`);
      const data = await res.json();
      setFollowers(data.followersCount);
      setProfilePic(data.user.profile_pic);
    } catch (err) {
      console.error("User not found", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKickUser();
    const interval = setInterval(fetchKickUser, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          background: "transparent",
          fontFamily: font,
          color: color,
          textAlign: "center",
          fontSize: "32px",
          paddingTop: "20vh",
        }}
      >
        Loading...
      </div>
    );
  }

  const remaining = goal - followers;
  const progress = Math.min((followers / goal) * 100, 100);
  const goalReached = remaining <= 0;

  return (
    <div
      style={{
        background: "transparent",
        color: color,
        fontFamily: font,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      {/* Profile Picture */}
      {showPfp && profilePic && (
        <img
          src={profilePic}
          alt="profile"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            marginBottom: "20px",
            boxShadow: `0 0 20px ${color}`,
          }}
        />
      )}

      {/* Followers Counter */}
      <div
        style={{
          fontSize: "64px",
          fontWeight: "700",
          color: color,
          textShadow: `0 0 10px ${color}`,
          lineHeight: "1.1",
        }}
      >
        {followers.toLocaleString()}
      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: "600",
          color: "#fff",
          opacity: 0.9,
          marginBottom: useGoal ? "10px" : "0",
        }}
      >
        followers
      </div>

      {/* GOAL BAR */}
      {useGoal && (
        <div
          style={{
            position: "relative",
            width: "60%",
            height: "30px",
            background: "#111",
            borderRadius: "15px",
            marginTop: "20px",
            overflow: "hidden",
            border: `2px solid ${goalColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font,
            fontWeight: "700",
            fontSize: "14px",
            color: "#fff",
            textShadow: "0 0 8px rgba(0,0,0,0.8)",
          }}
        >
          {/* Progress bar */}
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: color,
              transition: "width 0.8s ease",
              position: "absolute",
              left: 0,
              top: 0,
            }}
          />

          {/* Text inside the bar */}
          <span
            style={{
              zIndex: 2,
              color: "#fff",
              textAlign: "center",
              width: "100%",
              textShadow: "0 0 6px rgba(0,0,0,0.7)",
            }}
          >
            {goalReached
              ? "🎉 Goal reached!"
              : `🎯 ${remaining.toLocaleString()} left`}
          </span>
        </div>
      )}
    </div>
  );
}

export default Overlay;
