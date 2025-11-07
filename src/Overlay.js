import React, { useEffect, useState } from "react";
import "./Overlay.css";

function Overlay() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("user") || "unknown";
  const font = params.get("font") || "Poppins";
  const color = params.get("color") || "#ffffff";
  const useGoal = params.get("useGoal") === "true";
  const showPfp = params.get("showPfp") === "true";
  const goal = parseInt(params.get("goal")) || 10000;

  const [followers, setFollowers] = useState(0);
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    async function fetchKickUser() {
      try {
        const res = await fetch(`https://kick.com/api/v1/channels/${username}`);
        const data = await res.json();
        setFollowers(data.followersCount);
        setProfilePic(data.user.profile_pic);
      } catch (err) {
        console.error(err);
      }
    }

    fetchKickUser();
    const interval = setInterval(fetchKickUser, 10000);
    return () => clearInterval(interval);
  }, [username]);

  const percent = Math.min((followers / goal) * 100, 100);
  const remaining = goal - followers;

  return (
    <div
      className={`overlay ${!showPfp ? "no-pfp" : ""}`}
      style={{ fontFamily: font }}
    >
      {showPfp && profilePic && (
        <img src={profilePic} alt="profile" className="overlay-profile" />
      )}

      <div className="overlay-followers" style={{ color }}>
        {followers.toLocaleString()}
      </div>

      {useGoal && (
        <>
          <div className="overlay-goal-container">
            <div
              className="overlay-goal-bar"
              style={{ width: `${percent}%` }}
            ></div>
          </div>

          {remaining > 0 ? (
            <div className="overlay-goal-text">
              {remaining.toLocaleString()} followers until goal
            </div>
          ) : (
            <div className="overlay-congrats">
              🎉 Congrats! Goal reached! 🎉
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Overlay;
