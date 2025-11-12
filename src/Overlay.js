// === HIGHSTATS OVERLAY ===
// autor: @hyghman edition 💚
// afiseaza numarul de followers si ultimul follower de pe Kick

const params = new URLSearchParams(window.location.search);
const username = params.get("user") || "hyghman";
const color = params.get("color") || "#00ffaa";
const font = params.get("font") || "Poppins";

document.body.style.setProperty("--main-color", color);
document.body.style.fontFamily = font;

// === STRUCTURA HTML ===
document.body.innerHTML = `
  <div class="overlay-container">
    <div class="channel-info">
      <img class="channel-avatar" src="" alt="Avatar" />
      <div class="details">
        <h2 class="username">Loading...</h2>
        <p class="followers-count">Followers: <strong>0</strong></p>
      </div>
    </div>

    <div class="last-follower">
      <img class="last-follower-pfp" src="" alt="Follower" />
      <span>Last Follower:</span>
      <strong>Loading...</strong>
    </div>
  </div>
`;

// === ELEMENTE ===
const avatar = document.querySelector(".channel-avatar");
const usernameEl = document.querySelector(".username");
const followersEl = document.querySelector(".followers-count strong");
const lastFollowerPfp = document.querySelector(".last-follower-pfp");
const lastFollowerName = document.querySelector(".last-follower strong");

// === FUNCTII DE FETCH ===
async function fetchChannelInfo() {
  try {
    const res = await fetch(`/api/channel-info?user=${username}`);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Kick API error");

    avatar.src = data.avatar || "https://cdn.kick.com/images/default-avatar.png";
    usernameEl.textContent = data.username;
    followersEl.textContent = data.followers ?? 0;
  } catch (err) {
    console.warn("❌ Eroare la channel-info:", err.message);
    usernameEl.textContent = "Channel Not Found";
    followersEl.textContent = "N/A";
  }
}

async function fetchLastFollower() {
  try {
    const res = await fetch(`/api/last-follower?user=${username}`);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Kick API error");

    lastFollowerPfp.src = data.avatar || "https://cdn.kick.com/images/default-avatar.png";
    lastFollowerName.textContent = data.username;
  } catch (err) {
    console.warn("❌ Eroare la last-follower:", err.message);
    lastFollowerName.textContent = "N/A";
  }
}

// === ACTUALIZARE PERIODICA ===
async function refreshOverlay() {
  await Promise.all([fetchChannelInfo(), fetchLastFollower()]);
}

// Prima încărcare
refreshOverlay();

// Actualizare la fiecare 10 secunde
setInterval(refreshOverlay, 10000);

// === ANIMATII DE EFECT ===
const style = document.createElement("style");
style.textContent = `
  body {
    background: transparent;
    color: white;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: "${font}", sans-serif;
    text-align: center;
    overflow: hidden;
  }

  .overlay-container {
    animation: fadeIn 0.8s ease-in-out;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .channel-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .channel-avatar {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    border: 3px solid var(--main-color);
    box-shadow: 0 0 10px var(--main-color);
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .channel-avatar:hover {
    transform: scale(1.05);
  }

  .details {
    text-align: left;
  }

  .username {
    margin: 0;
    font-size: 1.5rem;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  }

  .followers-count {
    font-size: 1rem;
    opacity: 0.9;
  }

  .last-follower {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
    transition: transform 0.3s ease, filter 0.3s ease;
  }

  .last-follower-pfp {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--main-color);
    filter: drop-shadow(0 0 6px var(--main-color));
    object-fit: cover;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .last-follower:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 10px var(--main-color));
  }

  .last-follower:hover .last-follower-pfp {
    transform: scale(1.1);
    box-shadow: 0 0 16px var(--main-color);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
