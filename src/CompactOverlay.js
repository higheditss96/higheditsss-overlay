import React, { useEffect, useState, useCallback, useRef } from "react";
import "./CompactOverlay.css";

const CompactOverlay = ({ user }) => {
  const [followers, setFollowers] = useState(0);
  const [recentFollower, setRecentFollower] = useState(null);
  const [pulse, setPulse] = useState("");
  const prevFollowersRef = useRef(0);
  const prevFollowerListRef = useRef([]);

  const fetchFollowers = useCallback(async () => {
    try {
      const res = await fetch(`https://kick.com/api/v1/channels/${user}`);
      const data = await res.json();

      const listRes = await fetch(`https://kick.com/api/v1/channels/${user}/followers`);
      const listData = await listRes.json();

      if (data?.followersCount !== undefined) {
        const current = data.followersCount;
        const prev = prevFollowersRef.current;

        if (Array.isArray(listData.data)) {
          const latestFollower = listData.data[0];
          const lastSeen = prevFollowerListRef.current[0]?.id;

          if (latestFollower && latestFollower.id !== lastSeen) {
            // Follow nou
            setRecentFollower({
              name: latestFollower.username,
              avatar: latestFollower.profile_pic,
            });
            setPulse("green");
            setTimeout(() => setPulse(""), 2000);
            setTimeout(() => setRecentFollower(null), 6000);
          }
          prevFollowerListRef.current = listData.data;
        }

        // Detectează unfollow
        if (current < prev) {
          setPulse("red");
          setTimeout(() => setPulse(""), 2000);
        }

        setFollowers(current);
        prevFollowersRef.current = current;
      }
    } catch (error) {
      console.error("Eroare la fetch:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowers();
    const interval = setInterval(fetchFollowers, 8000);
    return () => clearInterval(interval);
  }, [fetchFollowers]);

  return (
    <div className={`compact-overlay ${pulse}`}>
      <div className="follower-info">
        <span className="follower-count">
          {followers.toLocaleString()} <span className="label">Followers</span>
        </span>
      </div>

      {recentFollower && (
        <div className="follower-popup">
          <img src={recentFollower.avatar} alt="pfp" className="popup-avatar" />
          <span className="popup-name">{recentFollower.name} followed 💚</span>
        </div>
      )}
    </div>
  );
};

export default CompactOverlay;
