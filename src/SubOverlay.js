import React, { useEffect, useState } from "react";
import "./SubOverlay.css";

export default function SubOverlay() {
  const [subs, setSubs] = useState(0);
  const [gifted, setGifted] = useState(0);
  const [goal, setGoal] = useState(100);
  const [color, setColor] = useState("#00ffaa");
  const [font, setFont] = useState("Poppins");
  const [username, setUsername] = useState("");
  const [useGoal, setUseGoal] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");
    const col = params.get("color") || "#00ffaa";
    const fontParam = params.get("font") || "Poppins";
    const goalEnabled = params.get("useGoal") === "true";
    const goalValue = parseInt(params.get("goal") || 100);

    setUsername(user);
    setColor(col);
    setFont(fontParam);
    setUseGoal(goalEnabled);
    setGoal(goalValue);

    if (user) fetchSubs(user);

    const interval = setInterval(() => {
      if (user) fetchSubs(user);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchSubs = async (user) => {
    try {
      const subRes = await fetch(
        `https://kick.com/api/v1/channels/${user}/subscriptions`
      );
      const subData = await subRes.json();

      const giftedRes = await fetch(
        `https://kick.com/api/v1/channels/${user}/subscriptions/gifted`
      );
      const giftedData = await giftedRes.json();

      setSubs(subData?.total || 0);
      setGifted(giftedData?.total || 0);
    } catch (err) {
      console.error("Error fetching subs data:", err);
    }
  };

  const total = subs + gifted;
  const progress = Math.min((total / goal) * 100, 100);
  const remaining = goal - total;

  return (
    <div
      className="suboverlay-container"
      style={{
        color,
        fontFamily: font,
      }}
    >
      <div className="suboverlay-count">
        {total.toLocaleString()} <span className="subtext">subs total</span>
      </div>

      {useGoal && (
        <div
          className="suboverlay-goal"
          style={{
            border: `2px solid ${color}`,
          }}
        >
          <div
            className="suboverlay-progress"
            style={{
              width: `${progress}%`,
              background: color,
            }}
          ></div>
          <span
            className="suboverlay-text"
            style={{
              color: progress > 50 ? "#000" : "#fff",
            }}
          >
            {remaining > 0
              ? `${remaining} subs left`
              : "🎉 Goal reached!"}
          </span>
        </div>
      )}
    </div>
  );
}
