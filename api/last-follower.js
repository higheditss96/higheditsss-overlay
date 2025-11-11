// /api/last-follower.js
export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  try {
    // 1️⃣ Verificăm dacă streamerul e LIVE
    const streamRes = await fetch(`https://kick.com/api/v2/streams/${user}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HighStatsOverlay/1.0)"
      }
    });

    if (!streamRes.ok) {
      console.warn(`⚠️ Stream check failed for ${user}: ${streamRes.status}`);
      return res.status(200).json([]);
    }

    const streamData = await streamRes.json();

    // dacă nu e live → returnăm gol
    if (!streamData.livestream || !streamData.livestream.is_live) {
      console.log(`💤 ${user} nu este live — nu returnăm followers.`);
      return res.status(200).json([]);
    }

    console.log(`✅ ${user} este LIVE — căutăm ultimul follower...`);

    // 2️⃣ Căutăm ultimul follower doar dacă e live
    const followersRes = await fetch(
      `https://kick.com/api/v1/channels/${user}/followers?limit=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HighStatsOverlay/1.0)"
        }
      }
    );

    const text = await followersRes.text();

    // dacă Kick trimite HTML (nu JSON)
    if (text.startsWith("<!DOCTYPE")) {
      console.warn("⚠️ Kick a trimis HTML — returnăm gol.");
      return res.status(200).json([]);
    }

    const data = JSON.parse(text);

    // dacă lista e goală → returnăm nimic
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ Kick API nu a returnat followers.");
      return res.status(200).json([]);
    }

    // ✅ returnăm ultimul follower real
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Kick API error:", err);
    return res.status(500).json({ error: "Kick API request failed" });
  }
}
