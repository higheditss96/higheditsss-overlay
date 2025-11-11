// /api/last-follower.js
export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  try {
    // 1️⃣ Verificăm dacă streamerul e live folosind mirror Kick API
    const streamRes = await fetch(`https://kickapi.milkyway.dev/v2/streams/${user}`);

    if (!streamRes.ok) {
      console.warn(`⚠️ Stream check failed for ${user}: ${streamRes.status}`);
      return res.status(200).json([]);
    }

    const streamData = await streamRes.json();

    // dacă nu e live
    if (!streamData.livestream || !streamData.livestream.is_live) {
      console.log(`💤 ${user} nu este live — returnăm gol`);
      return res.status(200).json([]);
    }

    console.log(`✅ ${user} este LIVE — căutăm ultimul follower...`);

    // 2️⃣ Căutăm ultimul follower din mirror Kick API
    const followersRes = await fetch(
      `https://kickapi.milkyway.dev/v1/channels/${user}/followers?limit=1`
    );

    if (!followersRes.ok) {
      console.warn(`⚠️ Follower fetch failed: ${followersRes.status}`);
      return res.status(200).json([]);
    }

    const data = await followersRes.json();

    // dacă lista e goală → returnăm nimic
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ Kick mirror nu a returnat followers.");
      return res.status(200).json([]);
    }

    // ✅ returnăm ultimul follower real
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Kick mirror API error:", err);
    return res.status(500).json({ error: "Kick mirror request failed" });
  }
}
