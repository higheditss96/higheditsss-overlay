// /api/last-follower.js
export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  try {
    // 1️⃣ Verificăm dacă streamerul e live
    const liveCheck = await fetch(`https://kick.com/api/v2/channels/${user}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HighStatsOverlay/1.0)"
      }
    });

    const channelData = await liveCheck.json();

    const isLive =
      channelData?.livestream?.is_live ||
      channelData?.is_live ||
      channelData?.livestream_status === "live";

    if (!isLive) {
      console.log(`💤 ${user} nu este live — returnăm gol`);
      return res.status(200).json([]);
    }

    console.log(`✅ ${user} este LIVE — căutăm ultimul follower...`);

    // 2️⃣ Proxy pentru followers (folosim AllOrigins pentru a ocoli restricțiile Kick)
    const proxyURL = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://kick.com/api/v1/channels/${user}/followers?limit=1`
    )}`;

    const followersRes = await fetch(proxyURL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HighStatsOverlay/1.0)"
      }
    });

    const text = await followersRes.text();

    // dacă Kick trimite HTML, returnăm gol
    if (text.startsWith("<!DOCTYPE")) {
      console.warn("⚠️ Kick a răspuns cu HTML — returnăm gol.");
      return res.status(200).json([]);
    }

    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ Niciun follower găsit.");
      return res.status(200).json([]);
    }

    // ✅ Returnăm follower real
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Eroare Kick API:", err);
    return res.status(500).json({ error: "Kick proxy request failed" });
  }
}
