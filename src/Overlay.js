// === HIGHGOAL OVERLAY — GOLD GOAL + PROFILE PIC FIX + WHITE COUNT ===

const params = new URLSearchParams(window.location.search);

const username = params.get("user") || "hyghman";
const color = params.get("color") || "#00ffaa";
const font = params.get("font") || "Poppins";

const showProfilePic =
  (params.get("showProfilePic") || "yes").toLowerCase() === "yes";

const useGoal = params.get("useGoal") === "true";
const goal = parseInt(params.get("goal") || "10000");

document.body.style.setProperty("--main-color", color);
document.body.style.fontFamily = font;

// === HTML ===
document.body.innerHTML = `
  <div class="overlay-wrapper">

    ${showProfilePic ? `<img id="pfp" class="pfp hidden" />` : ""}

    <div id="followers" class="followers hidden">0</div>

    ${
      useGoal
        ? `
        <div class="goal-bar hidden">
            <div class="goal-fill"></div>
            <div class="goal-text"></div>
        </div>`
        : ""
    }

    <div id="confettiLayer" class="confetti-layer"></div>
  </div>
`;

// === ELEMENTS ===
const followersEl = document.getElementById("followers");
const pfp = document.getElementById("pfp");
const goalBar = document.querySelector(".goal-bar");
const goalFill = document.querySelector(".goal-fill");
const goalText = document.querySelector(".goal-text");
const confettiLayer = document.getElementById("confettiLayer");

let lastFollowers = 0;
window.goalHit = false;

// === COUNTUP ===
function countUp(el, from, to, duration = 900) {
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(from + (to - from) * progress).toLocaleString();
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// === FETCH FOLLOWERS ===
async function fetchFollowers() {
  try {
    const res = await fetch(`https://kick.com/api/v2/channels/${username}`);
    const data = await res.json();

    // ❤️ FIX PFP – API fallback
    const avatar =
      data?.user?.profile_pic ||
      data?.user?.profilePic ||
      data?.user?.pfp ||
      data?.pfp ||
      null;

    if (showProfilePic && avatar) {
      pfp.src = avatar + "?t=" + Date.now(); // force refresh
      fadeIn(pfp);
    }

    const followers = data?.followers_count ?? 0;

    countUp(followersEl, lastFollowers, followers);
    fadeIn(followersEl);

    // === GOAL BAR ===
    if (useGoal && goalBar) {
      fadeIn(goalBar);

      const pct = Math.min(100, (followers / goal) * 100);
      goalFill.style.width = pct + "%";

      if (!window.goalHit && followers >= goal) {
        window.goalHit = true;
        triggerGoalReached();
      } else {
        goalText.textContent =
          `${followers.toLocaleString()} / ${goal.toLocaleString()}`;
      }
    }

    lastFollowers = followers;
  } catch (err) {
    console.error("Kick API error:", err);
  }
}

// === GOLD GOAL ANIMATION ===
function triggerGoalReached() {
  // GOLD MODE permanent
  goalBar.classList.add("goal-complete");
  goalFill.classList.add("goal-fill-complete");

  goalFill.style.width = "100%";
  goalText.textContent = "GOAL REACHED";
  goalText.classList.add("goal-text-glow");

  // OPTIONAL confetti
  spawnConfetti();
}

// === CONFETTI ===
function spawnConfetti() {
  if (!confettiLayer) return;

  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    const x = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 1.2 + Math.random();

    piece.style.left = `${x}vw`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;

    const goldColors = ["#FFD700", "#FFEA70", "#FFC400", "#FFDD55"];
    piece.style.background = goldColors[Math.floor(Math.random() * goldColors.length)];

    confettiLayer.appendChild(piece);

    setTimeout(() => piece.remove(), (delay + duration) * 1000);
  }
}

function fadeIn(el) {
  el.classList.remove("hidden");
  el.classList.add("fade-in");
}

// RUN
fetchFollowers();
setInterval(fetchFollowers, 10000);

// === CSS ===
const style = document.createElement("style");
style.textContent = `
  body {
    background: transparent;
    margin: 0;
  }

  .overlay-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    height: 100vh;
  }

  .pfp {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgba(0,0,0,0.7);
    opacity: 0;
    transition: 0.4s;
  }

  .followers {
    font-size: 4.6rem;
    font-weight: 800;
    color: white; /* NUMĂR ALB */
    opacity: 0;
    text-shadow: 0 5px 16px rgba(0,0,0,0.8);
    transition: 0.4s;
  }

  .goal-bar {
    width: 420px;
    height: 34px;
    border-radius: 40px;
    background: rgba(255,255,255,0.15);
    overflow: hidden;
    opacity: 0;
    position: relative;
    transition: 0.4s;
  }

  .goal-fill {
    height: 100%;
    width: 0%;
    background: var(--main-color);
    transition: width 0.6s ease-in-out;
  }

  .goal-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: 700;
    text-shadow: 0 5px 12px rgba(0,0,0,0.7);
  }

  /* === GOLD MODE === */
  .goal-complete {
    background: rgba(255,215,0,0.35);
    border: 2px solid gold;
    box-shadow: 0 0 25px gold, inset 0 0 18px rgba(255,215,0,0.7);
  }

  .goal-fill-complete {
    background: gold !important;
    box-shadow: 0 0 25px gold;
  }

  .goal-text-glow {
    text-shadow: 0 0 10px gold, 0 0 25px gold;
  }

  /* === CONFETTI === */
  .confetti-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .confetti-piece {
    position: absolute;
    top: -5vh;
    width: 8px;
    height: 16px;
    border-radius: 2px;
    opacity: 0;
    animation: confettiFall ease-out forwards;
  }

  @keyframes confettiFall {
    0% { opacity: 1; transform: translateY(0) rotate(0deg); }
    100% { opacity: 0; transform: translateY(110vh) rotate(360deg); }
  }

  .hidden { opacity: 0; }
  .fade-in { opacity: 1 !important; transform: none !important; }
`;
document.head.appendChild(style);
