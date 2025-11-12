export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) return res.status(400).json({ error: "Missing ?user parameter" });

  try {
    const response = await fetch(`https://kickapi.su/api/v2/channels/${username}/followers?limit=1`);
    if (!response.ok) throw new Error("Kick API request failed");

    const data = await response.json();
    if (!data?.data?.length) return res.status(404).json({ error: "No followers found" });

    const follower = data.data[0].follower;
    res.status(200).json({
      username: follower.username,
      avatar: follower.profile_pic,
      followed_at: data.data[0].created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
