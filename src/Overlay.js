// === HIGHSTATS OVERLAY — GOAL GOLD + CONFETTI ===

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

// === HTML STRUCTURE ===
document.body.innerHTML = `
  <div class="overlay-wrapper">
    
    ${showProfilePic ? `<img id="pfp" class="pfp hidden" />` : ""}

    <div id="followers" class="followers hidden">0</div>

    <div id="lastFollower" class="last-follower hidden">
      <img id="lfPfp" class="lf-pfp" />
      <span id="lfName">Last follower: N/A</span>
    </div>

    ${
      useGoal
        ? `
      <div class="goal-bar hidden">
        <div class="goal-fill"></div>
        <div class="goal-text">0 / ${goal.toLocaleString()}</div>
      </div>
      `
        : ""
    }

    <div id="confettiLayer" class="confetti-layer"></div>
  </div>
`;

// === ELEMENTE ===
const followersEl = document.getElementById("followers");
const pfp = document.getElementById("pfp");

const lastFollowerBox = document.getElementById("lastFollower");
const lfName = document.getElementById("lfName");
const lfPfp = document.getElementById("lfPfp");

const goalBar = document.querySelector(".goal-bar");
const goalFill = document.querySelector(".goal-fill");
const goalText = document.querySelector(".goal-text");

const confettiLayer = document.getElementById("confettiLayer");

let lastFollowers = 0;
window.goalHit = false; // ca să nu tragem de 100 de ori efectul

// === COUNTUP FOLLOWERS ===
function countUp(el, from, to, duration = 900) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(from + (to - from) * progress);
    el.textContent = value.toLocaleString();

    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// === FETCH FOLLOWERS ===
async function fetchFollowers() {
  try {
    const res = await fetch(`https://kick.com/api/v2/channels/${username}`);
    const data = await res.json();

    const avatar = data?.user?.profile_pic;
    const followers = data?.followers_count ?? 0;

    // Profile pic
    if (showProfilePic && avatar && pfp) {
      pfp.src = avatar;
      fadeIn(pfp);
    }

    // Count-up
    countUp(followersEl, lastFollowers, followers);
    fadeIn(followersEl);

    // Goal bar
    if (useGoal && goalBar) {
      fadeIn(goalBar);

      const pct = Math.min(100, (followers / goal) * 100);
      goalFill.style.width = `${pct}%`;
      goalText.textContent =
        `${followers.toLocaleString()} / ${goal.toLocaleString()}`;

      // Când atinge goal-ul → efect o singură dată
      if (!window.goalHit && followers >= goal) {
        window.goalHit = true;
        triggerGoalReached();
      }
    }

    lastFollowers = followers;
  } catch (e) {
    console.error("Kick error:", e);
  }
}

// === FETCH LAST FOLLOWER ===
async function fetchLastFollower() {
  try {
    const res = await fetch(
      `https://kickapi.su/api/v2/channels/${username}/followers?limit=1`
    );
    const data = await res.json();

    const f = data?.data?.[0]?.follower;
    if (!f) return;

    lfName.textContent = f.username;
    lfPfp.src = f.profile_pic;
    fadeIn(lastFollowerBox);
  } catch (e) {
    console.error("Last follower error:", e);
  }
}

// === GOAL REACHED FX (GOLD + WAVE + CONFETTI) ===
function triggerGoalReached() {
  if (!goalBar) return;

  // GOLD MODE permanent
  goalBar.classList.add("goal-complete");
  goalFill.classList.add("goal-fill-complete");
  goalFill.style.width = "100%";

  if (goalText) {
    goalText.textContent = "GOAL REACHED!";
    goalText.classList.add("goal-text-glow");
  }

  // Wave FX
  const wave = document.createElement("div");
  wave.className = "goal-wave";
  goalBar.appendChild(wave);
  setTimeout(() => wave.remove(), 1500);

  // Confetti FX
  spawnConfetti();
}

// === CONFETTI SPAWN ===
function spawnConfetti() {
  if (!confettiLayer) return;

  const total = 80; // câte bucăți de confetti
  for (let i = 0; i < total; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    // poziție random pe orizontală
    const x = Math.random() * 100; // vw %
    // întârziere random
    const delay = Math.random() * 0.6;
    // durată random
    const duration = 1.2 + Math.random() * 0.6;
    // rotație random
    const rotate = Math.random() * 360;

    piece.style.left = `${x}vw`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.transform = `rotate(${rotate}deg)`;

    // culori aurii, unele mai deschise, unele mai închise
    const goldVariants = [
      "#FFD700",
      "#FFC400",
      "#FFEA70",
      "#FFDD55",
      "#FFE08A"
    ];
    piece.style.backgroundColor =
      goldVariants[Math.floor(Math.random() * goldVariants.length)];

    confettiLayer.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, (delay + duration) * 1000);
  }
}

// === ANIMATIE GENERICĂ ===
function fadeIn(el) {
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.add("fade-in");
}

// === RUN ===
fetchFollowers();
fetchLastFollower();

setInterval(fetchFollowers, 10000);
setInterval(fetchLastFollower, 10000);

// === CSS inject ===
const style = document.createElement("style");
style.textContent = `
  body {
    background: transparent;
    margin: 0;
    overflow: hidden;
  }

  .overlay-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 18px;
  }

  .pfp {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    opacity: 0;
    transform: scale(0.85);
    transition: 0.4s;
    box-shadow: 0 8px 24px rgba(0,0,0,0.7);
  }

  .followers {
    font-size: 4.6rem;
    font-weight: 700;
    text-shadow: 0 5px 16px rgba(0,0,0,0.6);
    opacity: 0;
    transform: translateY(12px);
    transition: 0.4s;
  }

  .last-follower {
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    transform: translateY(12px);
    transition: 0.4s;
    color: #ffffff;
    text-shadow: 0 3px 8px rgba(0,0,0,0.7);
  }

  .lf-pfp {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(0,0,0,0.7);
  }

  #lfName {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .goal-bar {
    width: 380px;
    height: 30px;
    background: rgba(255,255,255,0.16);
    border-radius: 50px;
    overflow: hidden;
    position: relative;
    opacity: 0;
    transform: translateY(12px);
    transition: 0.4s;
  }

  .goal-fill {
    height: 100%;
    width: 0%;
    background: var(--main-color);
    transition: width 0.6s ease;
  }

  .goal-text {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.05rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 3px 8px rgba(0,0,0,0.7);
  }

  /* === GOLDEN GOAL === */
  .goal-complete {
    background: rgba(255, 215, 0, 0.25) !important;
    box-shadow: 0 0 18px gold, inset 0 0 12px rgba(255,215,0,0.6);
    border: 1px solid gold;
  }

  .goal-fill-complete {
    background: gold !important;
    box-shadow: 0 0 25px gold;
  }

  .goal-text-glow {
    color: #fff !important;
    font-size: 1.2rem;
    text-shadow: 0 0 12px gold, 0 0 22px gold;
  }

  .goal-wave {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%) scale(1);
    background: radial-gradient(circle, gold 20%, transparent 60%);
    border-radius: 50%;
    opacity: 0.9;
    animation: waveExpand 1.2s ease-out forwards;
  }

  @keyframes waveExpand {
    0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.8; }
    50% { transform: translate(-50%, -50%) scale(2.2); opacity: 0.5; }
    100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
  }

  /* === CONFETTI LAYER === */
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
    animation-name: confettiFall;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
  }

  @keyframes confettiFall {
    0% {
      opacity: 1;
      transform: translateY(0vh) rotateZ(0deg);
    }
    100% {
      opacity: 0;
      transform: translateY(110vh) rotateZ(360deg);
    }
  }

  .hidden { opacity: 0; }
  .fade-in { opacity: 1 !important; transform: translateY(0) scale(1) !important; }
`;
document.head.appendChild(style);
