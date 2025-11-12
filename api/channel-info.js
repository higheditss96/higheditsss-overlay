export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) return res.status(400).json({ error: "Missing ?user parameter" });

  try {
    const response = await fetch(`https://kickapi.su/api/v2/channels/${username}`);
    if (!response.ok) throw new Error("Kick API request failed");

    const data = await response.json();

    res.status(200).json({
      username: data.user.username,
      displayname: data.user.username,
      avatar: data.user.profile_pic,
      bio: data.user.bio,
      category: data.livestream?.categories?.[0]?.name ?? "Offline",
      is_live: !!data.livestream,
      title: data.livestream?.session_title ?? null,
      viewers: data.livestream?.viewers ?? 0,
      followers: data.followers_count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
