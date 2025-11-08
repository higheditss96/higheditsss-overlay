import React, { useEffect, useState } from "react";

function Overlay() {
  const queryParams = new URLSearchParams(window.location.search);
  const user = queryParams.get("user") || "hyghman";
  const color = queryParams.get("color") || "#00ffaa";
  const font = queryParams.get("font") || "Poppins";
  const useGoal = queryParams.get("useGoal") === "true";
  const goal = Number(queryParams.get("goal")) || 10000;
  const showPfp = queryParams.get("showPfp") === "true";

  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`https://kick.com/api/v1/channels/${user}`);
        const data = await res.json();
        setFollowers(data.followersCount);
        setProfilePic(data.user.profile_pic);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUser();
  }, [user]);

  const progress = useGoal ? Math.min((followers / goal) * 100, 100) : 0;

  return (
    <div
      style={{
        fontFamily: font,
        color: color,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: "transparent",
        fontWeight: "600",
      }}
    >
      {showPfp && (
        <img
          src={profilePic}
          alt="pfp"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            marginBottom: "15px",
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          }}
        />
      )}

      <h1
        style={{
          fontSize: "5rem",
          margin: "0",
          color: color,
          textShadow: "0 0 20px rgba(0,0,0,0.6)",
        }}
      >
        {followers.toLocaleString()}
      </h1>

      <p
        style={{
          margin: "5px 0 15px 0",
          fontSize: "1.3rem",
          color: "white",
          opacity: 0.85,
        }}
      >
        followers
      </p>

      {useGoal && (
        <>
          <div
            style={{
              width: "70%",
              height: "12px",
              background: "#222",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: color,
                transition: "width 0.5s ease",
              }}
            ></div>
          </div>
          <p
            style={{
              margin: "0",
              fontSize: "1rem",
              color: "white",
              opacity: 0.8,
            }}
          >
            {goal - followers > 0
              ? `${goal - followers} left to reach ${goal}`
              : "Goal reached 🎉"}
          </p>
        </>
      )}
    </div>
  );
}

export default Overlay;
