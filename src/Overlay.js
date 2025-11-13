// === HIGHSTATS FOLLOWER OVERLAY — Clean Version (no stroke) ===

const params = new URLSearchParams(window.location.search);
const username = params.get("user") || "hyghman";
const color = params.get("color") || "#00ffaa";
const font = params.get("font") || "Poppins";
const useGoal = params.get("useGoal") === "true";
const goal = parseInt(params.get("goal") || "10000");

document.body.style.setProperty("--main-color", color);
document.body.style.fontFamily = font;

// === STRUCTURA HTML ===
document.body.innerHTML = `
  <div class="overlay">
    <img id="pfp" class="pfp hidden" src="https://cdn.kick.com/images/default-avatar.png" alt="Profile Picture" />
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
  </div>
`;

const pfp = document.getElementById("pfp");
const followersEl = document.getElementById("followers");
const goalBar = document.querySelector(".goal-bar");
const goalFill = document.querySelector(".goal-fill");
const goalText = document.querySelector(".goal-text");

let lastFollowerCount = null;

// === FETCH FOLLOWERS FROM KICK ===
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

    // === UPDATE UI ===
    pfp.src = avatar;
    followersEl.textContent = followers.toLocaleString("en-US");

    fadeInElement(pfp);
    fadeInElement(followersEl);
    if (goalBar) fadeInElement(goalBar);

    if (useGoal && goalFill && goalText) {
      const percent = Math.min(100, (followers / goal) * 100);
      goalFill.style.width = `${percent}%`;
      goalText.textContent = `${followers.toLocaleString("en-US")} / ${goal.toLocaleString("en-US")}`;
    }

    // === Detect follow/unfollow ===
    if (lastFollowerCount !== null && followers !== lastFollowerCount) {
      triggerFollowAnimation(followers > lastFollowerCount ? "follow" : "unfollow");
    }

    lastFollowerCount = followers;
  } catch (err) {
    console.warn("❌ Kick API failed:", err);

    try {
      const alt = await fetch(`https://kickapi.su/api/v2/channels/${username}`);
      const data2 = await alt.json();

      const avatar =
        data2?.user?.profile_pic ||
        data2?.user?.profilePic ||
        "https://cdn.kick.com/images/default-avatar.png";
      const followers = data2?.followersCount || 0;

      pfp.src = avatar;
      followersEl.textContent = followers.toLocaleString("en-US");

      fadeInElement(pfp);
      fadeInElement(followersEl);
      if (goalBar) fadeInElement(goalBar);

      if (useGoal && goalFill && goalText) {
        const percent = Math.min(100, (followers / goal) * 100);
        goalFill.style.width = `${percent}%`;
        goalText.textContent = `${followers.toLocaleString("en-US")} / ${goal.toLocaleString("en-US")}`;
      }

      if (lastFollowerCount !== null && followers !== lastFollowerCount) {
        triggerFollowAnimation(followers > lastFollowerCount ? "follow" : "unfollow");
      }

      lastFollowerCount = followers;
    } catch (e) {
      followersEl.textContent = "N/A";
    }
  }
}

// === FADE-IN FUNCTION ===
function fadeInElement(el) {
  el.classList.remove("hidden");
  el.classList.add("fade-in");
}

// === FOLLOW/UNFOLLOW ANIMATION ===
function triggerFollowAnimation(type) {
  const overlay = document.querySelector(".overlay");

  overlay.classList.remove("follow-anim", "unfollow-anim");
  void overlay.offsetWidth; // restart animation

  if (type === "follow") {
    overlay.classList.add("follow-anim");
  } else {
    overlay.classList.add("unfollow-anim");
  }
}

// === REFRESH AUTO ===
fetchFollowers();
setInterval(fetchFollowers, 10000);

// === STILURI ===
const style = document.createElement("style");
style.textContent = `
  body {
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    color: white;
    font-family: "${font}", sans-serif;
  }

  .overlay {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    transition: transform 0.3s ease;
  }

  .pfp {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    opacity: 0;
    transform: scale(0.9);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .followers-count {
    font-size: 4rem;
    font-weight: 700;
    color: var(--main-color);
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transform: translateY(10px);
    transition: transform 0.3s ease;
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
  }

  .goal-fill {
    position: absolute;
    height: 100%;
    background: var(--main-color);
    border-radius: 50px;
    width: 0%;
    transition: width 0.6s ease;
  }

  .goal-text {
    position: relative;
    z-index: 2;
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    text-shadow: 0 2px 6px rgba(0,0,0,0.5);
    line-height: 28px;
  }

  /* === ANIMAȚII === */
  .fade-in {
    animation: fadeIn 0.8s ease forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* === Follow animation === */
  .follow-anim {
    animation: followEffect 0.6s ease;
  }

  @keyframes followEffect {
    0% { transform: scale(1); }
    30% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  /* === Unfollow animation === */
  .unfollow-anim {
    animation: unfollowEffect 0.6s ease;
  }

  @keyframes unfollowEffect {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.92); opacity: 0.6; }
    100% { transform: scale(1); opacity: 1; }
  }

  .hidden {
    opacity: 0;
  }
`;
document.head.appendChild(style);
