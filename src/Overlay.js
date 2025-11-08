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

  // funcție simplă de contrast: dacă culoarea e deschisă => text negru
  function getContrastColor(hex) {
    const c = hex.substring(1); // scoate #
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 180 ? "#000" : "#fff"; // dacă e foarte deschis, text negru
  }

  const textColor = getContrastColor(goalColor);

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
            marginBottom: "15px",
            objectFit: "cover",
          }}
        />
      ) : null}

      {/* Followers Counter */}
      <div
        style={{
          fontSize: "72px",
          fontWeight: "700",
          color,
          lineHeight: "1.1",
          marginBottom: useGoal ? "15px" : "0",
        }}
      >
        {followers.toLocaleString()}
      </div>

      {/* GOAL BAR */}
      {useGoal && (
        <div
          style={{
            position: "relative",
            width: "35%", // bara mai scurtă
            height: "45px", // mai groasă
            background: "#1a1a1a",
            borderRadius: "12px",
            overflow: "hidden",
            border: `2px solid ${goalColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font,
            fontWeight: "700",
            fontSize: "20px", // text mai mare
            color: textColor,
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
              textAlign: "center",
              width: "100%",
              mixBlendMode: "difference", // face textul vizibil și pe fundal luminos
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
