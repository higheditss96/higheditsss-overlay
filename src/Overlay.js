// === HIGHSTATS OVERLAY (minimal version) ===
// Arată doar poza, numărul de followers și ultimul follower (real)

const params = new URLSearchParams(window.location.search);
const username = params.get("user") || "hyghman";
const color = params.get("color") || "#00ffaa";
const font = params.get("font") || "Poppins";

document.body.style.setProperty("--main-color", color);
document.body.style.fontFamily = font;
document.body.innerHTML = `
  <div class="overlay">
    <img id="pfp" class="pfp" src="" alt="Profile Picture">
    <div id="followers" class="followers-count">0</div>
    <div id="last-follower" class="last-follower">
      <img class="last-follower-pfp" src="" alt="Follower">
      <span>Last Follower:</span>
      <strong>N/A</strong>
    </div>
  </div>
`;

// === Elemente HTML ===
const pfp = document.getElementById("pfp");
const followersEl = document.getElementById("followers");
const lastFollowerName = document.querySelector(".last-follower strong");
const lastFollowerPfp = document.querySelector(".last-follower-pfp");

// === Actualizare follower count ===
async function fetchFollowers() {
  try {
    const res = await fetch(`https://kickapi.su/api/v2/channels/${username}`);
    const data = await res.json();

    if (!data?.followersCount) throw new Error("No follower count found");

    pfp.src = data.user.profile_pic || "https://cdn.kick.com/images/default-avatar.png";
    followersEl.textContent = data.followersCount.toLocaleString("en-US");
  } catch (err) {
    console.warn("❌ Kick followers error:", err);
    followersEl.textContent = "0";
  }
}

// === Ultimul follower ===
async function fetchLastFollower() {
  try {
    const res = await fetch(`/api/last-follower?user=${username}`);
    const data = await res.json();

    if (!data?.username) {
      lastFollowerName.textContent = "N/A";
      lastFollowerPfp.src = "https://cdn.kick.com/images/default-avatar.png";
      return;
    }

    lastFollowerName.textContent = data.username;
    lastFollowerPfp.src = data.avatar || "https://cdn.kick.com/images/default-avatar.png";
  } catch (err) {
    console.warn("❌ Kick last follower error:", err);
    lastFollowerName.textContent = "N/A";
  }
}

// === Refresh automat ===
async function refresh() {
  await Promise.all([fetchFollowers(), fetchLastFollower()]);
}
refresh();
setInterval(refresh, 10000);

// === Stiluri integrate ===
const style = document.createElement("style");
style.textContent = `
  body {
    background: transparent;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
    text-align: center;
    font-family: "${font}", sans-serif;
  }

  .overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .pfp {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    border: 3px solid var(--main-color);
    box-shadow: 0 0 15px var(--main-color);
    object-fit: cover;
  }

  .followers-count {
    font-size: 3.5rem;
    font-weight: bold;
    color: #222;
    background: rgba(255, 255, 255, 0.6);
    padding: 8px 24px;
    border-radius: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  .last-follower {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 5px rgba(0,0,0,0.4);
  }

  .last-follower-pfp {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid var(--main-color);
    object-fit: cover;
    filter: drop-shadow(0 0 6px var(--main-color));
  }

  @media (max-width: 768px) {
    .pfp { width: 80px; height: 80px; }
    .followers-count { font-size: 2.2rem; }
    .last-follower { font-size: 0.9rem; }
  }
`;
document.head.appendChild(style);
