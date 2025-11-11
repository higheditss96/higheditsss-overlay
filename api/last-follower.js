// /api/last-follower.js
export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  try {
    // cerem de la Kick ultimul follower public
    const response = await fetch(
      `https://kick.com/api/v1/channels/${user}/followers?limit=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HighStatsOverlay/1.0)"
        }
      }
    );

    const text = await response.text();

    // dacă Kick răspunde cu HTML, trimitem gol (nu JSON)
    if (text.startsWith("<!DOCTYPE")) {
      console.warn("⚠️ Kick API a trimis HTML în loc de JSON");
      return res.status(200).json([]);
    }

    const data = JSON.parse(text);

    // dacă nu e listă sau e goală, returnăm gol
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ Kick API nu a returnat followers.");
      return res.status(200).json([]);
    }

    // returnăm exact lista Kick (de obicei cu un singur element)
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Kick API error:", err);
    return res.status(500).json({ error: "Kick API request failed" });
  }
}
