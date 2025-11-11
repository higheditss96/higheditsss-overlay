export default async function handler(req, res) {
  const { user } = req.query;
  if (!user) return res.status(400).json({ error: "Missing ?user" });

  try {
    const token = process.env.KICK_ACCESS_TOKEN;

    const followersRes = await fetch(
      `https://kick.com/api/v1/channels/${user}/followers?limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "HighStatsOverlay/1.0",
        },
      }
    );

    if (!followersRes.ok) {
      return res.status(followersRes.status).json({
        error: "Kick API request failed",
        status: followersRes.status,
      });
    }

    const data = await followersRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Kick API error:", err);
    return res.status(500).json({ error: "Kick API failed" });
  }
}
