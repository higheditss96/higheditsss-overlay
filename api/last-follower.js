export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  try {
    const url = `https://kickapi.su/api/v2/channels/${username}/followers?limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HighStatsOverlay/1.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Kick API request failed" });
    }

    const data = await response.json();

    if (!data?.data?.length) {
      return res.status(404).json({ error: "No followers found" });
    }

    const last = data.data[0].follower;
    res.status(200).json({
      username: last.username,
      avatar: last.profile_pic,
      followed_at: data.data[0].created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
