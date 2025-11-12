// === HIGHSTATS OVERLAY — Energy Pulse + Glass Glow (v2) ===

const params = new URLSearchParams(window.location.search);
const username = params.get("user") || "hyghman";
const color = params.get("color") || "#00ffaa";
const font = params.get("font") || "Poppins";
const useGoal = params.get("useGoal") === "true";
const showProfilePic = params.get("showProfilePic") !== "false"; // nou
const goal = parseInt(params.get("goal") || "10000");

document.body.style.setProperty("--main-color", color);
document.body.style.fontFamily = font;

document.body.innerHTML = `
  <div class="overlay">
    <div class="glass-card">
      ${
        showProfilePic
          ? `<img id="pfp" class="pfp hidden" src="https://cdn.kick.com/images/default-avatar.png" alt="Profile Picture" />`
          : ""
      }
      <div id="followers" class="followers-count hidden">N/A</div>
      ${
        useGoal
          ? `
        <div class="goal-bar hidden">
          <div class="goal-fill"></div>
          <div class="goal-text">0 / ${goal.toLocaleString("en-US")}</div>
        </div>`
          : ""
      }
      <div class="pulse-bg"></div>
    </div>
  </div>
`;

const pfp = document.getElementById("pfp");
const followersEl = document.getElementById("followers");
const goalBar = document.querySelector(".goal-bar");
const goalFill = document.querySelector(".goal-fill");
const goalText = document.querySelector(".goal-text");
const pulseBg = document.querySelector(".pulse-bg");

let lastFollowerCount = null;

async function fetchFollowers() {
  try {
    let res = await fetch(`https://kick.com/api/v2/channels/${username}`);
    if (!res.ok) throw new Error("Kick.com API failed, trying backup");

    const data = await res.json();
    const avatar =
      data?.user?.profile_pic ||
      data?.user?.profilePic ||
      "https://cdn.kick.com/images/default-avatar.png";
    const followers = data?.followers_count || data?.followersCount || 0;

    if (pfp) pfp.src = avatar;
    followersEl.textContent = followers.toLocaleString("en-US");

    fadeIn(followersEl);
    if (pfp) fadeIn(pfp);
    if (goalBar) fadeIn(goalBar);

    if (useGoal && goalFill && goalText) {
      const percent = Math.min(100, (followers / goal) * 100);
      goalFill.style.width = `${percent}%`;
      goalText.textContent = `${followers.toLocaleString("en-US")} / ${goal.toLocaleString("en-US")}`;
    }

    if (lastFollowerCount !== null && followers !== lastFollowerCount) {
      if (followers > lastFollowerCount) triggerFollow();
      else triggerUnfollow();
    }

    lastFollowerCount = followers;
  } catch {
    followersEl.textContent = "N/A";
  }
}

function fadeIn(el) {
  el.classList.remove("hidden");
  el.classList.add("fade-in");
}

function triggerFollow() {
  const overlay = document.querySelector(".glass-card");
  overlay.classList.remove("follow-anim");
  pulseBg.classList.remove("active");
  void overlay.offsetWidth;
  overlay.classList.add("follow-anim");
  pulseBg.classList.add("active");
}

function triggerUnfollow() {
  const overlay = document.querySelector(".glass-card");
  overlay.classList.remove("unfollow-anim");
  void overlay.offsetWidth;
  overlay.classList.add("unfollow-anim");
}

fetchFollowers();
setInterval(fetchFollowers, 10000);

// === STYLE ===
const style = document.createElement("style");
style.textContent = `
  body {
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    font-family: "${font}", sans-serif;
  }

  .overlay {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .glass-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 24px 40px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .pulse-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300%;
    height: 300%;
    background: radial-gradient(circle, var(--main-color) 0%, transparent 70%);
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.5s ease;
    z-index: 0;
  }

  .pulse-bg.active {
    opacity: 0.25;
    transform: translate(-50%, -50%) scale(1);
    animation: fadePulse 0.6s ease forwards;
  }

  @keyframes fadePulse {
    0% { opacity: 0.25; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.8); }
  }

  .pfp {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    opacity: 0;
    transform: scale(0.9);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  .followers-count {
    font-size: 4rem;
    font-weight: 700;
    color: var(--main-color);
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transform: translateY(10px);
    z-index: 2;
  }

  .goal-bar {
    width: 360px;
    height: 28px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 8px rgba(0,0,0,0.3);
    opacity: 0;
    transform: translateY(10px);
    z-index: 2;
  }

  .goal-fill {
    position: absolute;
    height: 100%;
    background: var(--main-color);
    border-radius: 50px;
    width: 0%;
    transition: width 0.6s ease;
  }

  /* 🔥 TEXT CENTRAT PERFECT în goal bar */
  .goal-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    text-shadow: 0 2px 6px rgba(0,0,0,0.5);
    z-index: 3;
    white-space: nowrap;
  }

  .fade-in { animation: fadeIn 0.8s ease forwards; }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .follow-anim { animation: followEffect 0.6s ease; }

  @keyframes followEffect {
    0% { transform: scale(1); }
    30% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  .unfollow-anim { animation: unfollowEffect 0.6s ease; }

  @keyframes unfollowEffect {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.92); opacity: 0.6; }
    100% { transform: scale(1); opacity: 1; }
  }

  .hidden { opacity: 0; }
`;
document.head.appendChild(style);
