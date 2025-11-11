export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  try {
    // 🟢 Mirror public pentru API Kick (funcționează stabil)
    const kickMirror = `https://kickapi.su/api/v2/channels/${username}/followers?limit=1`;

    const response = await fetch(kickMirror, {
      headers: {
        "User-Agent": "HighStatsOverlay/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Kick mirror request failed" });
    }

    const data = await response.json();

    if (!data || !data.data || !data.data.length) {
      return res.status(404).json({ error: "No followers found" });
    }

    const lastFollower = data.data[0];
    return res.status(200).json({
      username: lastFollower.follower.username,
      avatar: lastFollower.follower.profile_pic || null,
      followed_at: lastFollower.created_at,
    });
  } catch (error) {
    console.error("Error fetching last follower:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
