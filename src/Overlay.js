import React, { useEffect, useState } from "react";

function Overlay() {
  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(true);

  // URL params
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("user") || "hyghman";
  const color = urlParams.get("color") || "#00ffaa";
  const font = urlParams.get("font") || "Poppins";
  const useGoal = urlParams.get("useGoal") === "true";
  const goal = parseInt(urlParams.get("goal") || "10000", 10);
  const showPfp = urlParams.get("showPfp") === "true";
  const goalColor = urlParams.get("goalColor") || "#ffffff";

  useEffect(() => {
    let active = true;

    async function fetchKickUser() {
      try {
        const res = await fetch(`https://kick.com/api/v1/channels/${username}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        if (active && data && data.followersCount && data.user?.profile_pic) {
          setFollowers(data.followersCount);
          setProfilePic(data.user.profile_pic);
        } else if (active) {
          setFollowers(0);
          setProfilePic("");
        }
      } catch (err) {
        console.error("Kick API error:", err);
        if (active) {
          setFollowers(0);
          setProfilePic("");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchKickUser();
    const interval = setInterval(fetchKickUser, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [username]);

  if (loading) {
    return (
      <div
        style={{
          background: "transparent",
          fontFamily: font,
          color,
          textAlign: "center",
          fontSize: "32px",
          paddingTop: "20vh",
        }}
      >
        Loading...
      </div>
    );
  }

  const remaining = Math.max(goal - followers, 0);
  const progress = Math.min((followers / goal) * 100, 100);
  const goalReached = remaining <= 0;

  return (
    <div
      style={{
        background: "transparent",
        color,
        fontFamily: font,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Profile Picture */}
      {showPfp && profilePic ? (
        <img
          src={profilePic}
          alt="profile"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            marginBottom: "20px",
            objectFit: "cover",
          }}
        />
      ) : null}

      {/* Followers Counter */}
      <div
        style={{
          fontSize: "64px",
          fontWeight: "700",
          color,
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
            width: "40%", // bara mai scurtă
            height: "40px", // mai groasă
            background: "#1a1a1a",
            borderRadius: "12px",
            marginTop: "25px",
            overflow: "hidden",
            border: `2px solid ${goalColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font,
            fontWeight: "700",
            fontSize: "14px",
            color: "#fff",
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

          {/* Text inside bar */}
          <span
            style={{
              zIndex: 2,
              color: "#fff",
              textAlign: "center",
              width: "100%",
            }}
          >
            {goalReached
              ? "Goal reached!"
              : `${remaining.toLocaleString()} left`}
          </span>
        </div>
      )}
    </div>
  );
}

export default Overlay;
