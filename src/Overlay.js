// === HIGHGOAL OVERLAY — GOLD GOAL + PROFILE PIC + WHITE COUNT ===

// Query params din OBS URL
const params = new URLSearchParams(window.location.search);

const username = params.get("user") || "hyghman";
const color = params.get("color") || "#00ffaa";
const font = params.get("font") || "Poppins";
const useGoal = params.get("useGoal") === "true";
const goal = parseInt(params.get("goal") || "10000", 10);

// Acceptăm atât showProfilePic, cât și showProfilePicture pentru compat
const showPicParam =
  params.get("showProfilePic") ??
  params.get("showProfilePicture") ??
  "true";

const showProfilePic =
  showPicParam === "true" ||
  showPicParam.toLowerCase() === "yes";

// stil global
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

// === ELEMENTE ===
const followersEl = document.getElementById("followers");
const pfpEl = document.getElementById("pfp");
const goalBarEl = document.querySelector(".goal-bar");
const goalFillEl = document.querySelector(".goal-fill");
const goalTextEl = document.querySelector(".goal-text");
const confettiLayer = document.getElementById("confettiLayer");

let lastFollowers = 0;
window.goalHit = false;

// === COUNTUP ===
function countUp(el, from, to, duration = 900) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(from + (to - from) * progress);
    el.textContent = value.toLocaleString("en-US");

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// === FETCH FOLLOWERS (API v1, simplu) ===
async function fetchFollowers() {
  try {
    const res = await fetch(`https://kick.com/api/v1/channels/${username}`);
    const data = await res.json();

    // profil pic – încercăm mai multe câmpuri
    const avatar =
      data?.user?.profile_pic ||
      data?.user?.profilePic ||
      data?.user?.avatar ||
      null;

    if (showProfilePic && avatar && pfpEl) {
      pfpEl.src = avatar;
      fadeIn(pfpEl);
    }

    const followers = data?.followersCount ?? 0;

    countUp(followersEl, lastFollowers, followers);
    fadeIn(followersEl);

    // === GOAL ===
    if (useGoal && goalBarEl && goalFillEl && goalTextEl) {
      fadeIn(goalBarEl);

      const pct = Math.min(100, (followers / goal) * 100);
      goalFillEl.style.width = `${pct}%`;

      if (!window.goalHit && followers >= goal) {
        window.goalHit = true;
        triggerGoalReached();
      } else if (!window.goalHit) {
        goalTextEl.textContent =
          `${followers.toLocaleString("en-US")} / ${goal.toLocaleString("en-US")}`;
      }
    }

    lastFollowers = followers;
  } catch (err) {
    console.error("Kick API error:", err);
  }
}

// === GOLD GOAL permanent + confetti =====
function triggerGoalReached() {
  if (!goalBarEl || !goalFillEl || !goalTextEl) return;

  goalBarEl.classList.add("goal-complete");
  goalFillEl.classList.add("goal-fill-complete");
  goalFillEl.style.width = "100%";

  goalTextEl.textContent = "GOAL REACHED";
  goalTextEl.classList.add("goal-text-glow");

  spawnConfetti();
}

// === CONFETTI ===
function spawnConfetti() {
  if (!confettiLayer) return;

  const pieces = 70;
  const goldColors = ["#FFD700", "#FFEA70", "#FFC400", "#FFDD55"];

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    const x = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 1.2 + Math.random();

    piece.style.left = `${x}vw`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.background =
      goldColors[Math.floor(Math.random() * goldColors.length)];

    confettiLayer.appendChild(piece);

    setTimeout(() => piece.remove(), (delay + duration) * 1000);
  }
}

// === ANIMATIE GENERICĂ ===
function fadeIn(el) {
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.add("fade-in");
}

// === RUN LOOP ===
fetchFollowers();
setInterval(fetchFollowers, 10000);

// === CSS injectat ===
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
    gap: ${showProfilePic ? "10px" : "12px"};
    height: 100vh;
  }

  .pfp {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(0,0,0,0.7);
    opacity: 0;
    transition: 0.4s;
  }

  .followers {
    font-size: 4.4rem;
    font-weight: 800;
    color: #ffffff;          /* NUMĂR ALB */
    opacity: 0;
    text-shadow: 0 5px 16px rgba(0,0,0,0.8);
    transition: 0.35s;
  }

  .goal-bar {
    margin-top: 6px;         /* mai aproape de număr */
    width: 420px;
    height: 34px;
    border-radius: 40px;
    background: rgba(255,255,255,0.15);
    overflow: hidden;
    opacity: 0;
    position: relative;
    transition: 0.35s;
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
    color: #ffffff;
    font-weight: 700;
    text-shadow: 0 5px 12px rgba(0,0,0,0.7);
  }

  /* GOLD GOAL permanent */
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

  /* CONFETTI */
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
    0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
    100% { opacity: 0; transform: translateY(110vh) rotate(360deg); }
  }

  .hidden { opacity: 0; }
  .fade-in { opacity: 1 !important; transform: none !important; }
`;
document.head.appendChild(style);
