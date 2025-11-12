export default async function handler(req, res) {
  const user = req.query.user;
  if (!user) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  try {
    const response = await fetch(`https://kickapi.su/api/v2/channels/${user}/followers?limit=1`, {
      headers: {
        "User-Agent": "HighStatsOverlay/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Kick API request failed");
    }

    const data = await response.json();

    // dacă nu există niciun follower
    if (!data?.data?.length) {
      return res.status(200).json({
        username: null,
        avatar: null,
        followed_at: null,
        message: "No followers yet",
      });
    }

    const follower = data.data[0].follower;

    return res.status(200).json({
      username: follower.username,
      avatar: follower.profile_pic,
      followed_at: data.data[0].created_at,
    });
  } catch (error) {
    console.error("Kick API Error:", error);
    return res.status(500).json({ error: "Failed to fetch from Kick API" });
  }
}
